/**
 * MemberProgress.jsx
 * Analytics dashboard for visualizing fitness progress
 * Shows workout and exercise statistics with interactive charts
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const MemberProgress = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  
  // Workout stats
  const [workoutStats, setWorkoutStats] = useState(null);
  const [workoutTimeRange, setWorkoutTimeRange] = useState('last30days');
  const [workoutViewMode, setWorkoutViewMode] = useState('week'); // 'week' or 'month'
  const [workoutCustomStart, setWorkoutCustomStart] = useState('');
  const [workoutCustomEnd, setWorkoutCustomEnd] = useState('');
  
  // Exercise stats
  const [exerciseStats, setExerciseStats] = useState(null);
  const [exerciseTimeRange, setExerciseTimeRange] = useState('last7days');
  const [exerciseCustomStart, setExerciseCustomStart] = useState('');
  const [exerciseCustomEnd, setExerciseCustomEnd] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  // Calculate date ranges
  const getDateRange = (range) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const endDate = today.toISOString().split('T')[0];
    
    let startDate;
    switch (range) {
      case 'thisweek': {
        const start = new Date(today);
        start.setDate(start.getDate() - start.getDay() + 1); // Monday
        start.setHours(0, 0, 0, 0);
        startDate = start.toISOString().split('T')[0];
        break;
      }
      case 'thismonth': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = start.toISOString().split('T')[0];
        break;
      }
      case 'last7days': {
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        startDate = start.toISOString().split('T')[0];
        break;
      }
      case 'last30days': {
        const start = new Date(today);
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        startDate = start.toISOString().split('T')[0];
        break;
      }
      default:
        startDate = endDate;
    }
    
    return { startDate, endDate };
  };

  // Fetch overview data
  const fetchOverview = async () => {
    try {
      const response = await fetch(`${API_URL}/api/progress/overview`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch overview');

      const data = await response.json();
      setOverview(data.data);
    } catch (err) {
      console.error('Error fetching overview:', err);
    }
  };

  // Fetch workout stats
  const fetchWorkoutStats = async () => {
    try {
      let startDate, endDate;
      
      if (workoutTimeRange === 'custom' && workoutCustomStart && workoutCustomEnd) {
        startDate = workoutCustomStart;
        endDate = workoutCustomEnd;
      } else if (workoutTimeRange !== 'custom') {
        ({ startDate, endDate } = getDateRange(workoutTimeRange));
      } else {
        return; // Don't fetch if custom dates not set
      }

      const response = await fetch(
        `${API_URL}/api/progress/workouts?startDate=${startDate}&endDate=${endDate}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) throw new Error('Failed to fetch workout stats');

      const data = await response.json();
      setWorkoutStats(data.data);
    } catch (err) {
      console.error('Error fetching workout stats:', err);
      setError('Failed to load workout statistics');
    }
  };

  // Fetch exercise stats
  const fetchExerciseStats = async () => {
    try {
      let startDate, endDate;
      
      if (exerciseTimeRange === 'custom' && exerciseCustomStart && exerciseCustomEnd) {
        startDate = exerciseCustomStart;
        endDate = exerciseCustomEnd;
      } else if (exerciseTimeRange !== 'custom') {
        ({ startDate, endDate } = getDateRange(exerciseTimeRange));
      } else {
        return; // Don't fetch if custom dates not set
      }

      const response = await fetch(
        `${API_URL}/api/progress/exercises?startDate=${startDate}&endDate=${endDate}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) throw new Error('Failed to fetch exercise stats');

      const data = await response.json();
      setExerciseStats(data.data);
    } catch (err) {
      console.error('Error fetching exercise stats:', err);
      setError('Failed to load exercise statistics');
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOverview(),
        fetchWorkoutStats(),
        fetchExerciseStats(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Reload workout stats when filters change
  useEffect(() => {
    if (!loading) {
      fetchWorkoutStats();
    }
  }, [workoutTimeRange, workoutCustomStart, workoutCustomEnd]);

  // Reload exercise stats when filters change
  useEffect(() => {
    if (!loading) {
      fetchExerciseStats();
    }
  }, [exerciseTimeRange, exerciseCustomStart, exerciseCustomEnd]);

  // Render bar chart for workouts
  const renderWorkoutChart = () => {
    if (!workoutStats) return null;

    const data = workoutViewMode === 'week' ? workoutStats.byWeek : workoutStats.byMonth;
    
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No workout data available for this period
        </div>
      );
    }

    const maxCount = Math.max(...data.map(d => d.count), 1);
    const chartHeight = 200;

    return (
      <div className="space-y-4">
        <div className="flex items-end justify-between h-64 gap-2 px-4">
          {data.map((item, index) => {
            const barHeight = (item.count / maxCount) * chartHeight;
            const date = new Date(workoutViewMode === 'week' ? item.week : item.month);
            const label = workoutViewMode === 'week'
              ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full flex items-end justify-center" style={{ height: chartHeight }}>
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-700 hover:to-blue-500 cursor-pointer group relative"
                    style={{ height: `${barHeight}px`, minHeight: item.count > 0 ? '8px' : '0' }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.count} workout{item.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 text-center transform -rotate-45 origin-top-left w-16">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render line chart for exercises
  const renderExerciseChart = () => {
    if (!exerciseStats || !exerciseStats.byDay) return null;

    const data = exerciseStats.byDay;
    
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No exercise data available for this period
        </div>
      );
    }

    const maxCount = Math.max(...data.map(d => d.count), 1);
    const chartHeight = 200;
    const chartWidth = 800;
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1 || 1)) * chartWidth;
      const y = chartHeight - (item.count / maxCount) * chartHeight;
      return { x, y, count: item.count, date: item.date };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    return (
      <div className="space-y-4 overflow-x-auto">
        <div className="min-w-full px-4" style={{ minWidth: `${Math.max(chartWidth, 600)}px` }}>
          <svg width={chartWidth} height={chartHeight + 40} className="w-full">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1="0"
                y1={chartHeight * ratio}
                x2={chartWidth}
                y2={chartHeight * ratio}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}

            {/* Area under line */}
            <path
              d={areaD}
              fill="url(#exerciseGradient)"
              opacity="0.3"
            />

            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#8b5cf6"
                  className="cursor-pointer hover:r-7 transition-all"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="12"
                  fill="transparent"
                  className="cursor-pointer"
                >
                  <title>{`${new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${point.count} exercise${point.count !== 1 ? 's' : ''}`}</title>
                </circle>
              </g>
            ))}

            {/* X-axis labels */}
            {points.map((point, index) => {
              if (data.length <= 7 || index % Math.ceil(data.length / 7) === 0) {
                return (
                  <text
                    key={`label-${index}`}
                    x={point.x}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#6b7280"
                  >
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </text>
                );
              }
              return null;
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="exerciseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Analytics</h1>
          <p className="text-gray-600 mt-1">Track your workout and exercise statistics</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-sm text-blue-100 mb-1">All-Time Workouts</div>
              <div className="text-4xl font-bold">{overview.allTime.workouts}</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-sm text-green-100 mb-1">This Week</div>
              <div className="text-4xl font-bold">{overview.thisWeek.workouts}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-sm text-purple-100 mb-1">This Month</div>
              <div className="text-4xl font-bold">{overview.thisMonth.workouts}</div>
            </div>
          </div>
        )}

        {/* Workout Statistics Widget */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Workout Activity</h2>
              
              <div className="flex flex-wrap gap-2">
                {/* Time Range Selector */}
                <select
                  value={workoutTimeRange}
                  onChange={(e) => setWorkoutTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="thisweek">This Week</option>
                  <option value="thismonth">This Month</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>

                {/* View Mode Selector */}
                <select
                  value={workoutViewMode}
                  onChange={(e) => setWorkoutViewMode(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">By Week</option>
                  <option value="month">By Month</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range */}
            {workoutTimeRange === 'custom' && (
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={workoutCustomStart}
                    onChange={(e) => setWorkoutCustomStart(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={workoutCustomEnd}
                    onChange={(e) => setWorkoutCustomEnd(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Total Count */}
            {workoutStats && (
              <div className="text-center py-4">
                <div className="text-5xl font-bold text-blue-600">{workoutStats.total}</div>
                <div className="text-gray-600 mt-1">Total Workouts</div>
              </div>
            )}

            {/* Chart */}
            <div className="mt-6">
              {renderWorkoutChart()}
            </div>
          </div>
        </div>

        {/* Exercise Statistics Widget */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Daily Exercise Count</h2>
              
              <div className="flex flex-wrap gap-2">
                {/* Time Range Selector */}
                <select
                  value={exerciseTimeRange}
                  onChange={(e) => setExerciseTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisweek">This Week</option>
                  <option value="thismonth">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range */}
            {exerciseTimeRange === 'custom' && (
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={exerciseCustomStart}
                    onChange={(e) => setExerciseCustomStart(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={exerciseCustomEnd}
                    onChange={(e) => setExerciseCustomEnd(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Total Count */}
            {exerciseStats && (
              <div className="text-center py-4">
                <div className="text-5xl font-bold text-purple-600">{exerciseStats.total}</div>
                <div className="text-gray-600 mt-1">Total Exercises</div>
              </div>
            )}

            {/* Chart */}
            <div className="mt-6">
              {renderExerciseChart()}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberProgress;

