// Shared types between frontend and backend

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  subcategoryId: string;
  userId: string;
  createdAt: Date;
  category?: Category;
  subcategory?: Subcategory;
}

export interface CalendarEvent {
  id: string;
  taskId: string;
  title: string;
  start: Date;
  end: Date;
  category?: Category;
  subcategory?: Subcategory;
  description?: string;
  isFocusSession: boolean;
  userId: string;
  task?: Task;
}

export interface TimerSession {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  isActive: boolean;
  isBreak: boolean;
  userId: string;
  task?: Task;
}

export interface TimeAnalytics {
  period: 'week' | 'month' | 'year';
  totalTime: number; // in minutes
  byCategory: Record<string, number>;
  bySubcategory: Record<string, number>;
  focusSessions: number;
  productivityScore: number;
  startDate: Date;
  endDate: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  categoryId: string;
  subcategoryId: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string;
}

export interface CreateCalendarEventRequest {
  taskId: string;
  start: Date;
  end: Date;
  isFocusSession?: boolean;
}

export interface TimerStartRequest {
  taskId: string;
  duration?: number; // defaults to 90 minutes
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Predefined categories
export const DEFAULT_CATEGORIES = [
  {
    name: 'Career Advancement',
    color: '#3B82F6',
    subcategories: ['coding', 'networking', 'research', 'learning', 'meetings']
  },
  {
    name: 'Fitness & Health',
    color: '#10B981',
    subcategories: ['lifting', 'cardio', 'activities', 'nutrition', 'recovery']
  },
  {
    name: 'Housekeeping',
    color: '#F59E0B',
    subcategories: ['cleaning', 'groceries', 'chores', 'maintenance', 'organization']
  },
  {
    name: 'Fun',
    color: '#8B5CF6',
    subcategories: ['entertainment', 'hobbies', 'social', 'gaming', 'reading']
  },
  {
    name: 'Misc',
    color: '#6B7280',
    subcategories: ['admin', 'errands', 'other', 'personal', 'travel']
  }
] as const;

export type CategoryName = typeof DEFAULT_CATEGORIES[number]['name'];
export type SubcategoryName = typeof DEFAULT_CATEGORIES[number]['subcategories'][number];
