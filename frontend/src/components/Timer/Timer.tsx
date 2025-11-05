import React from 'react';

const Timer: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Focus Timer
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Start a 90-minute focus session with built-in breaks
          </p>
        </div>
      </div>

      <div className="card p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Timer Component Coming Soon</h3>
          <p className="text-gray-500">
            The focus timer will feature 90-minute sessions with real-time countdown
          </p>
        </div>
      </div>
    </div>
  );
};

export default Timer;
