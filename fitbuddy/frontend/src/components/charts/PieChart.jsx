import React from 'react';

const PieChart = ({ data, dataKey, labelKey, size = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        No data available
      </div>
    );
  }

  const values = data.map(item => parseFloat(item[dataKey]) || 0);
  const total = values.reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        No data to display
      </div>
    );
  }

  const colors = [
    '#6366f1', // indigo
    '#10b981', // green
    '#f59e0b', // orange
    '#8b5cf6', // purple
    '#3b82f6', // blue
    '#ef4444', // red
    '#06b6d4', // cyan
    '#eab308', // yellow
    '#ec4899', // pink
    '#14b8a6', // teal
  ];

  let currentAngle = -90; // Start from top

  const slices = data.map((item, index) => {
    const value = parseFloat(item[dataKey]) || 0;
    const percentage = (value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      value,
      percentage,
      startAngle,
      endAngle,
      color: colors[index % colors.length],
    };
  });

  const radius = size / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const innerRadius = radius * 0.6; // Donut chart

  const polarToCartesian = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad),
    };
  };

  const createArc = (startAngle, endAngle) => {
    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    const startInner = {
      x: centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180),
      y: centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180),
    };
    const endInner = {
      x: centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180),
      y: centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180),
    };

    return `
      M ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}
      L ${endInner.x} ${endInner.y}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}
      Z
    `;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      {/* Pie Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, index) => (
            <g key={index} className="cursor-pointer hover:opacity-80 transition-opacity">
              <path
                d={createArc(slice.startAngle, slice.endAngle)}
                fill={slice.color}
              />
              <title>
                {(slice[labelKey] || slice.label || `Item ${index + 1}`).replace(/_/g, ' ')}: {slice.value.toFixed(0)} ({slice.percentage.toFixed(1)}%)
              </title>
            </g>
          ))}
          {/* Center circle (donut hole) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius}
            fill="white"
          />
          {/* Total in center */}
          <text
            x={centerX}
            y={centerY - 8}
            textAnchor="middle"
            className="text-2xl font-bold fill-gray-900"
          >
            {total.toFixed(0)}
          </text>
          <text
            x={centerX}
            y={centerY + 12}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            Total
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {slices.map((slice, index) => {
          const label = (slice[labelKey] || slice.label || `Item ${index + 1}`).replace(/_/g, ' ');
          return (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-sm flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-700 capitalize truncate">
                    {label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {slice.percentage.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {slice.value.toFixed(0)} total
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PieChart;
