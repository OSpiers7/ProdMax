import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createEventSchema = z.object({
  taskId: z.string().optional().nullable(),
  title: z.string(),
  subtasks: z.array(z.string()).optional(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  isFocusSession: z.boolean().optional()
});

const updateEventSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  isFocusSession: z.boolean().optional(),
  taskId: z.string().optional().nullable()
});

// Get calendar events for a date range
router.get('/events', async (req: any, res, next) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: 'Start and end dates are required'
      });
    }

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: req.user.id,
        start: {
          gte: new Date(start as string)
        },
        end: {
          lte: new Date(end as string)
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

    // Parse subtasks JSON to array for each event
    const eventsWithParsedSubtasks = events.map(event => ({
      ...event,
      subtasks: event.subtasks ? JSON.parse(event.subtasks) : []
    }));

    return res.json({
      success: true,
      data: eventsWithParsedSubtasks
    });
  } catch (error) {
    return next(error);
  }
});

// Get calendar events for a specific date
router.get('/events/:date', async (req: any, res, next) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: req.user.id,
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
router.post('/events', async (req: any, res, next) => {
  try {
    console.log('Received calendar event request:', req.body);
    console.log('User ID:', req.user?.id);
    
    const { taskId, title, subtasks, start, end, isFocusSession = false } = createEventSchema.parse(req.body);

    let task = null;
    let eventTitle = title;
    let eventSubtasks: string[] | null = null;

    // If taskId is provided, verify task exists and belongs to user
    if (taskId) {
      task = await prisma.task.findFirst({
        where: { id: taskId, userId: req.user.id },
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
      userId: req.user.id
    });

    const event = await prisma.calendarEvent.create({
      data: {
        taskId: taskId || null,
        title: eventTitle,
        start: new Date(start),
        end: new Date(end),
        subtasks: subtasksJson,
        isFocusSession,
        userId: req.user.id
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
router.put('/events/:id', async (req: any, res, next) => {
  try {
    const { start, end, isFocusSession, taskId } = updateEventSchema.parse(req.body);

    // Check if event exists and belongs to user
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // If taskId is provided, verify it belongs to user
    if (taskId !== undefined) {
      if (taskId) {
        const task = await prisma.task.findFirst({
          where: { id: taskId, userId: req.user.id }
        });
        if (!task) {
          return res.status(404).json({
            success: false,
            error: 'Task not found'
          });
        }
      }
    }

    const event = await prisma.calendarEvent.update({
      where: { id: req.params.id },
      data: {
        ...(start && { start: new Date(start) }),
        ...(end && { end: new Date(end) }),
        ...(isFocusSession !== undefined && { isFocusSession }),
        ...(taskId !== undefined && { taskId: taskId || null })
      },
      include: {
        task: {
          include: {
            category: true,
            subcategory: true
          }
        }
      }
    });

    // Parse subtasks JSON to array
    const eventResponse = {
      ...event,
      subtasks: event.subtasks ? JSON.parse(event.subtasks) : []
    };

    return res.json({
      success: true,
      data: eventResponse
    });
  } catch (error) {
    return next(error);
  }
});

// Delete calendar event
router.delete('/events/:id', async (req: any, res, next) => {
  try {
    const event = await prisma.calendarEvent.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

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
router.get('/week/:date', async (req: any, res, next) => {
  try {
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
        userId: req.user.id,
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
