/**
 * Utility functions for handling recurring events
 */

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval?: number; // e.g., every 2 weeks (interval: 2)
  endDate?: Date; // When the recurrence should end
  count?: number; // Number of occurrences
  byDay?: string[]; // For WEEKLY: ['MO', 'WE', 'FR']
  byMonthDay?: number[]; // For MONTHLY: [1, 15] (1st and 15th of month)
}

/**
 * Parse a simple recurrence rule string into a RecurrenceRule object
 * Format: "DAILY", "WEEKLY", "WEEKLY:MO,WE,FR", "MONTHLY:1,15"
 */
export function parseRecurrenceRule(rule: string): RecurrenceRule | null {
  if (!rule) return null;

  const parts = rule.split(':');
  const frequency = parts[0] as RecurrenceFrequency;

  if (!['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(frequency)) {
    return null;
  }

  const result: RecurrenceRule = { frequency };

  if (frequency === 'WEEKLY' && parts[1]) {
    result.byDay = parts[1].split(',');
  } else if (frequency === 'MONTHLY' && parts[1]) {
    result.byMonthDay = parts[1].split(',').map(Number);
  }

  return result;
}

/**
 * Generate recurring event instances based on a recurrence rule
 */
export function generateRecurringInstances(
  startDate: Date,
  endDate: Date,
  recurrenceRule: RecurrenceRule,
  maxInstances: number = 100 // Limit to prevent infinite loops
): Date[] {
  const instances: Date[] = [];
  const duration = endDate.getTime() - startDate.getTime();

  let currentDate = new Date(startDate);
  const endRecurrence = recurrenceRule.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default: 1 year
  const interval = recurrenceRule.interval || 1;

  let count = 0;
  let iterationCount = 0; // Prevent infinite loops
  const maxIterations = 10000;

  while (currentDate <= endRecurrence && instances.length < maxInstances && iterationCount < maxIterations) {
    iterationCount++;
    
    if (recurrenceRule.count && count >= recurrenceRule.count) {
      break;
    }

    // Check if current date matches recurrence pattern
    let shouldInclude = false;

    switch (recurrenceRule.frequency) {
      case 'DAILY':
        shouldInclude = true;
        break;

      case 'WEEKLY':
        if (recurrenceRule.byDay && recurrenceRule.byDay.length > 0) {
          const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
          const currentDay = dayNames[currentDate.getDay()];
          shouldInclude = recurrenceRule.byDay.includes(currentDay);
        } else {
          // Default: same day of week as start date
          shouldInclude = currentDate.getDay() === startDate.getDay();
        }
        break;

      case 'MONTHLY':
        if (recurrenceRule.byMonthDay) {
          shouldInclude = recurrenceRule.byMonthDay.includes(currentDate.getDate());
        } else {
          // Default: same day of month
          shouldInclude = currentDate.getDate() === startDate.getDate();
        }
        break;

      case 'YEARLY':
        shouldInclude = 
          currentDate.getMonth() === startDate.getMonth() &&
          currentDate.getDate() === startDate.getDate();
        break;
    }

    if (shouldInclude) {
      instances.push(new Date(currentDate));
      count++;
    }

    // Move to next potential date
    const nextDate = new Date(currentDate);
    switch (recurrenceRule.frequency) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case 'WEEKLY':
        if (recurrenceRule.byDay && recurrenceRule.byDay.length > 0) {
          // For specific days, find next matching day
          const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
          const currentDayIndex = currentDate.getDay();
          const currentDayName = dayNames[currentDayIndex];
          
          const currentDayInRule = recurrenceRule.byDay.indexOf(currentDayName);
          if (currentDayInRule !== -1 && currentDayInRule < recurrenceRule.byDay.length - 1) {
            // Next day in the rule (same week)
            const nextDayName = recurrenceRule.byDay[currentDayInRule + 1];
            const nextDayIndex = dayNames.indexOf(nextDayName);
            let daysUntilNext = nextDayIndex - currentDayIndex;
            if (daysUntilNext <= 0) {
              daysUntilNext += 7; // Wrap to next week
            }
            nextDate.setDate(nextDate.getDate() + daysUntilNext);
          } else if (currentDayInRule === recurrenceRule.byDay.length - 1) {
            // Last day in rule, move to first day of next week
            const firstDayName = recurrenceRule.byDay[0];
            const firstDayIndex = dayNames.indexOf(firstDayName);
            let daysUntilNext = (firstDayIndex - currentDayIndex + 7) % 7;
            if (daysUntilNext === 0) {
              daysUntilNext = 7; // Move to next week
            }
            nextDate.setDate(nextDate.getDate() + daysUntilNext);
          } else {
            // Current day not in rule, find next matching day
            const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
            let found = false;
            for (let i = 1; i <= 7 && !found; i++) {
              const checkDate = new Date(currentDate);
              checkDate.setDate(checkDate.getDate() + i);
              const checkDay = dayNames[checkDate.getDay()];
              if (recurrenceRule.byDay.includes(checkDay)) {
                nextDate.setDate(currentDate.getDate() + i);
                found = true;
              }
            }
            if (!found) {
              // Fallback: move to next week
              nextDate.setDate(nextDate.getDate() + (7 * interval));
            }
          }
        } else {
          // No specific days, just move by week interval
          nextDate.setDate(nextDate.getDate() + (7 * interval));
        }
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case 'YEARLY':
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
    }

    currentDate = nextDate;
  }

  return instances;
}

/**
 * Generate start and end dates for recurring instances
 */
export function generateRecurringEventDates(
  originalStart: Date,
  originalEnd: Date,
  recurrenceRule: RecurrenceRule,
  maxInstances: number = 100
): Array<{ start: Date; end: Date }> {
  const duration = originalEnd.getTime() - originalStart.getTime();
  const startInstances = generateRecurringInstances(originalStart, originalEnd, recurrenceRule, maxInstances);

  return startInstances.map(start => ({
    start: new Date(start),
    end: new Date(start.getTime() + duration)
  }));
}

