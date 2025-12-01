import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Target, Plus, Repeat } from 'lucide-react';
import type { CalendarEvent, Category } from '../../types';

// Helper function to format date for datetime-local input (preserves local timezone)
const formatLocalDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot?: { start: Date; end: Date } | null;
  selectedEvent?: CalendarEvent | null;
  categories: Category[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  selectedSlot,
  selectedEvent,
  categories,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    isFocusSession: false,
    categoryId: '',
    subcategoryId: ''
  });

  const [subtasks, setSubtasks] = useState<string[]>(['']);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [updateAllInstances, setUpdateAllInstances] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (selectedEvent) {
      // Editing existing event
      setFormData({
        title: selectedEvent.title,
        start: formatLocalDateTime(new Date(selectedEvent.start)),
        end: formatLocalDateTime(new Date(selectedEvent.end)),
        isFocusSession: selectedEvent.isFocusSession,
        categoryId: selectedEvent.task?.categoryId || '',
        subcategoryId: selectedEvent.task?.subcategoryId || ''
      });
      // Set subtasks from event or task
      const eventSubtasks = selectedEvent.subtasks || selectedEvent.task?.subtasks || [];
      setSubtasks(eventSubtasks.length > 0 ? eventSubtasks : ['']);
      
      // Set recurrence fields
      setIsRecurring(!!selectedEvent.recurrenceRule || !!selectedEvent.parentEventId);
      if (selectedEvent.recurrenceRule) {
        const rule = selectedEvent.recurrenceRule;
        if (rule.startsWith('WEEKLY')) {
          setRecurrenceFrequency('WEEKLY');
          const daysMatch = rule.match(/WEEKLY:(.+)/);
          if (daysMatch) {
            setSelectedDays(daysMatch[1].split(','));
          }
        } else if (rule.startsWith('DAILY')) {
          setRecurrenceFrequency('DAILY');
        } else if (rule.startsWith('MONTHLY')) {
          setRecurrenceFrequency('MONTHLY');
        }
      }
      if (selectedEvent.recurrenceEndDate) {
        setRecurrenceEndDate(formatLocalDateTime(new Date(selectedEvent.recurrenceEndDate)));
      }
      // Show update option if it's a recurring instance
      if (selectedEvent.isRecurringInstance || selectedEvent.parentEventId) {
        setUpdateAllInstances(false);
      }
    } else if (selectedSlot) {
      // Creating new event from calendar click
      setFormData({
        title: '',
        start: formatLocalDateTime(selectedSlot.start),
        end: formatLocalDateTime(selectedSlot.end),
        isFocusSession: false,
        categoryId: '',
        subcategoryId: ''
      });
      setSubtasks(['']);
    } else {
      // Creating new event from button
      const now = new Date();
      const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
      
      setFormData({
        title: '',
        start: formatLocalDateTime(now),
        end: formatLocalDateTime(endTime),
        isFocusSession: false,
        categoryId: '',
        subcategoryId: ''
      });
      setSubtasks(['']);
      setIsRecurring(false);
      setRecurrenceFrequency('WEEKLY');
      setRecurrenceEndDate('');
      setSelectedDays([]);
      setUpdateAllInstances(false);
    }
  }, [selectedEvent, selectedSlot]);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const category = categories.find(cat => cat.id === formData.categoryId);
      if (category) {
        setSubcategories(category.subcategories || []);
      }
    } else {
      setSubcategories([]);
    }
  }, [formData.categoryId, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    // Filter out empty subtasks
    const validSubtasks = subtasks.filter(subtask => subtask.trim().length > 0);

    // Build recurrence rule
    let recurrenceRule: string | null = null;
    if (isRecurring) {
      if (recurrenceFrequency === 'WEEKLY' && selectedDays.length > 0) {
        recurrenceRule = `WEEKLY:${selectedDays.join(',')}`;
      } else {
        recurrenceRule = recurrenceFrequency;
      }
    }

    const eventData: any = {
      taskId: null,
      title: formData.title.trim(),
      subtasks: validSubtasks.length > 0 ? validSubtasks : undefined,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
      isFocusSession: formData.isFocusSession,
      recurrenceRule: recurrenceRule,
      recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : null
    };

    // If editing and it's a recurring event, add updateAllInstances flag
    if (selectedEvent && (selectedEvent.recurrenceRule || selectedEvent.parentEventId)) {
      eventData.updateAllInstances = updateAllInstances;
    }

    onSubmit(eventData);
  };

  // Add new subtask input
  const addSubtask = () => {
    setSubtasks([...subtasks, '']);
  };

  // Update subtask value
  const updateSubtask = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  // Remove subtask
  const removeSubtask = (index: number) => {
    if (subtasks.length > 1) {
      setSubtasks(subtasks.filter((_, i) => i !== index));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedEvent ? 'Edit Event' : 'Create New Event'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtasks
            </label>
            <div className="space-y-2">
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-gray-500">-</span>
                  <input
                    type="text"
                    placeholder="Enter subtask..."
                    value={subtask}
                    onChange={(e) => updateSubtask(index, e.target.value)}
                    className="input flex-1"
                  />
                  {subtasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubtask(index)}
                      className="text-red-500 hover:text-red-700 text-sm px-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSubtask}
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Subtask
              </button>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                name="start"
                value={formData.start}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                End Date & Time
              </label>
              <input
                type="datetime-local"
                name="end"
                value={formData.end}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="input w-full"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Selection */}
          {subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <select
                name="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="">Select a subcategory</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Focus Session Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isFocusSession"
              id="isFocusSession"
              checked={formData.isFocusSession}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isFocusSession" className="text-sm font-medium text-gray-700">
              <Target className="h-4 w-4 inline mr-1" />
              This is a focus session (90-minute work block)
            </label>
          </div>

          {/* Focus Session Info */}
          {formData.isFocusSession && (
            <div className="bg-primary-50 border border-primary-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Target className="h-5 w-5 text-primary-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-primary-800">
                    Focus Session
                  </h3>
                  <div className="mt-2 text-sm text-primary-700">
                    <p>This will be marked as a 90-minute focused work session. Perfect for deep work tasks like coding, writing, or research.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recurrence Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
              <Repeat className="h-4 w-4 inline mr-1" />
              Make this recurring
            </label>
          </div>

          {/* Recurrence Options */}
          {isRecurring && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat Frequency
                </label>
                <select
                  value={recurrenceFrequency}
                  onChange={(e) => {
                    setRecurrenceFrequency(e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY');
                    if (e.target.value !== 'WEEKLY') {
                      setSelectedDays([]);
                    }
                  }}
                  className="input w-full"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>

              {/* Weekly Day Selection */}
              {recurrenceFrequency === 'WEEKLY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat on Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'MO', label: 'Mon' },
                      { value: 'TU', label: 'Tue' },
                      { value: 'WE', label: 'Wed' },
                      { value: 'TH', label: 'Thu' },
                      { value: 'FR', label: 'Fri' },
                      { value: 'SA', label: 'Sat' },
                      { value: 'SU', label: 'Sun' }
                    ].map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          if (selectedDays.includes(day.value)) {
                            setSelectedDays(selectedDays.filter(d => d !== day.value));
                          } else {
                            setSelectedDays([...selectedDays, day.value]);
                          }
                        }}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          selectedDays.includes(day.value)
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {selectedDays.length === 0 && (
                    <p className="text-xs text-red-600 mt-1">Please select at least one day</p>
                  )}
                </div>
              )}

              {/* Recurrence End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  className="input w-full"
                  min={formData.start}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to repeat indefinitely
                </p>
              </div>
            </div>
          )}

          {/* Update All Instances Option (when editing recurring event) */}
          {selectedEvent && (selectedEvent.recurrenceRule || selectedEvent.parentEventId) && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start">
                <input
                  type="radio"
                  id="thisInstance"
                  name="updateScope"
                  checked={!updateAllInstances}
                  onChange={() => setUpdateAllInstances(false)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="thisInstance" className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-900">Update only this instance</span>
                  <p className="text-xs text-gray-600 mt-1">Changes will only apply to this specific occurrence</p>
                </label>
              </div>
              <div className="flex items-start mt-3">
                <input
                  type="radio"
                  id="allInstances"
                  name="updateScope"
                  checked={updateAllInstances}
                  onChange={() => setUpdateAllInstances(true)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="allInstances" className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-900">Update all future instances</span>
                  <p className="text-xs text-gray-600 mt-1">Changes will apply to this and all future occurrences</p>
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Creating...' : selectedEvent ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
