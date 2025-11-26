import React from 'react';

const BarChart = ({ data, dataKey, labelKey, color = 'indigo', height = 250, horizontal = false }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        No data available
      </div>
    );
  }

  const values = data.map(item => parseFloat(item[dataKey]) || 0);
  const maxValue = Math.max(...values, 1);

  const colors = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    cyan: 'bg-cyan-500',
    yellow: 'bg-yellow-500',
  };

  const gradients = {
    indigo: 'from-indigo-500 to-indigo-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    cyan: 'from-cyan-500 to-cyan-600',
    yellow: 'from-yellow-500 to-yellow-600',
  };

  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const value = parseFloat(item[dataKey]) || 0;
          const percentage = (value / maxValue) * 100;
          const label = item[labelKey] || item.label || `Item ${index + 1}`;

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {label.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {value.toFixed(0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden relative group">
                <div
                  className={`h-full bg-gradient-to-r ${gradients[color]} transition-all duration-500 rounded-full flex items-center justify-end pr-2`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 15 && (
                    <span className="text-xs text-white font-bold">
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
                {percentage <= 15 && percentage > 0 && (
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-600 font-bold">
                    {percentage.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical bars
  return (
    <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
      {data.map((item, index) => {
        const value = parseFloat(item[dataKey]) || 0;
        const heightPercentage = (value / maxValue) * 100;
        const label = item[labelKey] || item.label || item.date || `${index + 1}`;

        return (
          <div key={index} className="flex-1 flex flex-col items-center group">
            <div className="w-full relative" style={{ height: '100%' }}>
              <div className="absolute bottom-0 w-full bg-gray-100 rounded-t-lg" style={{ height: '100%' }}>
                <div
                  className={`absolute bottom-0 w-full bg-gradient-to-t ${gradients[color]} rounded-t-lg transition-all duration-500 hover:opacity-90 cursor-pointer flex items-start justify-center pt-2`}
                  style={{ height: `${heightPercentage}%` }}
                >
                  {value > 0 && heightPercentage > 15 && (
                    <span className="text-xs text-white font-bold">
                      {value.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {label}: {value.toFixed(1)}
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 font-medium truncate w-full text-center">
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;
