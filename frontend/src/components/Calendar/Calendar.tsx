import { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import moment from 'moment';
import { Plus, Play } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import TaskForm from './TaskForm';
import FocusTimer from '../FocusTimer/FocusTimer';
import EventContextMenu from './EventContextMenu';
import type { CalendarEvent, Category } from '../../types';

// Setup moment localizer for React Big Calendar
const localizer = momentLocalizer(moment);

// Import calendar styles
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';

const Calendar: React.FC = () => {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [focusTimerEvent, setFocusTimerEvent] = useState<CalendarEvent | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    event: CalendarEvent;
    position: { x: number; y: number };
  } | null>(null);

  const queryClient = useQueryClient();

  // Force re-render every minute to update "Start Focus Session" button visibility
  const [, setUpdateTrigger] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate date range based on current view and date
  const dateRange = useMemo(() => {
    const currentDate = new Date(date);
    let startDate: Date;
    let endDate: Date;

    if (view === Views.MONTH) {
      // Month view: Get full month range
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (view === Views.WEEK) {
      // Week view: Get week range (Monday to Sunday)
      const day = currentDate.getDay();
      const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      startDate = new Date(currentDate.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Day view or other: Get single day
      startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);
    }

    // Extend range by 1 month before and after to catch recurring events
    const extendedStart = new Date(startDate);
    extendedStart.setMonth(extendedStart.getMonth() - 1);
    const extendedEnd = new Date(endDate);
    extendedEnd.setMonth(extendedEnd.getMonth() + 1);

    return { start: extendedStart, end: extendedEnd, displayStart: startDate, displayEnd: endDate };
  }, [date, view]);

  // Fetch calendar events - query key includes date and view for proper refetching
  const { data: events = [], isLoading, error: eventsError } = useQuery<CalendarEvent[]>(
    ['calendar-events', dateRange.start.toISOString(), dateRange.end.toISOString()],
    async () => {
      const response = await api.get(
        `/calendar/events?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`
      );
      return response.data.data;
    },
    {
      retry: 1,
      onError: (error) => {
        console.error('Failed to fetch calendar events:', error);
      }
    }
  );

  // Fetch tasks for error handling
  const { error: tasksError } = useQuery(
    'tasks',
    async () => {
      const response = await api.get('/tasks');
      return response.data.data;
    },
    {
      retry: 1,
      onError: (error) => {
        console.error('Failed to fetch tasks:', error);
      }
    }
  );

  // Fetch categories for task form
  const { data: categories = [], error: categoriesError } = useQuery<Category[]>(
    'categories',
    async () => {
      const response = await api.get('/tasks/categories/all');
      return response.data.data;
    },
    {
      retry: 1,
      onError: (error) => {
        console.error('Failed to fetch categories:', error);
      }
    }
  );

  // Create calendar event mutation
  const createEventMutation = useMutation(
    async (eventData: any) => {
      console.log('Sending event data:', eventData);
      const response = await api.post('/calendar/events', eventData);
      console.log('Event created successfully:', response.data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('calendar-events');
        setShowTaskForm(false);
        setSelectedSlot(null);
        setSelectedEvent(null);
      },
      onError: (error: any) => {
        console.error('Failed to create event:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        alert(`Failed to create event: ${error.response?.data?.error || error.message}`);
      }
    }
  );

  // Update calendar event mutation
  const updateEventMutation = useMutation(
    async ({ eventId, eventData }: { eventId: string; eventData: any }) => {
      console.log('Updating event:', eventId, eventData);
      const response = await api.put(`/calendar/events/${eventId}`, eventData);
      console.log('Event updated successfully:', response.data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('calendar-events');
        setShowTaskForm(false);
        setSelectedEvent(null);
      },
      onError: (error: any) => {
        console.error('Failed to update event:', error);
        alert(`Failed to update event: ${error.response?.data?.error || error.message}`);
      }
    }
  );

  // Delete calendar event mutation
  const deleteEventMutation = useMutation(
    async ({ eventId, deleteAllInstances = false }: { eventId: string; deleteAllInstances?: boolean }) => {
      const url = deleteAllInstances 
        ? `/calendar/events/${eventId}?deleteAllInstances=true`
        : `/calendar/events/${eventId}`;
      const response = await api.delete(url);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('calendar-events');
        setContextMenu(null);
      },
      onError: (error: any) => {
        console.error('Failed to delete event:', error);
        alert(`Failed to delete event: ${error.response?.data?.error || error.message}`);
      }
    }
  );

  // Update event category (color) mutation
  const updateEventCategoryMutation = useMutation(
    async ({ eventId, categoryId }: { eventId: string; categoryId: string }) => {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      if (event.taskId && event.task) {
        // Update the existing task's category
        const response = await api.put(`/tasks/${event.taskId}`, { categoryId });
        return response.data;
      } else {
        // Event doesn't have a task - create one with the new category
        // Get subcategories for the selected category
        const selectedCategory = categories.find(cat => cat.id === categoryId);
        const subcategoryId = selectedCategory?.subcategories && selectedCategory.subcategories.length > 0
          ? selectedCategory.subcategories[0].id
          : null;

        const taskResponse = await api.post('/tasks', {
          title: event.title,
          subtasks: event.subtasks || [],
          categoryId,
          subcategoryId
        });

        // Link the event to the new task
        await api.put(`/calendar/events/${eventId}`, {
          taskId: taskResponse.data.data.id
        });

        return taskResponse.data;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('calendar-events');
        queryClient.invalidateQueries('tasks');
      },
      onError: (error: any) => {
        console.error('Failed to update event color:', error);
        alert(`Failed to change color: ${error.message || error.response?.data?.error}`);
      }
    }
  );

  // Handle slot selection (clicking on calendar)
  const handleSelectSlot = useCallback((slotInfo: any) => {
    setContextMenu(null); // Close context menu if open
    setSelectedSlot({
      start: slotInfo.start,
      end: slotInfo.end
    });
    setShowTaskForm(true);
  }, []);

  // Handle event selection (clicking on existing event)
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowTaskForm(true);
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  // Handle view change
  const handleViewChange = useCallback((newView: any) => {
    setView(newView);
  }, []);

  // Check if focus session button should be displayed
  // Button appears 15 minutes before start and stays until end time
  const isFocusSessionReady = useCallback((event: CalendarEvent): boolean => {
    if (!event.isFocusSession) return false;
    
    const now = new Date();
    const startTime = new Date(event.start);
    const endTime = new Date(event.end);
    
    const timeUntilStart = startTime.getTime() - now.getTime();
    const timeUntilEnd = endTime.getTime() - now.getTime();
    
    // Show button if:
    // 1. Current time is within 15 minutes before start, OR
    // 2. Current time is between start and end
    // But not after end time
    const isWithin15MinutesBefore = timeUntilStart <= 15 * 60 * 1000 && timeUntilStart >= 0;
    const isBetweenStartAndEnd = timeUntilStart <= 0 && timeUntilEnd >= 0;
    
    return (isWithin15MinutesBefore || isBetweenStartAndEnd);
  }, []);

  // Handle starting focus session
  const handleStartFocusSession = useCallback((event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setFocusTimerEvent(event);
    setShowFocusTimer(true);
  }, []);

  // Handle right-click on event
  const handleEventContextMenu = useCallback((event: CalendarEvent, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      event,
      position: { x: e.clientX, y: e.clientY }
    });
  }, []);

  // Handle context menu actions
  const handleEditFromMenu = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowTaskForm(true);
  }, []);

  const handleDeleteFromMenu = useCallback((event: CalendarEvent) => {
    const isRecurring = !!(event.recurrenceRule || event.parentEventId);
    
    if (isRecurring) {
      const shouldDeleteAll = window.confirm(
        'This is a recurring event. Do you want to delete all future instances, or just this one?\n\n' +
        'Click OK to delete all instances, or Cancel to delete only this occurrence.'
      );
      deleteEventMutation.mutate({ 
        eventId: event.parentEventId || event.id, 
        deleteAllInstances: shouldDeleteAll 
      });
    } else {
      deleteEventMutation.mutate({ eventId: event.id });
    }
  }, [deleteEventMutation]);

  const handleChangeColorFromMenu = useCallback((event: CalendarEvent, categoryId: string) => {
    updateEventCategoryMutation.mutate({ eventId: event.id, categoryId });
  }, [updateEventCategoryMutation]);

  // Format events for React Big Calendar and filter to visible range
  const formattedEvents = useMemo(() => {
    return events
      .filter(event => {
        const eventStart = new Date(event.start);
        // Only show events that fall within the visible date range
        return eventStart >= dateRange.displayStart && eventStart <= dateRange.displayEnd;
      })
      .map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        title: event.title,
        resource: event
      }));
  }, [events, dateRange]);

  // Set min and max times for calendar (6am to 10pm)
  // React Big Calendar uses only the time portion, so we can use any date
  const minTime = useMemo(() => moment(date).hour(6).minute(0).second(0).toDate(), [date]);
  const maxTime = useMemo(() => moment(date).hour(22).minute(0).second(0).toDate(), [date]);

  // Event style getter
  const eventStyleGetter = (event: any) => {
    const backgroundColor = event.resource?.task?.category?.color || event.resource?.category?.color || '#3B82F6';
    const isFocusSession = event.resource?.isFocusSession;
    const isRecurring = !!(event.resource?.recurrenceRule || event.resource?.parentEventId);
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: isFocusSession 
          ? '2px solid #F59E0B' 
          : isRecurring 
            ? '2px solid #10B981' 
            : 'none',
        fontSize: '12px',
        fontWeight: '500'
      }
    };
  };

  // Custom event component with "Start Focus Session" button
  const CustomEventComponent = ({ event }: any) => {
    const calendarEvent = event.resource as CalendarEvent;
    const showStartButton = isFocusSessionReady(calendarEvent);
    
    return (
      <div 
        className="rbc-event-content-wrapper h-full flex flex-col"
        onContextMenu={(e) => handleEventContextMenu(calendarEvent, e)}
      >
        <div className="flex-1 flex items-center px-1 py-0.5">
          <span className="text-xs font-medium truncate">{event.title}</span>
          {(calendarEvent.recurrenceRule || calendarEvent.parentEventId) && (
            <span className="ml-1 text-[10px] opacity-75" title="Recurring event">🔄</span>
          )}
        </div>
        {showStartButton && (
          <div className="px-1 pb-0.5">
            <button
              onClick={(e) => handleStartFocusSession(calendarEvent, e)}
              className="w-full text-[10px] bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-1 py-0.5 rounded flex items-center justify-center space-x-0.5 transition-all"
              style={{ fontSize: '10px' }}
            >
              <Play className="h-2.5 w-2.5" />
              <span>Start Focus</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Custom toolbar component
  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex items-center justify-between mb-4 p-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onNavigate('PREV')}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          ←
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          →
        </button>
        <h2 className="text-xl font-semibold text-gray-900">{label}</h2>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onView(Views.MONTH)}
          className={`px-3 py-1 rounded-md text-sm ${
            view === Views.MONTH ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => onView(Views.WEEK)}
          className={`px-3 py-1 rounded-md text-sm ${
            view === Views.WEEK ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setShowTaskForm(true)}
          className="btn-primary inline-flex items-center px-4 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Show error if there are API errors
  if (eventsError || tasksError || categoriesError) {
    return (
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Calendar
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Schedule your tasks and focus sessions
            </p>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Calendar</h3>
            <p className="text-gray-500 mb-4">
              There was an error loading the calendar data. Please check your connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Calendar
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Schedule your tasks and focus sessions
          </p>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="card" onClick={() => setContextMenu(null)}>
        <div className="h-[calc(100vh-250px)] min-h-[800px]">
          <BigCalendar
            localizer={localizer}
            events={formattedEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            date={date}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            popup
            min={minTime}
            max={maxTime}
            step={30}
            components={{
              toolbar: CustomToolbar,
              event: CustomEventComponent
            }}
            eventPropGetter={eventStyleGetter}
            style={{ height: '100%' }}
            className="calendar-container"
          />
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          isOpen={showTaskForm}
          onClose={() => {
            setShowTaskForm(false);
            setSelectedSlot(null);
            setSelectedEvent(null);
          }}
          selectedSlot={selectedSlot}
          selectedEvent={selectedEvent}
          categories={categories}
          onSubmit={(eventData: any) => {
            if (selectedEvent) {
              // Update existing event
              const eventId = selectedEvent.parentEventId || selectedEvent.id;
              updateEventMutation.mutate({ eventId, eventData });
            } else {
              // Create new event
              createEventMutation.mutate(eventData);
            }
          }}
          isLoading={createEventMutation.isLoading || updateEventMutation.isLoading}
        />
      )}

      {/* Focus Timer Modal */}
      {showFocusTimer && focusTimerEvent && (
        <FocusTimer
          isOpen={showFocusTimer}
          onClose={() => {
            setShowFocusTimer(false);
            setFocusTimerEvent(null);
          }}
          event={focusTimerEvent}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <EventContextMenu
          event={contextMenu.event}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onEdit={handleEditFromMenu}
          onDelete={handleDeleteFromMenu}
          onChangeColor={handleChangeColorFromMenu}
          categories={categories}
        />
      )}
    </div>
  );
};

export default Calendar;
