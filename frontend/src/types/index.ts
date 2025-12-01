// Frontend-specific types for the calendar component

export interface CalendarEvent {
  id: string;
  taskId: string | null;
  title: string;
  start: Date | string;
  end: Date | string;
  category?: Category;
  subcategory?: Subcategory;
  subtasks?: string[];
  isFocusSession: boolean;
  userId: string;
  task?: Task;
  recurrenceRule?: string | null;
  recurrenceEndDate?: Date | string | null;
  parentEventId?: string | null;
  isRecurringInstance?: boolean;
}

export interface Task {
  id: string;
  title: string;
  subtasks?: string[];
  categoryId: string;
  subcategoryId?: string | null;
  userId: string;
  createdAt: Date;
  category?: Category;
  subcategory?: Subcategory;
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

export interface CreateEventRequest {
  taskId?: string | null;
  title: string;
  subtasks?: string[];
  start: string;
  end: string;
  isFocusSession?: boolean;
  recurrenceRule?: string | null;
  recurrenceEndDate?: string | null;
}

export interface UpdateEventRequest {
  title?: string;
  subtasks?: string[];
  start?: string;
  end?: string;
  isFocusSession?: boolean;
  updateAllInstances?: boolean;
}
