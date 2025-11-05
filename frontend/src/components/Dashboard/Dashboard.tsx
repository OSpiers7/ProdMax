import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  BarChart3, 
  Plus,
  Play,
  Target,
  TrendingUp
} from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome back!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Ready to boost your productivity with the 90-minute rule?
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/timer"
            className="btn-primary inline-flex items-center px-4 py-2"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Focus Session
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Focus Sessions Today
                </dt>
                <dd className="text-lg font-medium text-gray-900">3</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Time Focused
                </dt>
                <dd className="text-lg font-medium text-gray-900">4h 30m</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Productivity Score
                </dt>
                <dd className="text-lg font-medium text-gray-900">87%</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Tasks Scheduled
                </dt>
                <dd className="text-lg font-medium text-gray-900">12</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/timer"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <Play className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Start Focus Timer</p>
                <p className="text-sm text-gray-500">Begin a 90-minute focus session</p>
              </div>
            </Link>

            <Link
              to="/calendar"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">View Calendar</p>
                <p className="text-sm text-gray-500">Schedule your tasks and events</p>
              </div>
            </Link>

            <Link
              to="/analytics"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-500">Track your productivity trends</p>
              </div>
            </Link>

            <button className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
              <div className="flex-shrink-0">
                <Plus className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Create New Task</p>
                <p className="text-sm text-gray-500">Add a new task to your schedule</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">Completed focus session: Coding</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">Scheduled task: Research</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">Updated analytics dashboard</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">Created new category: Fitness</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Tips */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Productivity Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-primary-900">90-Minute Rule</h4>
            <p className="text-sm text-primary-700 mt-1">
              Work in 90-minute focused sessions followed by 15-20 minute breaks for optimal productivity.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">Time Blocking</h4>
            <p className="text-sm text-green-700 mt-1">
              Schedule specific time blocks for different types of tasks to maintain focus and avoid context switching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
