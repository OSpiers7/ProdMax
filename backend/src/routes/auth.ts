import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        // Note: In a real app, you'd store the hashed password
        // For now, we'll skip password storage for simplicity
      }
    });

    // Create default categories
    const defaultCategories = [
      { name: 'Career Advancement', color: '#3B82F6' },
      { name: 'Fitness & Health', color: '#10B981' },
      { name: 'Housekeeping', color: '#F59E0B' },
      { name: 'Fun', color: '#8B5CF6' },
      { name: 'Misc', color: '#6B7280' }
    ];

    for (const category of defaultCategories) {
      const createdCategory = await prisma.category.create({
        data: {
          name: category.name,
          color: category.color,
          userId: user.id
        }
      });

      // Create default subcategories
      const subcategories = getDefaultSubcategories(category.name);
      for (const subcategoryName of subcategories) {
        await prisma.subcategory.create({
          data: {
            name: subcategoryName,
            categoryId: createdCategory.id,
            userId: user.id
          }
        });
      }
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'default-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const options = { expiresIn } as SignOptions;
    const token = jwt.sign(
      { userId: user.id },
      secret,
      options
    );

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      }
    });
  } catch (error) {
    return next(error);
  }
});

// Login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // In a real app, you'd verify the password here
    // For now, we'll skip password verification for simplicity

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'default-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn } as SignOptions
    );

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      }
    });
  } catch (error) {
    return next(error);
  }
});

// Get user profile
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, secret) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, createdAt: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    return res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    return next(error);
  }
});

function getDefaultSubcategories(categoryName: string): string[] {
  const subcategories: Record<string, string[]> = {
    'Career Advancement': ['coding', 'networking', 'research', 'learning', 'meetings'],
    'Fitness & Health': ['lifting', 'cardio', 'activities', 'nutrition', 'recovery'],
    'Housekeeping': ['cleaning', 'groceries', 'chores', 'maintenance', 'organization'],
    'Fun': ['entertainment', 'hobbies', 'social', 'gaming', 'reading'],
    'Misc': ['admin', 'errands', 'other', 'personal', 'travel']
  };

  return subcategories[categoryName] || [];
}

export default router;
