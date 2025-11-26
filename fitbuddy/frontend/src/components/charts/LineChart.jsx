import React from 'react';

const LineChart = ({ data, dataKey, label, color = 'indigo', height = 200, showDots = true }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        No data available
      </div>
    );
  }

  const values = data.map(item => parseFloat(item[dataKey]) || 0);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values.filter(v => v > 0), 0);
  const range = maxValue - minValue || 1;

  const colors = {
    indigo: { line: 'stroke-indigo-500', fill: 'fill-indigo-100', dot: 'fill-indigo-600' },
    green: { line: 'stroke-green-500', fill: 'fill-green-100', dot: 'fill-green-600' },
    orange: { line: 'stroke-orange-500', fill: 'fill-orange-100', dot: 'fill-orange-600' },
    purple: { line: 'stroke-purple-500', fill: 'fill-purple-100', dot: 'fill-purple-600' },
    blue: { line: 'stroke-blue-500', fill: 'fill-blue-100', dot: 'fill-blue-600' },
  };

  const colorScheme = colors[color] || colors.indigo;
  const chartWidth = 800;
  const chartHeight = height;
  const padding = { top: 10, right: 10, bottom: 30, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const getX = (index) => padding.left + (index / (data.length - 1 || 1)) * innerWidth;
  const getY = (value) => {
    if (value === 0 || !value) return padding.top + innerHeight;
    const normalized = (value - minValue) / range;
    return padding.top + innerHeight - (normalized * innerHeight);
  };

  // Generate line path
  const linePath = data.map((item, index) => {
    const x = getX(index);
    const y = getY(item[dataKey]);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate area path
  const areaPath = `${linePath} L ${getX(data.length - 1)} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`;

  // Generate Y-axis labels
  const yLabels = [maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ minWidth: '600px' }}>
        {/* Grid lines */}
        {yLabels.map((value, index) => {
          const y = padding.top + (index / (yLabels.length - 1)) * innerHeight;
          return (
            <g key={index}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
                style={{ fontSize: '11px' }}
              >
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Area under line */}
        <path
          d={areaPath}
          className={colorScheme.fill}
          opacity="0.3"
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          className={colorScheme.line}
          strokeWidth="2.5"
        />

        {/* Dots */}
        {showDots && data.map((item, index) => {
          const value = parseFloat(item[dataKey]) || 0;
          if (value === 0) return null;
          
          return (
            <g key={index}>
              <circle
                cx={getX(index)}
                cy={getY(value)}
                r="4"
                className={colorScheme.dot}
              />
              <circle
                cx={getX(index)}
                cy={getY(value)}
                r="8"
                fill="transparent"
                className="cursor-pointer hover:fill-gray-200 hover:fill-opacity-30"
              >
                <title>{`${item.label || item.date || index}: ${value.toFixed(2)}`}</title>
              </circle>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((item, index) => {
          if (data.length > 15 && index % Math.ceil(data.length / 10) !== 0) return null;
          return (
            <text
              key={index}
              x={getX(index)}
              y={chartHeight - 10}
              textAnchor="middle"
              className="text-xs fill-gray-600"
              style={{ fontSize: '10px' }}
            >
              {item.label || item.date || index}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default LineChart;
