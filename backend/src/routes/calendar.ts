import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { parseRecurrenceRule, generateRecurringEventDates, type RecurrenceRule } from '../utils/recurrence';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createEventSchema = z.object({
  taskId: z.string().optional().nullable(),
  title: z.string(),
  subtasks: z.array(z.string()).optional(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  isFocusSession: z.boolean().optional(),
  recurrenceRule: z.string().optional().nullable(), // e.g., "DAILY", "WEEKLY", "WEEKLY:MO,WE,FR"
  recurrenceEndDate: z.string().datetime().optional().nullable()
});

const updateEventSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  isFocusSession: z.boolean().optional(),
  taskId: z.string().optional().nullable(),
  title: z.string().optional(),
  subtasks: z.array(z.string()).optional(),
  updateAllInstances: z.boolean().optional() // If true, update all future instances
});

// Get calendar events for a date range
router.get('/events', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: 'Start and end dates are required'
      });
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    // Get all events (including parent recurring events and instances)
    // We need to find:
    // 1. Regular events that fall within the date range
    // 2. Parent recurring events that could generate instances in this range
    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: req.user!.id,
        OR: [
          // Regular events (non-recurring) that start within the range
          {
            AND: [
              { recurrenceRule: null },
              { start: { gte: startDate } },
              { start: { lte: endDate } }
            ]
          },
          // Parent recurring events (not instances) that could generate instances in range
          {
            AND: [
              { recurrenceRule: { not: null } },
              { parentEventId: null },
              { isRecurringInstance: false },
              // Parent event starts before or during the range
              { start: { lte: endDate } },
              // And either has no end date, or end date is after range start
              {
                OR: [
                  { recurrenceEndDate: null },
                  { recurrenceEndDate: { gte: startDate } }
                ]
              }
            ]
          }
        ]
      },
      include: {
        task: {
          include: {
            category: true,
            subcategory: true
          }
        },
        parentEvent: true
      },
      orderBy: { start: 'asc' }
    });

    // Generate recurring instances for parent events
    const allEvents: any[] = [];
    
    for (const event of events) {
      // If it's a recurring parent event, generate instances
      if (event.recurrenceRule && !event.isRecurringInstance && !event.parentEventId) {
        const recurrenceRule = parseRecurrenceRule(event.recurrenceRule);
        if (recurrenceRule) {
          // Set end date if provided
          if (event.recurrenceEndDate) {
            recurrenceRule.endDate = new Date(event.recurrenceEndDate);
          } else {
            // Default to 1 year from now if no end date
            recurrenceRule.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
          }
          
          console.log(`Generating instances for recurring event ${event.id}:`, {
            rule: event.recurrenceRule,
            start: event.start,
            endDate: recurrenceRule.endDate,
            queryRange: { start: startDate, end: endDate }
          });
          
          const instances = generateRecurringEventDates(
            new Date(event.start),
            new Date(event.end),
            recurrenceRule,
            200 // Max instances
          );

          console.log(`Generated ${instances.length} total instances`);

          // Filter instances that fall within the requested date range
          const validInstances = instances.filter(instance => {
            const instanceStart = new Date(instance.start);
            return instanceStart >= startDate && instanceStart <= endDate;
          });

          console.log(`Filtered to ${validInstances.length} instances in date range`);

          // Create event objects for each instance
          for (const instance of validInstances) {
            allEvents.push({
              ...event,
              id: `${event.id}_${instance.start.getTime()}`, // Unique ID for instance
              start: instance.start,
              end: instance.end,
              isRecurringInstance: true,
              parentEventId: event.id,
              subtasks: event.subtasks ? JSON.parse(event.subtasks) : []
            });
          }
        } else {
          console.warn(`Failed to parse recurrence rule: ${event.recurrenceRule}`);
        }
      } else if (!event.isRecurringInstance) {
        // Regular event (not recurring, not an instance)
        allEvents.push({
          ...event,
          subtasks: event.subtasks ? JSON.parse(event.subtasks) : []
        });
      }
      // Skip if it's already a recurring instance (shouldn't happen with current query)
    }

    // Remove duplicates and sort
    const uniqueEvents = Array.from(
      new Map(allEvents.map(event => [event.id, event])).values()
    ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return res.json({
      success: true,
      data: uniqueEvents
    });
  } catch (error) {
    return next(error);
  }
});

// Get calendar events for a specific date
router.get('/events/:date', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.params.date) {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required'
      });
    }
    const date = new Date(req.params.date);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: req.user!.id,
        start: {
          gte: startOfDay
        },
        end: {
          lte: endOfDay
        }
      },
      include: {
        task: {
          include: {
            category: true,
            subcategory: true
          }
        }
      },
      orderBy: { start: 'asc' }
    });

    return res.json({
      success: true,
      data: events
    });
  } catch (error) {
    return next(error);
  }
});

