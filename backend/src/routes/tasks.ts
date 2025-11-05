import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1),
  subtasks: z.array(z.string()).optional(),
  categoryId: z.string(),
  subcategoryId: z.string().optional().nullable()
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  subtasks: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional().nullable()
});

// Get all tasks for user
router.get('/', async (req: any, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      include: {
        category: true,
        subcategory: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse subtasks JSON to array for each task
    const tasksWithParsedSubtasks = tasks.map(task => ({
      ...task,
      subtasks: task.subtasks ? JSON.parse(task.subtasks) : []
    }));

    res.json({
      success: true,
      data: tasksWithParsedSubtasks
    });
  } catch (error) {
    next(error);
  }
});

// Get single task
router.get('/:id', async (req: any, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        category: true,
        subcategory: true
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Parse subtasks JSON to array
    const taskResponse = {
      ...task,
      subtasks: task.subtasks ? JSON.parse(task.subtasks) : []
    };

    res.json({
      success: true,
      data: taskResponse
    });
  } catch (error) {
    next(error);
  }
});

// Create new task
router.post('/', async (req: any, res, next) => {
  try {
    const { title, subtasks, categoryId, subcategoryId } = createTaskSchema.parse(req.body);

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: req.user.id }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }

    // Verify subcategory if provided
    if (subcategoryId) {
      const subcategory = await prisma.subcategory.findFirst({
        where: { id: subcategoryId, userId: req.user.id, categoryId }
      });

      if (!subcategory) {
        return res.status(400).json({
          success: false,
          error: 'Invalid subcategory'
        });
      }
    }

    // Convert subtasks array to JSON string
    const subtasksJson = subtasks && subtasks.length > 0 ? JSON.stringify(subtasks) : null;

    const task = await prisma.task.create({
      data: {
        title,
        subtasks: subtasksJson,
        categoryId,
        subcategoryId: subcategoryId || null,
        userId: req.user.id
      },
      include: {
        category: true,
        subcategory: true
      }
    });

    // Parse subtasks JSON back to array for response
    const taskResponse = {
      ...task,
      subtasks: task.subtasks ? JSON.parse(task.subtasks) : []
    };

    res.status(201).json({
      success: true,
      data: taskResponse
    });
  } catch (error) {
    next(error);
  }
});

// Update task
router.put('/:id', async (req: any, res, next) => {
  try {
    const { title, subtasks, categoryId, subcategoryId } = updateTaskSchema.parse(req.body);

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Verify new category and subcategory if provided
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: req.user.id }
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category'
        });
      }
    }

    if (subcategoryId) {
      const subcategory = await prisma.subcategory.findFirst({
        where: { id: subcategoryId, userId: req.user.id, categoryId: categoryId || existingTask.categoryId }
      });

      if (!subcategory) {
        return res.status(400).json({
          success: false,
          error: 'Invalid subcategory'
        });
      }
    }

    // Convert subtasks array to JSON string if provided
    const updateData: any = {};
    if (title) updateData.title = title;
    if (subtasks !== undefined) {
      updateData.subtasks = subtasks && subtasks.length > 0 ? JSON.stringify(subtasks) : null;
    }
    if (categoryId) updateData.categoryId = categoryId;
    if (subcategoryId !== undefined) updateData.subcategoryId = subcategoryId || null;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        category: true,
        subcategory: true
      }
    });

    // Parse subtasks JSON to array
    const taskResponse = {
      ...task,
      subtasks: task.subtasks ? JSON.parse(task.subtasks) : []
    };

    res.json({
      success: true,
      data: taskResponse
    });
  } catch (error) {
    next(error);
  }
});

// Delete task
router.delete('/:id', async (req: any, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get categories and subcategories
router.get('/categories/all', async (req: any, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      include: {
        subcategories: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

export default router;
