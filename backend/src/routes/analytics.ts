import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get analytics for a specific period
router.get('/:period', async (req: any, res, next) => {
  try {
    const { period } = req.params;
    const { startDate, endDate } = req.query;

    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      const now = new Date();
      switch (period) {
        case 'week':
          start = new Date(now);
          start.setDate(now.getDate() - now.getDay() + 1); // Monday
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31);
          end.setHours(23, 59, 59, 999);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid period. Use: week, month, or year'
          });
      }
    }

    // Get time sessions for the period
    const timeSessions = await prisma.timeSession.findMany({
      where: {
        userId: req.user.id,
        startTime: {
          gte: start,
          lte: end
        },
        isActive: false // Only completed sessions
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

    // Calculate analytics
    const totalTime = timeSessions.reduce((sum, session) => sum + session.duration, 0);
    const focusSessions = timeSessions.filter(session => !session.isBreak).length;

    // Group by category
    const byCategory: Record<string, number> = {};
    const bySubcategory: Record<string, number> = {};

    timeSessions.forEach(session => {
      const categoryName = session.task.category.name;
      const subcategoryName = session.task.subcategory.name;
      
      byCategory[categoryName] = (byCategory[categoryName] || 0) + session.duration;
      bySubcategory[subcategoryName] = (bySubcategory[subcategoryName] || 0) + session.duration;
    });

    // Calculate productivity score (0-100)
    const productivityScore = calculateProductivityScore(timeSessions, totalTime);

    const analytics = {
      period,
      totalTime,
      byCategory,
      bySubcategory,
      focusSessions,
      productivityScore,
      startDate: start,
      endDate: end,
      sessions: timeSessions.length
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

// Get productivity trends
router.get('/trends/:period', async (req: any, res, next) => {
  try {
    const { period } = req.params;
    const { weeks = 12 } = req.query;

    const trends = [];
    const now = new Date();

    for (let i = parseInt(weeks as string) - 1; i >= 0; i--) {
      let start: Date;
      let end: Date;

      switch (period) {
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (now.getDay() + 7 * i) + 1);
          weekStart.setHours(0, 0, 0, 0);
          start = weekStart;
          end = new Date(weekStart);
          end.setDate(weekStart.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          break;
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          start = monthStart;
          end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          end.setHours(23, 59, 59, 999);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid period for trends'
          });
      }

      const timeSessions = await prisma.timeSession.findMany({
        where: {
          userId: req.user.id,
          startTime: { gte: start, lte: end },
          isActive: false
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

      const totalTime = timeSessions.reduce((sum, session) => sum + session.duration, 0);
      const focusSessions = timeSessions.filter(session => !session.isBreak).length;
      const productivityScore = calculateProductivityScore(timeSessions, totalTime);

      trends.push({
        period: period === 'week' ? `Week ${i + 1}` : `Month ${i + 1}`,
        startDate: start,
        endDate: end,
        totalTime,
        focusSessions,
        productivityScore,
        sessions: timeSessions.length
      });
    }

    res.json({
      success: true,
      data: trends.reverse() // Most recent first
    });
  } catch (error) {
    next(error);
  }
});

// Get category breakdown
router.get('/categories/:period', async (req: any, res, next) => {
  try {
    const { period } = req.params;
    const { startDate, endDate } = req.query;

    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      const now = new Date();
      switch (period) {
        case 'week':
          start = new Date(now);
          start.setDate(now.getDate() - now.getDay() + 1);
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31);
          end.setHours(23, 59, 59, 999);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid period'
          });
      }
    }

    const timeSessions = await prisma.timeSession.findMany({
      where: {
        userId: req.user.id,
        startTime: { gte: start, lte: end },
        isActive: false
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

    // Get all categories for the user
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      include: { subcategories: true }
    });

    const categoryBreakdown = categories.map(category => {
      const categorySessions = timeSessions.filter(
        session => session.task.categoryId === category.id
      );
      
      const totalTime = categorySessions.reduce((sum, session) => sum + session.duration, 0);
      const focusSessions = categorySessions.filter(session => !session.isBreak).length;

      // Subcategory breakdown
      const subcategoryBreakdown = category.subcategories.map(subcategory => {
        const subcategorySessions = categorySessions.filter(
          session => session.task.subcategoryId === subcategory.id
        );
        
        const subcategoryTime = subcategorySessions.reduce(
          (sum, session) => sum + session.duration, 0
        );

        return {
          id: subcategory.id,
          name: subcategory.name,
          totalTime: subcategoryTime,
          sessions: subcategorySessions.length
        };
      });

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        totalTime,
        focusSessions,
        sessions: categorySessions.length,
        subcategories: subcategoryBreakdown
      };
    });

    res.json({
      success: true,
      data: categoryBreakdown
    });
  } catch (error) {
    next(error);
  }
});

// Get calendar-based analytics for this week
router.get('/calendar/this-week', async (req: any, res, next) => {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay()); // Sunday
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    // Get calendar events for this week
    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: req.user.id,
        start: {
          gte: start,
          lte: end
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

    // Calculate duration in hours for each event
    const calculateHours = (eventStart: Date, eventEnd: Date): number => {
      const diffMs = eventEnd.getTime() - eventStart.getTime();
      return diffMs / (1000 * 60 * 60); // Convert to hours
    };

    // Group by category
    const byCategory: Record<string, number> = {};
    
    // Group by career advancement subcategories
    const careerSubcategories: Record<string, number> = {};

    events.forEach(event => {
      if (event.task && event.task.category) {
        const categoryName = event.task.category.name;
        const durationHours = calculateHours(event.start, event.end);
        
        // Add to category total
        byCategory[categoryName] = (byCategory[categoryName] || 0) + durationHours;

        // If it's Career Advancement, add to subcategory breakdown
        if (categoryName === 'Career Advancement' && event.task.subcategory) {
          const subcategoryName = event.task.subcategory.name;
          careerSubcategories[subcategoryName] = (careerSubcategories[subcategoryName] || 0) + durationHours;
        }
      }
    });

    res.json({
      success: true,
      data: {
        byCategory,
        careerSubcategories
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get weekly trends for a specific category
router.get('/calendar/trends/:category', async (req: any, res, next) => {
  try {
    // Decode the category name from URL
    const category = decodeURIComponent(req.params.category);
    const { weeks = 12 } = req.query;
    const numWeeks = parseInt(weeks as string);

    const trends = [];
    const now = new Date();

    // Find the category by name for the user
    const categoryRecord = await prisma.category.findFirst({
      where: {
        userId: req.user.id,
        name: category
      }
    });

    if (!categoryRecord) {
      return res.json({
        success: true,
        data: []
      });
    }

    for (let i = numWeeks - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + 7 * i)); // Sunday
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Get events for this week that belong to the category
      const events = await prisma.calendarEvent.findMany({
        where: {
          userId: req.user.id,
          start: {
            gte: weekStart,
            lte: weekEnd
          },
          task: {
            categoryId: categoryRecord.id
          }
        },
        include: {
          task: {
            include: {
              category: true
            }
          }
        }
      });

      // Calculate total hours for this week
      const totalHours = events.reduce((sum, event) => {
        const diffMs = event.end.getTime() - event.start.getTime();
        return sum + (diffMs / (1000 * 60 * 60));
      }, 0);

      // Format week label (e.g., "Week of Jan 1")
      const weekLabel = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      trends.push({
        week: weekLabel,
        weekIndex: i,
        hours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
        startDate: weekStart,
        endDate: weekEnd
      });
    }

    res.json({
      success: true,
      data: trends.reverse() // Most recent first
    });
  } catch (error) {
    next(error);
  }
});

function calculateProductivityScore(sessions: any[], totalTime: number): number {
  if (sessions.length === 0) return 0;

  const focusSessions = sessions.filter(session => !session.isBreak);
  const avgSessionLength = totalTime / sessions.length;
  const focusRatio = focusSessions.length / sessions.length;
  
  // Simple scoring algorithm (can be improved)
  const sessionScore = Math.min(avgSessionLength / 90, 1) * 50; // 50 points for session length
  const focusScore = focusRatio * 50; // 50 points for focus ratio
  
  return Math.round(sessionScore + focusScore);
}

export default router;