// Create calendar event
router.post('/events', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Received calendar event request:', req.body);
    console.log('User ID:', req.user?.id);
    
    const { 
      taskId, 
      title, 
      subtasks, 
      start, 
      end, 
      isFocusSession = false,
      recurrenceRule,
      recurrenceEndDate
    } = createEventSchema.parse(req.body);

    let task = null;
    let eventTitle = title;
    let eventSubtasks: string[] | null = null;

    // If taskId is provided, verify task exists and belongs to user
    if (taskId) {
      task = await prisma.task.findFirst({
        where: { id: taskId, userId: req.user!.id },
        include: { category: true, subcategory: true }
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      eventTitle = task.title;
      // Use task subtasks if available
      eventSubtasks = task.subtasks ? JSON.parse(task.subtasks) : null;
    } else if (subtasks && subtasks.length > 0) {
      // Use provided subtasks if no taskId
      eventSubtasks = subtasks;
    }

    // Convert subtasks array to JSON string
    const subtasksJson = eventSubtasks && eventSubtasks.length > 0 ? JSON.stringify(eventSubtasks) : null;

    console.log('Creating calendar event with data:', {
      taskId: taskId || null,
      title: eventTitle,
      start: new Date(start),
      end: new Date(end),
      subtasks: subtasksJson,
      isFocusSession,
      recurrenceRule,
      recurrenceEndDate,
      userId: req.user!.id
    });

    // Create the parent event (or single event if not recurring)
    const event = await prisma.calendarEvent.create({
      data: {
        taskId: taskId || null,
        title: eventTitle,
        start: new Date(start),
        end: new Date(end),
        subtasks: subtasksJson,
        isFocusSession,
        recurrenceRule: recurrenceRule || null,
        recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
        userId: req.user!.id
      },
      include: {
        task: task ? {
          include: {
            category: true,
            subcategory: true
          }
        } : false
      }
    });

    // Parse subtasks JSON to array for response
    const eventResponse = {
      ...event,
      subtasks: event.subtasks ? JSON.parse(event.subtasks) : []
    };

    console.log('Calendar event created successfully:', eventResponse);

    return res.status(201).json({
      success: true,
      data: eventResponse
    });
  } catch (error) {
    return next(error);
  }
});

// Update calendar event
router.put('/events/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { start, end, isFocusSession, taskId, title, subtasks, updateAllInstances } = updateEventSchema.parse(req.body);

    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required'
      });
    }
    
    // Check if event exists and belongs to user
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // If this is a recurring instance and updateAllInstances is true, update the parent
    const eventToUpdate = existingEvent.parentEventId && updateAllInstances
      ? await prisma.calendarEvent.findFirst({
          where: { id: existingEvent.parentEventId, userId: req.user!.id }
        })
      : existingEvent;

    if (!eventToUpdate) {
      return res.status(404).json({
        success: false,
        error: 'Parent event not found'
      });
    }

    // If taskId is provided, verify it belongs to user
    if (taskId !== undefined) {
      if (taskId) {
        const task = await prisma.task.findFirst({
          where: { id: taskId, userId: req.user!.id }
        });
        if (!task) {
          return res.status(404).json({
            success: false,
            error: 'Task not found'
          });
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      ...(start && { start: new Date(start) }),
      ...(end && { end: new Date(end) }),
      ...(isFocusSession !== undefined && { isFocusSession }),
      ...(taskId !== undefined && { taskId: taskId || null }),
      ...(title && { title }),
      ...(subtasks && { subtasks: JSON.stringify(subtasks) })
    };

    // If updating all instances, update the parent event
    if (updateAllInstances && eventToUpdate.recurrenceRule) {
      const event = await prisma.calendarEvent.update({
        where: { id: eventToUpdate.id },
        data: updateData,
        include: {
          task: {
            include: {
              category: true,
              subcategory: true
            }
          }
        }
      });

      const eventResponse = {
        ...event,
        subtasks: event.subtasks ? JSON.parse(event.subtasks) : []
      };

      return res.json({
        success: true,
        data: eventResponse,
        message: 'All future instances updated'
      });
    } else {
      // Update single event (or create exception for recurring event)
      const event = await prisma.calendarEvent.update({
        where: { id: existingEvent.id },
        data: updateData,
        include: {
          task: {
            include: {
              category: true,
              subcategory: true
            }
          }
        }
      });

      const eventResponse = {
        ...event,
        subtasks: event.subtasks ? JSON.parse(event.subtasks) : []
      };

      return res.json({
        success: true,
        data: eventResponse
      });
    }
  } catch (error) {
    return next(error);
  }
});

// Delete calendar event
router.delete('/events/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required'
      });
    }

    const { deleteAllInstances } = req.query;
    const shouldDeleteAll = deleteAllInstances === 'true';

    const event = await prisma.calendarEvent.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // If deleting all instances of a recurring event, delete the parent
    if (shouldDeleteAll && event.recurrenceRule && !event.parentEventId) {
      // Delete parent and all child instances
      await prisma.calendarEvent.deleteMany({
        where: {
          OR: [
            { id: event.id },
            { parentEventId: event.id }
          ],
          userId: req.user!.id
        }
      });

      return res.json({
        success: true,
        message: 'All instances of recurring event deleted successfully'
      });
    } else if (event.parentEventId && shouldDeleteAll) {
      // Delete parent and all instances
      const parentEvent = await prisma.calendarEvent.findFirst({
        where: { id: event.parentEventId, userId: req.user!.id }
      });

      if (parentEvent) {
        await prisma.calendarEvent.deleteMany({
          where: {
            OR: [
              { id: parentEvent.id },
              { parentEventId: parentEvent.id }
            ],
            userId: req.user!.id
          }
        });

        return res.json({
          success: true,
          message: 'All instances of recurring event deleted successfully'
        });
      }
    }

    // Delete single event
    await prisma.calendarEvent.delete({
      where: { id: req.params.id }
    });

    return res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
});

// Get weekly view data
router.get('/week/:date', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.params.date) {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required'
      });
    }
    const date = new Date(req.params.date);
    
    // Get start of week (Monday)
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get end of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: req.user!.id,
        start: {
          gte: startOfWeek
        },
        end: {
          lte: endOfWeek
        }
      },
      include: {
        task: {
          include: {
            category: true,
            subcategory: true
          }
        }
      },
      orderBy: { start: 'asc' }
    });

    return res.json({
      success: true,
      data: {
        startOfWeek,
        endOfWeek,
        events
      }
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
