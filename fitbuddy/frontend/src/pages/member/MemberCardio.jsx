import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Modern color palette
const COLORS = {
  primary: '#6366f1',    // indigo
  secondary: '#8b5cf6',  // purple
  success: '#10b981',    // green
  warning: '#f59e0b',    // amber
  danger: '#ef4444',     // red
  info: '#3b82f6',       // blue
  cyan: '#06b6d4',       // cyan
  pink: '#ec4899',       // pink
  teal: '#14b8a6',       // teal
  orange: '#f97316',     // orange
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.cyan,
  COLORS.secondary,
  COLORS.danger,
  COLORS.pink,
  COLORS.teal,
];

// Unified card styling
const CARD_PADDING = 'p-6';
const CHART_HEIGHT = 280;
const CARD_CLASS = 'bg-white rounded-xl shadow-lg';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl">
        <p className="font-semibold text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {formatter ? formatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MemberCardio = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const [sessions, setSessions] = useState([]);
  const [allSessions, setAllSessions] = useState([]); // Store all sessions for filtering
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.
  
  // Analytics data
  const [pacePerSession, setPacePerSession] = useState([]);
  const [paceImprovement, setPaceImprovement] = useState([]);
  const [caloriesPerWorkout, setCaloriesPerWorkout] = useState([]);
  const [weeklyCalories, setWeeklyCalories] = useState([]);
  const [caloriesByType, setCaloriesByType] = useState([]);
  const [distancePerSession, setDistancePerSession] = useState([]);
  
  // Filter states
  const [paceActivityFilter, setPaceActivityFilter] = useState('all');
  const [paceImprovementActivityFilter, setPaceImprovementActivityFilter] = useState('all');
  const [analyticsDateFilter, setAnalyticsDateFilter] = useState('7days'); // Unified filter for pace, distance, and calories charts

  const [formData, setFormData] = useState({
    activityType: 'running',
    sessionDate: new Date().toISOString().split('T')[0],
    durationMinutes: '',
    distanceKm: '',
    intensityLevel: 'moderate',
    location: '',
    notes: '',
  });

  const activityTypes = [
    { value: 'running', label: 'Running', icon: '🏃', color: 'bg-red-500' },
    { value: 'cycling', label: 'Cycling', icon: '🚴', color: 'bg-blue-500' },
    { value: 'swimming', label: 'Swimming', icon: '🏊', color: 'bg-cyan-500' },
    { value: 'walking', label: 'Walking', icon: '🚶', color: 'bg-green-500' },
    { value: 'rowing', label: 'Rowing', icon: '🚣', color: 'bg-purple-500' },
    { value: 'elliptical', label: 'Elliptical', icon: '⚙️', color: 'bg-orange-500' },
    { value: 'stair_climbing', label: 'Stairs', icon: '🪜', color: 'bg-yellow-500' },
    { value: 'hiking', label: 'Hiking', icon: '🥾', color: 'bg-emerald-500' },
  ];

  const intensityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'moderate', label: 'Moderate', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'very_high', label: 'Very High', color: 'text-red-600' },
  ];

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, []); // Removed period dependency, fetch all sessions once on mount

  // Update weekly data when week offset or sessions change
  useEffect(() => {
    if (allSessions.length > 0) {
      processWeeklyData(allSessions, weekOffset);
    }
  }, [weekOffset, allSessions]);

  const getDateISOFromDaysAgo = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekDateRange = (offset) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // For offset 0: 6 days ago to today (last 7 days)
    // For offset -1: 13 days ago to 7 days ago (previous 7 days)
    // For offset -2: 20 days ago to 14 days ago (2 weeks ago)
    const endDaysAgo = Math.abs(offset) * 7; // 0, 7, 14, etc.
    const startDaysAgo = endDaysAgo + 6;      // 6, 13, 20, etc.
    
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - startDaysAgo);
    
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - endDaysAgo);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch ALL sessions (limit=1000 to get all data)
      const response = await fetch(`${API_URL}/api/cardio?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        console.log('Fetched sessions:', data.data.length);
        setSessions(data.data);
        setAllSessions(data.data); // Store all sessions for filtering
        processWeeklyData(data.data, weekOffset);
        processMonthlyTrend(data.data);
        processAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cardio/stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyData = (sessionsData, offset = 0) => {
    const weekData = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('========== PROCESSING WEEKLY DATA ==========');
    console.log('Offset:', offset);
    console.log('Total sessions:', sessionsData.length);
    
    // For offset 0: show last 7 days ending today (days 0-6 ago)
    // For offset -1: show previous 7 days (days 7-13 ago)
    // For offset -2: show 2 weeks ago (days 14-20 ago)
    const baseOffset = Math.abs(offset) * 7;
    
    for (let i = 0; i < 7; i++) {
      const daysAgo = baseOffset + i;
      
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const daySessions = sessionsData.filter(s => {
        const sessionDate = s.session_date.split('T')[0];
        return sessionDate === dateStr;
      });
      
      const duration = daySessions.reduce((sum, s) => sum + parseInt(s.duration_minutes || 0), 0);
      const calories = daySessions.reduce((sum, s) => sum + parseInt(s.calories_burned || 0), 0);
      
      console.log(`${dateStr} (${dayLabel}): ${daySessions.length} sessions, ${duration} min, ${calories} kcal`);
      
      weekData.push({
        date: dateStr,
        dayLabel,
        duration: duration,
        distance: daySessions.reduce((sum, s) => sum + parseFloat(s.distance_km || 0), 0),
        calories: calories,
        sessions: daySessions.length,
      });
    }
    
    // Reverse to show chronological order (oldest to newest)
    weekData.reverse();

    console.log('========== FINAL WEEK DATA ==========');
    console.log(weekData);
    console.log('==========================================');
    setWeeklyData(weekData);
  };

  const processMonthlyTrend = (sessionsData) => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const dateStr = getDateISOFromDaysAgo(i);
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const daySessions = sessionsData.filter(s => s.session_date === dateStr);
      last30Days.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        distance: daySessions.reduce((sum, s) => sum + parseFloat(s.distance_km || 0), 0),
      });
    }

    setMonthlyTrend(last30Days);
  };

  const processAnalyticsData = (sessionsData) => {
    if (!sessionsData || sessionsData.length === 0) {
      setPacePerSession([]);
      setPaceImprovement([]);
      setCaloriesPerWorkout([]);
      setWeeklyCalories([]);
      setCaloriesByType([]);
      return;
    }

    // Sort sessions by date (oldest first for trends)
    const sortedSessions = [...sessionsData].sort((a, b) => 
      new Date(a.session_date) - new Date(b.session_date)
    );

    // 1. Pace Per Session (only sessions with pace data)
    const paceData = sortedSessions
      .filter(s => s.pace_min_per_km && s.pace_min_per_km > 0)
      .map((session, index) => ({
        label: new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: session.session_date,
        pace: parseFloat(session.pace_min_per_km),
        activity: session.activity_type,
      }));
    setPacePerSession(paceData);

    // 2. Pace Improvement Over Time (7-day moving average)
    if (paceData.length > 0) {
      const movingAvg = [];
      const windowSize = Math.min(7, paceData.length);
      
      for (let i = 0; i < paceData.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const window = paceData.slice(start, i + 1);
        const avg = window.reduce((sum, item) => sum + item.pace, 0) / window.length;
        
        movingAvg.push({
          label: paceData[i].label,
          date: paceData[i].date,
          pace: avg,
          activity: paceData[i].activity,
        });
      }
      setPaceImprovement(movingAvg);
    } else {
      setPaceImprovement([]);
    }

    // 3. Calories Burned Per Workout
    const caloriesData = sortedSessions.map((session) => ({
      label: new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: session.session_date,
      calories: parseInt(session.calories_burned) || 0,
      activity: session.activity_type,
    }));
    setCaloriesPerWorkout(caloriesData);

    // 4. Total Weekly Calories Burned
    const weeklyData = {};
    sortedSessions.forEach(session => {
      const date = new Date(session.session_date);
      // Get the Monday of the week
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      const weekKey = monday.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          label: `Week of ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          calories: 0,
          sessions: 0,
        };
      }
      
      weeklyData[weekKey].calories += parseInt(session.calories_burned) || 0;
      weeklyData[weekKey].sessions += 1;
    });

    const weeklyArray = Object.values(weeklyData).sort((a, b) => 
      new Date(a.week) - new Date(b.week)
    );
    setWeeklyCalories(weeklyArray);

    // 5. Time spent by Activity Type (for pie chart) - changed from calories to duration
    const typeData = {};
    sessionsData.forEach(session => {
      const type = session.activity_type;
      if (!typeData[type]) {
        typeData[type] = {
          activity: type,
          label: type,
          duration: 0, // Changed from calories to duration
          sessions: 0,
          distance: 0,
        };
      }
      
      typeData[type].duration += parseInt(session.duration_minutes) || 0;
      typeData[type].sessions += 1;
      typeData[type].distance += parseFloat(session.distance_km) || 0;
    });

    const typeArray = Object.values(typeData).sort((a, b) => b.duration - a.duration);
    setCaloriesByType(typeArray);

    // 6. Distance Per Session
    const distanceData = sortedSessions
      .filter(s => s.distance_km && parseFloat(s.distance_km) > 0)
      .map(session => ({
        label: new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: session.session_date,
        distance: parseFloat(session.distance_km),
        activity: session.activity_type,
      }));
    setDistancePerSession(distanceData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingSession
        ? `${API_URL}/api/cardio/${editingSession.id}`
        : `${API_URL}/api/cardio`;
      const method = editingSession ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchSessions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cardio/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        fetchSessions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      activityType: session.activity_type,
      sessionDate: session.session_date,
      durationMinutes: session.duration_minutes,
      distanceKm: session.distance_km || '',
      intensityLevel: session.intensity_level,
      location: session.location || '',
      notes: session.notes || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      activityType: 'running',
      sessionDate: new Date().toISOString().split('T')[0],
      durationMinutes: '',
      distanceKm: '',
      intensityLevel: 'moderate',
      location: '',
      notes: '',
    });
    setEditingSession(null);
  };

  const formatPace = (pace) => {
    if (!pace) return 'N/A';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
  };

  const getActivityIcon = (type) => {
    return activityTypes.find(a => a.value === type)?.icon || '🏃';
  };

  const getActivityColor = (type) => {
    return activityTypes.find(a => a.value === type)?.color || 'bg-gray-500';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading cardio data...</div>
        </div>
      </DashboardLayout>
    );
  }

  const maxWeeklyDuration = Math.max(...weeklyData.map(d => d.duration), 1);
  const maxWeeklyCalories = Math.max(...weeklyData.map(d => d.calories), 1);
  const maxMonthlyDistance = Math.max(...monthlyTrend.map(d => d.distance), 1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cardio Tracking & Analytics</h1>
            <p className="text-gray-600 mt-1">Track and analyze your cardio workouts</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            + Log Session
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm w-fit">
          {[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
            { value: 'all', label: 'All Time' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                period === p.value
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Sessions</p>
                <p className="text-3xl font-bold mt-2">
                  {stats?.overall?.total_sessions || 0}
                </p>
              </div>
              <div className="text-4xl opacity-80">🎯</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Duration</p>
                <p className="text-3xl font-bold mt-2">
                  {Math.round(stats?.overall?.total_duration || 0)}
                  <span className="text-lg ml-1">min</span>
                </p>
              </div>
              <div className="text-4xl opacity-80">⏱️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Distance</p>
                <p className="text-3xl font-bold mt-2">
                  {parseFloat(stats?.overall?.total_distance || 0).toFixed(1)}
                  <span className="text-lg ml-1">km</span>
                </p>
              </div>
              <div className="text-4xl opacity-80">📍</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Calories Burned</p>
                <p className="text-3xl font-bold mt-2">
                  {Math.round(stats?.overall?.total_calories || 0)}
                  <span className="text-lg ml-1">kcal</span>
                </p>
              </div>
              <div className="text-4xl opacity-80">🔥</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart - Redesigned with Recharts */}
          <div className={`${CARD_CLASS} ${CARD_PADDING}`}>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">7-Day Activity</h3>
              <p className="text-sm text-gray-500">{getWeekDateRange(weekOffset)}</p>
            </div>
            
            {/* Date Filter for 7-Day Activity */}
            <div className="mb-4 flex gap-2 flex-wrap items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setWeekOffset(0)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    weekOffset === 0 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setWeekOffset(-1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    weekOffset === -1 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Previous Week
                </button>
                <button
                  onClick={() => setWeekOffset(-2)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    weekOffset === -2 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  2 Weeks Ago
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setWeekOffset(weekOffset - 1)}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  title="Previous week"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  disabled={weekOffset >= 0}
                  className={`p-1.5 rounded-lg border border-gray-200 transition-colors ${
                    weekOffset >= 0 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  title="Next week"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Debug Info */}
            {weeklyData.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">⚠️ No weekly data loaded. Week offset: {weekOffset}</p>
              </div>
            )}
            
            {weeklyData.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">✓ Loaded {weeklyData.length} days of data</p>
                <p className="text-xs text-blue-600 mt-1">
                  Total duration: {weeklyData.reduce((sum, d) => sum + d.duration, 0)} min, 
                  Total calories: {weeklyData.reduce((sum, d) => sum + d.calories, 0)} kcal
                </p>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="dayLabel" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
                />
                <Tooltip 
                  content={<CustomTooltip formatter={(value) => `${value} min`} />}
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                />
                <Bar dataKey="duration" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="dayLabel" 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    label={{ value: 'Calories', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }}
                  />
                  <Tooltip 
                    content={<CustomTooltip formatter={(value) => `${value} kcal`} />}
                    cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
                  />
                  <Bar dataKey="calories" fill={COLORS.orange} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calories Breakdown by Activity - Pie Chart */}
          <div className={`${CARD_CLASS} ${CARD_PADDING}`}>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Calories Breakdown</h3>
              <p className="text-sm text-gray-500">Calories burned by activity type</p>
            </div>
            
            {/* Date Filter */}
            <div className="mb-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setWeekOffset(0)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  weekOffset === 0 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setWeekOffset(-1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  weekOffset === -1 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Previous Week
              </button>
              <button
                onClick={() => setWeekOffset(-2)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  weekOffset === -2 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                2 Weeks Ago
              </button>
            </div>
            
            {/* Debug Info */}
            {(!allSessions || allSessions.length === 0) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">⚠️ No sessions loaded. allSessions: {allSessions ? allSessions.length : 'null'}</p>
              </div>
            )}
            
            {allSessions && allSessions.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">✓ Loaded {allSessions.length} total sessions</p>
              </div>
            )}
            
            {allSessions && allSessions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={(() => {
                          // Calculate calories for each activity in the current week
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const caloriesByActivity = {};
                          
                          for (let i = 6; i >= 0; i--) {
                            const daysAgo = i - (weekOffset * 7);
                            if (daysAgo < 0) continue;
                            
                            const date = new Date(today);
                            date.setDate(date.getDate() - daysAgo);
                            const dateStr = date.toISOString().split('T')[0];
                            
                            const daySessions = allSessions.filter(s => s.session_date.split('T')[0] === dateStr);
                            daySessions.forEach(session => {
                              const activity = session.activity_type;
                              const calories = parseInt(session.calories_burned || 0);
                              caloriesByActivity[activity] = (caloriesByActivity[activity] || 0) + calories;
                            });
                          }
                          
                          return Object.entries(caloriesByActivity).map(([activity, calories]) => ({
                            name: activity.replace('_', ' '),
                            value: calories,
                            activity: activity
                          }));
                        })()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {(() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const caloriesByActivity = {};
                          
                          for (let i = 6; i >= 0; i--) {
                            const daysAgo = i - (weekOffset * 7);
                            if (daysAgo < 0) continue;
                            
                            const date = new Date(today);
                            date.setDate(date.getDate() - daysAgo);
                            const dateStr = date.toISOString().split('T')[0];
                            
                            const daySessions = allSessions.filter(s => s.session_date.split('T')[0] === dateStr);
                            daySessions.forEach(session => {
                              const activity = session.activity_type;
                              const calories = parseInt(session.calories_burned || 0);
                              caloriesByActivity[activity] = (caloriesByActivity[activity] || 0) + calories;
                            });
                          }
                          
                          return Object.keys(caloriesByActivity).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ));
                        })()}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl">
                                <p className="font-semibold text-sm capitalize mb-1">{payload[0].payload.name}</p>
                                <p className="text-xs">🔥 {payload[0].value} kcal</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend with Stats */}
                <div className="flex flex-col justify-center space-y-3">
                  {(() => {
                    // Calculate calories for legend
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const caloriesByActivity = {};
                    
                    for (let i = 6; i >= 0; i--) {
                      const daysAgo = i - (weekOffset * 7);
                      if (daysAgo < 0) continue;
                      
                      const date = new Date(today);
                      date.setDate(date.getDate() - daysAgo);
                      const dateStr = date.toISOString().split('T')[0];
                      
                      const daySessions = allSessions.filter(s => s.session_date.split('T')[0] === dateStr);
                      daySessions.forEach(session => {
                        const activity = session.activity_type;
                        const calories = parseInt(session.calories_burned || 0);
                        caloriesByActivity[activity] = (caloriesByActivity[activity] || 0) + calories;
                      });
                    }
                    
                    const totalCalories = Object.values(caloriesByActivity).reduce((sum, cal) => sum + cal, 0);
                    
                    return Object.entries(caloriesByActivity)
                      .sort((a, b) => b[1] - a[1])
                      .map(([activity, calories], index) => {
                        const percentage = totalCalories > 0 ? ((calories / totalCalories) * 100).toFixed(1) : 0;
                        return (
                          <div key={activity} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                              />
                              <span className="text-sm font-medium text-gray-700 capitalize flex items-center gap-2">
                                {getActivityIcon(activity)}
                                {activity.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">{percentage}%</p>
                              <p className="text-xs text-gray-500">{calories} kcal</p>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm font-medium">No activity data yet</p>
                <p className="text-xs">Start logging sessions!</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Section */}
        {sessions.length > 0 && (
          <>
            {/* Shared Date Filter for Analytics Charts */}
            <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Analytics Time Period</h4>
                  <p className="text-xs text-gray-600">Filter applies to Pace, Distance, and Calories charts</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setAnalyticsDateFilter('7days')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      analyticsDateFilter === '7days'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    📅 Last 7 Days
                  </button>
                  <button
                    onClick={() => setAnalyticsDateFilter('30days')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      analyticsDateFilter === '30days'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    📆 Last 30 Days
                  </button>
                  <button
                    onClick={() => setAnalyticsDateFilter('90days')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      analyticsDateFilter === '90days'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    🗓️ Last 3 Months
                  </button>
                  <button
                    onClick={() => setAnalyticsDateFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      analyticsDateFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    📊 All Time
                  </button>
                </div>
              </div>
            </div>

            {/* Pace Charts - Enhanced */}
            {pacePerSession.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pace Per Session */}
                <div className={`${CARD_CLASS} ${CARD_PADDING}`}>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Pace Per Session</h3>
                    <p className="text-sm text-gray-600">Your pace for each workout (lower is faster)</p>
                  </div>
                  
                  {/* Activity Filter */}
                  <div className="mb-4 flex gap-2 flex-wrap">
                    <button
                      onClick={() => setPaceActivityFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        paceActivityFilter === 'all'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All Activities
                    </button>
                    <button
                      onClick={() => setPaceActivityFilter('running')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        paceActivityFilter === 'running'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🏃 Running
                    </button>
                    <button
                      onClick={() => setPaceActivityFilter('cycling')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        paceActivityFilter === 'cycling'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🚴 Cycling
                    </button>
                    <button
                      onClick={() => setPaceActivityFilter('walking')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        paceActivityFilter === 'walking'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🚶 Walking
                    </button>
                  </div>

                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart 
                      data={(() => {
                        const now = new Date();
                        let filtered = paceActivityFilter === 'all' 
                          ? pacePerSession 
                          : pacePerSession.filter(p => p.activity === paceActivityFilter);
                        
                        // Apply date filter
                        if (analyticsDateFilter === '7days') {
                          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                          filtered = filtered.filter(p => new Date(p.date) >= sevenDaysAgo);
                        } else if (analyticsDateFilter === '30days') {
                          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                          filtered = filtered.filter(p => new Date(p.date) >= thirtyDaysAgo);
                        } else if (analyticsDateFilter === '90days') {
                          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                          filtered = filtered.filter(p => new Date(p.date) >= ninetyDaysAgo);
                        }
                        
                        return filtered;
                      })()} 
                      margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="paceFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.info} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.info} stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="label"
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        label={{ value: 'Pace (min/km)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
                        domain={['dataMin - 0.5', 'dataMax + 0.5']}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl">
                                <p className="font-semibold text-sm mb-1">{data.label}</p>
                                <p className="text-xs">Pace: {formatPace(data.pace)}</p>
                                <p className="text-xs capitalize">Activity: {data.activity?.replace(/_/g, ' ')}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="pace" 
                        stroke={COLORS.info} 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#paceFill)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pace" 
                        stroke={COLORS.info} 
                        strokeWidth={2.5}
                        dot={{ fill: COLORS.info, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-6 grid grid-cols-3 gap-4 text-center pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Best Pace</p>
                      <p className="text-sm font-bold text-green-600">
                        {(() => {
                          const now = new Date();
                          let filtered = paceActivityFilter === 'all' 
                            ? pacePerSession 
                            : pacePerSession.filter(p => p.activity === paceActivityFilter);
                          
                          // Apply date filter
                          if (analyticsDateFilter === '7days') {
                            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            filtered = filtered.filter(p => new Date(p.date) >= sevenDaysAgo);
                          } else if (analyticsDateFilter === '30days') {
                            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            filtered = filtered.filter(p => new Date(p.date) >= thirtyDaysAgo);
                          } else if (analyticsDateFilter === '90days') {
                            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                            filtered = filtered.filter(p => new Date(p.date) >= ninetyDaysAgo);
                          }
                          
                          return filtered.length > 0
                            ? formatPace(Math.min(...filtered.map(p => p.pace)))
                            : 'N/A';
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Avg Pace</p>
                      <p className="text-sm font-bold text-blue-600">
                        {(() => {
                          const now = new Date();
                          let filtered = paceActivityFilter === 'all' 
                            ? pacePerSession 
                            : pacePerSession.filter(p => p.activity === paceActivityFilter);
                          
                          // Apply date filter
                          if (analyticsDateFilter === '7days') {
                            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            filtered = filtered.filter(p => new Date(p.date) >= sevenDaysAgo);
                          } else if (analyticsDateFilter === '30days') {
                            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            filtered = filtered.filter(p => new Date(p.date) >= thirtyDaysAgo);
                          } else if (analyticsDateFilter === '90days') {
                            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                            filtered = filtered.filter(p => new Date(p.date) >= ninetyDaysAgo);
                          }
                          
                          return filtered.length > 0
                            ? formatPace(filtered.reduce((sum, p) => sum + p.pace, 0) / filtered.length)
                            : 'N/A';
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Sessions</p>
                      <p className="text-sm font-bold text-gray-900">
                        {(() => {
                          const now = new Date();
                          let filtered = paceActivityFilter === 'all'
                            ? pacePerSession
                            : pacePerSession.filter(p => p.activity === paceActivityFilter);
                          
                          // Apply date filter
                          if (analyticsDateFilter === '7days') {
                            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            filtered = filtered.filter(p => new Date(p.date) >= sevenDaysAgo);
                          } else if (analyticsDateFilter === '30days') {
                            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            filtered = filtered.filter(p => new Date(p.date) >= thirtyDaysAgo);
                          } else if (analyticsDateFilter === '90days') {
                            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                            filtered = filtered.filter(p => new Date(p.date) >= ninetyDaysAgo);
                          }
                          
                          return filtered.length;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pace Improvement Trend */}
                <div className={`${CARD_CLASS} ${CARD_PADDING}`}>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Pace Improvement Trend</h3>
                    <p className="text-sm text-gray-600">7-day moving average showing your pace progression</p>
                  </div>
                  
                  {/* Activity Filter */}
                  <div className="mb-4 flex gap-2 flex-wrap">
                    <button
                      onClick={() => setPaceImprovementActivityFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        paceImprovementActivityFilter === 'all'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All Activities
                    </button>
                    <button
                      onClick={() => setPaceImprovementActivityFilter('running')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        paceImprovementActivityFilter === 'running'
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🏃 Running
                    </button>
                    <button
                      onClick={() => setPaceImprovementActivityFilter('cycling')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        paceImprovementActivityFilter === 'cycling'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🚴 Cycling
                    </button>
                    <button
                      onClick={() => setPaceImprovementActivityFilter('walking')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        paceImprovementActivityFilter === 'walking'
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🚶 Walking
                    </button>
                  </div>
                  
                  {(() => {
                    const now = new Date();
                    let filtered = paceImprovement;
                    
                    // Apply activity filter first
                    if (paceImprovementActivityFilter !== 'all') {
                      filtered = filtered.filter(p => p.activity === paceImprovementActivityFilter);
                    }
                    
                    // Apply date filter
                    if (analyticsDateFilter === '7days') {
                      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      filtered = filtered.filter(p => new Date(p.date) >= sevenDaysAgo);
                    } else if (analyticsDateFilter === '30days') {
                      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                      filtered = filtered.filter(p => new Date(p.date) >= thirtyDaysAgo);
                    } else if (analyticsDateFilter === '90days') {
                      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                      filtered = filtered.filter(p => new Date(p.date) >= ninetyDaysAgo);
                    }
                    
                    if (filtered.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                          <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-sm font-medium">Not enough pace data</p>
                          <p className="text-xs">Complete more workouts with distance tracking</p>
                        </div>
                      );
                    }
                    
                    return (
                      <>
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart 
                            data={filtered}
                            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                          >
                            <defs>
                              <linearGradient id="colorPaceImprovement" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis 
                              dataKey="label"
                              tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                              axisLine={{ stroke: '#d1d5db' }}
                              tickLine={{ stroke: '#d1d5db' }}
                              interval="preserveStartEnd"
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                              axisLine={{ stroke: '#d1d5db' }}
                              tickLine={{ stroke: '#d1d5db' }}
                              tickFormatter={(value) => value.toFixed(2)}
                              label={{ 
                                value: 'Pace (min/km)', 
                                angle: -90, 
                                position: 'insideLeft', 
                                style: { fontSize: 12, fill: '#6b7280', fontWeight: 600 } 
                              }}
                              domain={['dataMin - 0.2', 'dataMax + 0.2']}
                            />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700">
                                      <p className="font-semibold text-sm mb-2">{data.label}</p>
                                      <p className="text-xs mb-1 flex items-center gap-2">
                                        <span className="text-green-400">⏱️</span>
                                        <span>Pace: <span className="font-bold">{formatPace(data.pace)}</span></span>
                                      </p>
                                      {data.activity && (
                                        <p className="text-xs text-gray-400 capitalize flex items-center gap-1">
                                          {data.activity === 'running' && '🏃'}
                                          {data.activity === 'cycling' && '🚴'}
                                          {data.activity === 'walking' && '🚶'}
                                          {data.activity.replace(/_/g, ' ')}
                                        </p>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="pace" 
                              stroke="#10b981" 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill="url(#colorPaceImprovement)" 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="pace" 
                              stroke="#10b981" 
                              strokeWidth={3}
                              dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-6 p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl border border-green-100">
                          {filtered.length >= 2 ? (
                            <>
                              {filtered[0].pace > filtered[filtered.length - 1].pace ? (
                                <div className="flex items-center gap-4 text-green-700">
                                  <div className="text-4xl">📈</div>
                                  <div className="flex-1">
                                    <p className="font-bold text-base mb-1">Excellent progress!</p>
                                    <p className="text-sm mb-1">Your pace improved by <span className="font-bold text-green-600">{formatPace(filtered[0].pace - filtered[filtered.length - 1].pace)}</span></p>
                                    <p className="text-xs text-gray-600">
                                      📊 {filtered.length} data points
                                      {paceImprovementActivityFilter !== 'all' && (
                                        <span className="ml-2 capitalize">• {paceImprovementActivityFilter} only</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-4 text-gray-700">
                                  <div className="text-4xl">💪</div>
                                  <div className="flex-1">
                                    <p className="font-bold text-base mb-1">Keep pushing!</p>
                                    <p className="text-sm mb-1">Consistency is the key to improvement</p>
                                    <p className="text-xs text-gray-600">
                                      📊 {filtered.length} data points
                                      {paceImprovementActivityFilter !== 'all' && (
                                        <span className="ml-2 capitalize">• {paceImprovementActivityFilter} only</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-4 text-gray-700">
                              <div className="text-4xl">🏃</div>
                              <div>
                                <p className="font-bold text-base mb-1">Getting started!</p>
                                <p className="text-sm">Complete more sessions to see your improvement trend</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Calories Charts - Enhanced */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calories Per Workout */}
              <div className={`${CARD_CLASS} ${CARD_PADDING}`}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Calories Burned Per Workout</h3>
                  <p className="text-sm text-gray-600">Energy expenditure for each session</p>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart 
                    data={(() => {
                      const now = new Date();
                      let filtered = caloriesPerWorkout;
                      
                      if (analyticsDateFilter === '7days') {
                        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        filtered = caloriesPerWorkout.filter(c => new Date(c.date) >= sevenDaysAgo);
                      } else if (analyticsDateFilter === '30days') {
                        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        filtered = caloriesPerWorkout.filter(c => new Date(c.date) >= thirtyDaysAgo);
                      } else if (analyticsDateFilter === '90days') {
                        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        filtered = caloriesPerWorkout.filter(c => new Date(c.date) >= ninetyDaysAgo);
                      }
                      
                      return filtered;
                    })()} 
                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="caloriesBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.orange} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={COLORS.warning} stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="label"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      label={{ value: 'Calories (kcal)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl">
                              <p className="font-semibold text-sm mb-1">{data.label}</p>
                              <p className="text-xs">🔥 Calories: {data.calories} kcal</p>
                              <p className="text-xs capitalize">Activity: {data.activity?.replace(/_/g, ' ') || 'N/A'}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                      cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
                    />
                    <Bar dataKey="calories" fill="url(#caloriesBarGradient)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-3 gap-4 text-center pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Highest</p>
                    <p className="text-sm font-bold text-orange-600">
                      {(() => {
                        const now = new Date();
                        let filtered = caloriesPerWorkout;
                        if (analyticsDateFilter === '7days') {
                          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                          filtered = caloriesPerWorkout.filter(c => new Date(c.date) >= sevenDaysAgo);
                        } else if (analyticsDateFilter === '30days') {
                          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                          filtered = caloriesPerWorkout.filter(c => new Date(c.date) >= thirtyDaysAgo);
                        } else if (analyticsDateFilter === '90days') {
                          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                          filtered = caloriesPerWorkout.filter(c => new Date(c.date) >= ninetyDaysAgo);
                        }
                        return filtered.length > 0 ? Math.max(...filtered.map(c => c.calories)) : 0;
                      })()} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Average</p>
                    <p className="text-sm font-bold text-orange-600">
                      {(() => {
                        const now = new Date();
                        let filtered = caloriesPerWorkout;
                        if (analyticsDateFilter === '7days') {
                          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                          filtered = caloriesPerWorkout.filter(c => new Date(c.date) >= sevenDaysAgo);
                        } else if (analyticsDateFilter === '30days') {
                          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                          filtered = caloriesPerWorkout.filter(c => new Date(c.date) >= thirtyDaysAgo);
                        } else if (analyticsDateFilter === '90days') {
                          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                          filtered = caloriesPerWorkout.filter(c => new Date(c.date) >= ninetyDaysAgo);
                        }
                        return filtered.length > 0 ? Math.round(filtered.reduce((sum, c) => sum + c.calories, 0) / filtered.length) : 0;
                      })()} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    <p className="text-sm font-bold text-gray-900">
                      {(() => {
                        const now = new Date();
                        let filtered = caloriesPerWorkout;
                        if (analyticsDateFilter === '7days') {
                          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                          filtered = caloriesPerWorkout.filter(c => new Date(c.date) >= sevenDaysAgo);
                        } else if (analyticsDateFilter === '30days') {
                          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                          filtered = caloriesPerWorkout.filter(c => new Date(c.date) >= thirtyDaysAgo);
                        } else if (analyticsDateFilter === '90days') {
                          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                          filtered = caloriesPerWorkout.filter(c => new Date(c.date) >= ninetyDaysAgo);
                        }
                        return filtered.reduce((sum, c) => sum + c.calories, 0).toLocaleString();
                      })()} kcal
                    </p>
                  </div>
                </div>
              </div>

              {/* Distance Per Session - NEW */}
              <div className={`${CARD_CLASS} ${CARD_PADDING}`}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Distance Per Session</h3>
                  <p className="text-sm text-gray-600">Distance covered in each workout</p>
                </div>

                <ResponsiveContainer width="100%" height={240}>
                  <LineChart 
                    data={(() => {
                      const now = new Date();
                      let filtered = distancePerSession;
                      
                      if (analyticsDateFilter === '7days') {
                        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        filtered = distancePerSession.filter(d => new Date(d.date) >= sevenDaysAgo);
                      } else if (analyticsDateFilter === '30days') {
                        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        filtered = distancePerSession.filter(d => new Date(d.date) >= thirtyDaysAgo);
                      } else if (analyticsDateFilter === '90days') {
                        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        filtered = distancePerSession.filter(d => new Date(d.date) >= ninetyDaysAgo);
                      }
                      
                      return filtered;
                    })()} 
                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="distanceFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="label"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl">
                              <p className="font-semibold text-sm mb-1">{data.label}</p>
                              <p className="text-xs">Distance: {data.distance?.toFixed(2) || 0} km</p>
                              <p className="text-xs capitalize">Activity: {data.activity?.replace(/_/g, ' ') || 'N/A'}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="distance" 
                      stroke={COLORS.teal} 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#distanceFill)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="distance" 
                      stroke={COLORS.teal} 
                      strokeWidth={2.5}
                      dot={{ fill: COLORS.teal, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-3 gap-4 text-center pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Longest</p>
                    <p className="text-sm font-bold text-teal-600">
                      {(() => {
                        const now = new Date();
                        let filtered = distancePerSession;
                        if (analyticsDateFilter === '7days') {
                          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                          filtered = distancePerSession.filter(d => new Date(d.date) >= sevenDaysAgo);
                        } else if (analyticsDateFilter === '30days') {
                          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                          filtered = distancePerSession.filter(d => new Date(d.date) >= thirtyDaysAgo);
                        } else if (analyticsDateFilter === '90days') {
                          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                          filtered = distancePerSession.filter(d => new Date(d.date) >= ninetyDaysAgo);
                        }
                        return filtered.length > 0 
                          ? Math.max(...filtered.map(d => d.distance)).toFixed(2)
                          : '0.00';
                      })()} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Average</p>
                    <p className="text-sm font-bold text-teal-600">
                      {(() => {
                        const now = new Date();
                        let filtered = distancePerSession;
                        if (analyticsDateFilter === '7days') {
                          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                          filtered = distancePerSession.filter(d => new Date(d.date) >= sevenDaysAgo);
                        } else if (analyticsDateFilter === '30days') {
                          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                          filtered = distancePerSession.filter(d => new Date(d.date) >= thirtyDaysAgo);
                        } else if (analyticsDateFilter === '90days') {
                          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                          filtered = distancePerSession.filter(d => new Date(d.date) >= ninetyDaysAgo);
                        }
                        return filtered.length > 0
                          ? (filtered.reduce((sum, d) => sum + d.distance, 0) / filtered.length).toFixed(2)
                          : '0.00';
                      })()} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    <p className="text-sm font-bold text-gray-900">
                      {(() => {
                        const now = new Date();
                        let filtered = distancePerSession;
                        if (analyticsDateFilter === '7days') {
                          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                          filtered = distancePerSession.filter(d => new Date(d.date) >= sevenDaysAgo);
                        } else if (analyticsDateFilter === '30days') {
                          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                          filtered = distancePerSession.filter(d => new Date(d.date) >= thirtyDaysAgo);
                        } else if (analyticsDateFilter === '90days') {
                          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                          filtered = distancePerSession.filter(d => new Date(d.date) >= ninetyDaysAgo);
                        }
                        return filtered.reduce((sum, d) => sum + d.distance, 0).toFixed(1);
                      })()} km
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Calories - Full Width - Modern Design */}
            <div className={`${CARD_CLASS} ${CARD_PADDING}`}>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Weekly Calories Burned</h3>
                <p className="text-sm text-gray-600">Total calories burned each week with trend line</p>
              </div>
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <ComposedChart 
                  data={(() => {
                    const now = new Date();
                    let filtered = weeklyCalories;
                    
                    if (analyticsDateFilter === '7days') {
                      filtered = weeklyCalories.slice(-1);
                    } else if (analyticsDateFilter === '30days') {
                      filtered = weeklyCalories.slice(-4);
                    } else if (analyticsDateFilter === '90days') {
                      filtered = weeklyCalories.slice(-12);
                    }
                    
                    return filtered;
                  })()} 
                  margin={{ top: 10, right: 20, left: -10, bottom: 40 }}
                >
                  <defs>
                    <linearGradient id="weeklyBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.secondary} stopOpacity={0.95}/>
                      <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.85}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    angle={-25}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    label={{ value: 'Calories (kcal)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl">
                            <p className="font-semibold text-sm mb-1">{data.label}</p>
                            <p className="text-xs">🔥 Calories: {data.calories} kcal</p>
                            <p className="text-xs">💪 Sessions: {data.sessions}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                  />
                  <Bar dataKey="calories" fill="url(#weeklyBarGradient)" radius={[12, 12, 0, 0]} />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke={COLORS.warning} 
                    strokeWidth={3}
                    dot={{ fill: COLORS.warning, r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-6 flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                <div>
                  <p className="text-xs text-purple-700 font-semibold mb-1">Weekly Average</p>
                  <p className="text-xl font-bold text-purple-900">
                    {(() => {
                      const now = new Date();
                      let filtered = weeklyCalories;
                      if (analyticsDateFilter === '7days') {
                        filtered = weeklyCalories.slice(-1);
                      } else if (analyticsDateFilter === '30days') {
                        filtered = weeklyCalories.slice(-4);
                      } else if (analyticsDateFilter === '90days') {
                        filtered = weeklyCalories.slice(-12);
                      }
                      return filtered.length > 0 
                        ? Math.round(filtered.reduce((sum, w) => sum + w.calories, 0) / filtered.length).toLocaleString() 
                        : '0';
                    })()} kcal
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-purple-700 font-semibold mb-1">Best Week</p>
                  <p className="text-xl font-bold text-purple-900">
                    {(() => {
                      const now = new Date();
                      let filtered = weeklyCalories;
                      if (analyticsDateFilter === '7days') {
                        filtered = weeklyCalories.slice(-1);
                      } else if (analyticsDateFilter === '30days') {
                        filtered = weeklyCalories.slice(-4);
                      } else if (analyticsDateFilter === '90days') {
                        filtered = weeklyCalories.slice(-12);
                      }
                      return filtered.length > 0 
                        ? Math.max(...filtered.map(w => w.calories), 0).toLocaleString() 
                        : '0';
                    })()} kcal
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-purple-700 font-semibold mb-1">Total Weeks</p>
                  <p className="text-xl font-bold text-purple-900">
                    {(() => {
                      if (analyticsDateFilter === '7days') {
                        return Math.min(weeklyCalories.length, 1);
                      } else if (analyticsDateFilter === '30days') {
                        return Math.min(weeklyCalories.length, 4);
                      } else if (analyticsDateFilter === '90days') {
                        return Math.min(weeklyCalories.length, 12);
                      }
                      return weeklyCalories.length;
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Spent by Activity Type - Enhanced Pie Chart */}
            {caloriesByType.length > 0 && (
              <div className={`${CARD_CLASS} ${CARD_PADDING}`}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Time Spent by Activity Type</h3>
                  <p className="text-sm text-gray-600">Distribution of time spent on each activity</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Pie Chart */}
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={caloriesByType}
                          dataKey="duration"
                          nameKey="activity"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          label={({ activity, duration }) => {
                            const total = caloriesByType.reduce((sum, item) => sum + item.duration, 0);
                            const percent = ((duration / total) * 100).toFixed(0);
                            return `${percent}%`;
                          }}
                          labelLine={false}
                        >
                          {caloriesByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const total = caloriesByType.reduce((sum, item) => sum + item.duration, 0);
                              const percent = ((data.duration / total) * 100).toFixed(1);
                              return (
                                <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl">
                                  <p className="font-semibold text-sm capitalize mb-1">{data.activity.replace(/_/g, ' ')}</p>
                                  <p className="text-xs">Duration: {data.duration} min ({percent}%)</p>
                                  <p className="text-xs">Sessions: {data.sessions}</p>
                                  <p className="text-xs">Distance: {data.distance.toFixed(1)} km</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Activity Details List */}
                  <div className="space-y-3">
                    {caloriesByType.map((type, index) => {
                      const total = caloriesByType.reduce((sum, item) => sum + item.duration, 0);
                      const percentage = ((type.duration / total) * 100).toFixed(1);
                      
                      return (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div 
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 capitalize text-sm">
                                {type.activity.replace(/_/g, ' ')}
                              </p>
                              <p className="text-xs text-gray-600">
                                {type.sessions} sessions • {type.distance.toFixed(1)} km
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="text-lg font-bold" style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}>
                              {type.duration}
                            </p>
                            <p className="text-xs text-gray-500">{percentage}% • {type.duration} min</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Sessions</h2>
          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${getActivityColor(session.activity_type)} rounded-full flex items-center justify-center text-2xl`}>
                      {getActivityIcon(session.activity_type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 capitalize">
                        {session.activity_type.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(session.session_date).toLocaleDateString()} • {session.duration_minutes} min
                        {session.distance_km && ` • ${parseFloat(session.distance_km).toFixed(2)} km`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{session.calories_burned || 0} kcal</p>
                      {session.pace_min_per_km && (
                        <p className="text-xs text-gray-500">{formatPace(session.pace_min_per_km)}</p>
                      )}
                      <p className={`text-xs font-medium ${intensityLevels.find(i => i.value === session.intensity_level)?.color}`}>
                        {intensityLevels.find(i => i.value === session.intensity_level)?.label}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(session)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No sessions logged yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Log your first session →
              </button>
            </div>
          )}
        </div>

        {/* Log Session Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingSession ? 'Edit Session' : 'Log Cardio Session'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Type
                  </label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {activityTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (min) *
                    </label>
                    <input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.distanceKm}
                      onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intensity Level
                  </label>
                  <select
                    value={formData.intensityLevel}
                    onChange={(e) => setFormData({ ...formData, intensityLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {intensityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Calories will be calculated automatically based on activity and intensity
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Outdoor, Treadmill, Gym"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="How did you feel?"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    {editingSession ? 'Update' : 'Log Session'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemberCardio;
