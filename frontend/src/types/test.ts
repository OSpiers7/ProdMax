// Test file to verify types are working
import { CalendarEvent, Task, Category } from './index';

// This file just ensures the types can be imported correctly
// It will be removed once we confirm everything works

export const testTypes = () => {
  const testEvent: CalendarEvent = {
    id: 'test',
    taskId: 'test',
    title: 'Test Event',
    start: new Date(),
    end: new Date(),
    isFocusSession: false,
    userId: 'test'
  };

  const testTask: Task = {
    id: 'test',
    title: 'Test Task',
    categoryId: 'test',
    subcategoryId: 'test',
    userId: 'test',
    createdAt: new Date()
  };

  const testCategory: Category = {
    id: 'test',
    name: 'Test Category',
    color: '#3B82F6',
    userId: 'test'
  };

  return { testEvent, testTask, testCategory };
};
