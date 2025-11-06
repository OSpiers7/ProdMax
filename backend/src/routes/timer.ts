import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const startTimerSchema = z.object({
  taskId: z.string(),
  duration: z.number().min(1).max(180).optional() // 1-180 minutes, default 90
});

// Start timer session
router.post('/start', async (req: any, res, next) => {
  try {
    const { taskId, duration = 90 } = startTimerSchema.parse(req.body);

    // Verify task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: req.user.id },
      include: { category: true, subcategory: true }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if there's already an active timer for this user
    const activeTimer = await prisma.timeSession.findFirst({
      where: {
        userId: req.user.id,
        isActive: true
      }
    });

    if (activeTimer) {
      return res.status(400).json({
        success: false,
        error: 'There is already an active timer session'
      });
    }

    // Create new timer session
    const timerSession = await prisma.timeSession.create({
      data: {
        taskId,
        startTime: new Date(),
        duration,
        isActive: true,
        isBreak: false,
        userId: req.user.id
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

    return res.status(201).json({
      success: true,
      data: timerSession
    });
  } catch (error) {
    return next(error);
  }
});

// Pause timer session
router.put('/pause/:id', async (req: any, res, next) => {
  try {
    const timerSession = await prisma.timeSession.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!timerSession) {
      return res.status(404).json({
        success: false,
        error: 'Active timer session not found'
      });
    }

    const updatedSession = await prisma.timeSession.update({
      where: { id: req.params.id },
      data: {
        isActive: false,
        endTime: new Date()
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

    return res.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    return next(error);
  }
});

// Stop timer session
router.put('/stop/:id', async (req: any, res, next) => {
  try {
    const timerSession = await prisma.timeSession.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!timerSession) {
      return res.status(404).json({
        success: false,
        error: 'Timer session not found'
      });
    }

    const endTime = new Date();
    const actualDuration = Math.floor((endTime.getTime() - timerSession.startTime.getTime()) / (1000 * 60)); // minutes

    const updatedSession = await prisma.timeSession.update({
      where: { id: req.params.id },
      data: {
        isActive: false,
        endTime,
        duration: actualDuration
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

    return res.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    return next(error);
  }
});

// Get active timer session
router.get('/active', async (req: any, res, next) => {
  try {
    const activeTimer = await prisma.timeSession.findFirst({
      where: {
        userId: req.user.id,
        isActive: true
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

    return res.json({
      success: true,
      data: activeTimer
    });
  } catch (error) {
    return next(error);
  }
});

// Get timer history
router.get('/history', async (req: any, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const timerSessions = await prisma.timeSession.findMany({
      where: { userId: req.user.id },
      include: {
        task: {
          include: {
            category: true,
            subcategory: true
          }
        }
      },
      orderBy: { startTime: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    return res.json({
      success: true,
      data: timerSessions
    });
  } catch (error) {
    return next(error);
  }
});

// Start break session
router.post('/break/:id', async (req: any, res, next) => {
  try {
    const { duration = 15 } = req.body; // Default 15 minute break

    // Find the completed work session
    const workSession = await prisma.timeSession.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
        isActive: false
      }
    });

    if (!workSession) {
      return res.status(404).json({
        success: false,
        error: 'Work session not found or still active'
      });
    }

    // Create break session
    const breakSession = await prisma.timeSession.create({
      data: {
        taskId: workSession.taskId,
        startTime: new Date(),
        duration,
        isActive: true,
        isBreak: true,
        userId: req.user.id
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

    return res.status(201).json({
      success: true,
      data: breakSession
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
