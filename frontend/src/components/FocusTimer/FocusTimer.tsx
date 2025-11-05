import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Square, Target, Clock, Tag, Layers } from 'lucide-react';
import type { CalendarEvent } from '../../types';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent;
}

const FOCUS_DURATION = 90 * 60 * 1000; // 90 minutes in milliseconds

const FocusTimer: React.FC<FocusTimerProps> = ({ isOpen, onClose, event }) => {
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get subtasks from event or task
  const subtasks = event.subtasks || event.task?.subtasks || [];
  const [completedSubtasks, setCompletedSubtasks] = useState<Set<number>>(new Set());
  
  // Toggle subtask completion
  const toggleSubtask = (index: number) => {
    setCompletedSubtasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Start timer
  const handleStart = () => {
    setIsRunning(true);
    setStartTime(new Date());
  };

  // Pause timer
  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Stop timer
  const handleStop = () => {
    setIsRunning(false);
    setTimeRemaining(FOCUS_DURATION);
    setStartTime(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reset timer when component closes
  useEffect(() => {
    if (!isOpen) {
      handleStop();
    }
  }, [isOpen]);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1000) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeRemaining]);

  // Format time
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = ((FOCUS_DURATION - timeRemaining) / FOCUS_DURATION) * 100;

  // Get category color or default
  const categoryColor = event.task?.category?.color || event.category?.color || '#3B82F6';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderBottomColor: categoryColor + '20' }}>
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: categoryColor + '20' }}
            >
              <Target className="h-6 w-6" style={{ color: categoryColor }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Focus Session</h3>
              <p className="text-sm text-gray-500">90-minute deep work session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task Information */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">{event.title}</h4>
              
              {/* Subtasks Todo List */}
              {subtasks.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">To-Do List</h5>
                  <div className="space-y-2">
                    {subtasks.map((subtask, index) => {
                      const isCompleted = completedSubtasks.has(index);
                      return (
                        <label
                          key={index}
                          className="flex items-start space-x-3 cursor-pointer group hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => toggleSubtask(index)}
                            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span
                            className={`flex-1 text-sm ${
                              isCompleted
                                ? 'line-through text-gray-500'
                                : 'text-gray-900'
                            }`}
                          >
                            {subtask}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-4">No subtasks for this session</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              {event.task?.category || event.category ? (
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: categoryColor }}
                    >
                      {event.task?.category?.name || event.category?.name}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Subcategory */}
              {(event.task?.subcategory || event.subcategory) && (
                <div className="flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Subcategory</p>
                    <p className="text-sm font-medium text-gray-900">
                      {event.task?.subcategory?.name || event.subcategory?.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timer Display */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8">
            <div className="text-center">
              {/* Timer Circle/Progress */}
              <div className="relative inline-block mb-6">
                <svg className="transform -rotate-90 w-48 h-48">
                  {/* Background circle */}
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke={categoryColor}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                {/* Timer text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isRunning ? 'In Progress' : timeRemaining === FOCUS_DURATION ? 'Ready to Start' : 'Paused'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center space-x-4">
                {!isRunning && timeRemaining > 0 ? (
                  <button
                    onClick={handleStart}
                    className="btn-primary inline-flex items-center px-6 py-3 text-lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Focus Session
                  </button>
                ) : isRunning ? (
                  <>
                    <button
                      onClick={handlePause}
                      className="btn-secondary inline-flex items-center px-6 py-3"
                    >
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </button>
                    <button
                      onClick={handleStop}
                      className="btn-secondary inline-flex items-center px-6 py-3"
                    >
                      <Square className="h-5 w-5 mr-2" />
                      Stop
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleStart}
                      className="btn-primary inline-flex items-center px-6 py-3"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Resume
                    </button>
                    <button
                      onClick={handleStop}
                      className="btn-secondary inline-flex items-center px-6 py-3"
                    >
                      <Square className="h-5 w-5 mr-2" />
                      Reset
                    </button>
                  </>
                )}
              </div>

              {/* Session Info */}
              {startTime && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Started at {startTime.toLocaleTimeString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Completion Message */}
          {timeRemaining === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Target className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Focus Session Complete! 🎉
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Great job! You've completed your 90-minute focus session.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;

