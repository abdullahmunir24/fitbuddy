import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';

const MemberCardio = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  
  // Analytics data
  const [pacePerSession, setPacePerSession] = useState([]);
  const [paceImprovement, setPaceImprovement] = useState([]);
  const [caloriesPerWorkout, setCaloriesPerWorkout] = useState([]);
  const [weeklyCalories, setWeeklyCalories] = useState([]);
  const [caloriesByType, setCaloriesByType] = useState([]);

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
  }, [period]);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/cardio?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
        processWeeklyData(data.data);
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
      const response = await fetch(`http://localhost:3001/api/cardio/stats?period=${period}`, {
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

  const processWeeklyData = (sessionsData) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const weekData = last7Days.map(date => {
      const daySessions = sessionsData.filter(s => s.session_date === date);
      return {
        date,
        dayLabel: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        duration: daySessions.reduce((sum, s) => sum + parseInt(s.duration_minutes || 0), 0),
        distance: daySessions.reduce((sum, s) => sum + parseFloat(s.distance_km || 0), 0),
        calories: daySessions.reduce((sum, s) => sum + parseInt(s.calories_burned || 0), 0),
        sessions: daySessions.length,
      };
    });

    setWeeklyData(weekData);
  };

  const processMonthlyTrend = (sessionsData) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const trend = last30Days.map(date => {
      const daySessions = sessionsData.filter(s => s.session_date === date);
      return {
        date,
        distance: daySessions.reduce((sum, s) => sum + parseFloat(s.distance_km || 0), 0),
      };
    });

    setMonthlyTrend(trend);
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

    // 5. Calories by Cardio Type (for pie chart)
    const typeData = {};
    sessionsData.forEach(session => {
      const type = session.activity_type;
      if (!typeData[type]) {
        typeData[type] = {
          activity: type,
          label: type,
          calories: 0,
          sessions: 0,
          distance: 0,
        };
      }
      
      typeData[type].calories += parseInt(session.calories_burned) || 0;
      typeData[type].sessions += 1;
      typeData[type].distance += parseFloat(session.distance_km) || 0;
    });

    const typeArray = Object.values(typeData).sort((a, b) => b.calories - a.calories);
    setCaloriesByType(typeArray);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingSession
        ? `http://localhost:3001/api/cardio/${editingSession.id}`
        : 'http://localhost:3001/api/cardio';
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
      const response = await fetch(`http://localhost:3001/api/cardio/${id}`, {
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
          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">7-Day Activity</h3>
            <div className="space-y-4">
              {/* Duration Chart */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Duration (minutes)</p>
                <div className="flex items-end justify-between h-32 gap-2">
                  {weeklyData.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '100%' }}>
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-500"
                          style={{
                            height: `${(day.duration / maxWeeklyDuration) * 100}%`,
                          }}
                        >
                          {day.duration > 0 && (
                            <div className="text-[10px] text-white font-bold text-center mt-1">
                              {day.duration}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 font-medium">{day.dayLabel}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calories Chart */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Calories Burned</p>
                <div className="flex items-end justify-between h-24 gap-2">
                  {weeklyData.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '100%' }}>
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all duration-500"
                          style={{
                            height: `${(day.calories / maxWeeklyCalories) * 100}%`,
                          }}
                        >
                          {day.calories > 0 && (
                            <div className="text-[9px] text-white font-bold text-center mt-1">
                              {day.calories}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Breakdown</h3>
            {stats?.byActivity && stats.byActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.byActivity
                  .sort((a, b) => b.total_duration - a.total_duration)
                  .map((activity, idx) => {
                    const totalAllActivities = stats.byActivity.reduce(
                      (sum, a) => sum + parseInt(a.total_duration || 0),
                      0
                    );
                    const percentage = (parseInt(activity.total_duration) / totalAllActivities) * 100;

                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getActivityIcon(activity.activity_type)}</span>
                            <span className="font-medium text-gray-700 capitalize">
                              {activity.activity_type.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600 font-semibold">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full ${getActivityColor(activity.activity_type)} transition-all duration-500 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>{activity.total_sessions} sessions</span>
                          <span>
                            {parseFloat(activity.total_distance || 0).toFixed(1)} km • {Math.round(activity.total_duration)} min
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No activity data yet. Start logging sessions!</p>
            )}
          </div>
        </div>

        {/* 30-Day Distance Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">30-Day Distance Trend</h3>
          <div className="h-48 flex items-end gap-0.5">
            {monthlyTrend.map((day, idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t hover:from-cyan-600 hover:to-cyan-500 transition-all cursor-pointer relative group"
                style={{
                  height: `${(day.distance / maxMonthlyDistance) * 100}%`,
                  minHeight: day.distance > 0 ? '4px' : '0',
                }}
                title={`${new Date(day.date).toLocaleDateString()}: ${day.distance.toFixed(1)} km`}
              >
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {day.distance.toFixed(1)} km
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{monthlyTrend[0]?.date && new Date(monthlyTrend[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span>Today</span>
          </div>
        </div>

        {/* Analytics Section */}
        {sessions.length > 0 && (
          <>
            {/* Pace Charts */}
            {pacePerSession.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pace Per Session */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Pace Per Session</h3>
                    <p className="text-sm text-gray-600">Your pace for each workout (lower is faster)</p>
                  </div>
                  <LineChart 
                    data={pacePerSession} 
                    dataKey="pace" 
                    label="Pace (min/km)"
                    color="blue"
                    height={200}
                  />
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Best Pace</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatPace(Math.min(...pacePerSession.map(p => p.pace)))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Avg Pace</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatPace(pacePerSession.reduce((sum, p) => sum + p.pace, 0) / pacePerSession.length)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Sessions</p>
                      <p className="text-lg font-bold text-gray-900">
                        {pacePerSession.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pace Improvement Trend */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Pace Improvement Trend</h3>
                    <p className="text-sm text-gray-600">7-day moving average (shows overall improvement)</p>
                  </div>
                  <LineChart 
                    data={paceImprovement} 
                    dataKey="pace" 
                    label="Avg Pace (min/km)"
                    color="green"
                    height={200}
                  />
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    {paceImprovement.length >= 2 && (
                      <>
                        {paceImprovement[0].pace > paceImprovement[paceImprovement.length - 1].pace ? (
                          <div className="flex items-center gap-2 text-green-700">
                            <span className="text-2xl">📈</span>
                            <div>
                              <p className="font-semibold">Great progress!</p>
                              <p className="text-sm">Your pace has improved by {formatPace(paceImprovement[0].pace - paceImprovement[paceImprovement.length - 1].pace)}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-2xl">💪</span>
                            <div>
                              <p className="font-semibold">Keep pushing!</p>
                              <p className="text-sm">Consistency is key to improvement</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Calories Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calories Per Workout */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Calories Burned Per Workout</h3>
                  <p className="text-sm text-gray-600">Energy expenditure for each session</p>
                </div>
                <BarChart 
                  data={caloriesPerWorkout} 
                  dataKey="calories" 
                  labelKey="label"
                  color="orange"
                  height={220}
                />
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Highest</p>
                    <p className="text-lg font-bold text-orange-600">
                      {Math.max(...caloriesPerWorkout.map(c => c.calories))} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Average</p>
                    <p className="text-lg font-bold text-orange-600">
                      {Math.round(caloriesPerWorkout.reduce((sum, c) => sum + c.calories, 0) / caloriesPerWorkout.length)} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {caloriesPerWorkout.reduce((sum, c) => sum + c.calories, 0).toLocaleString()} kcal
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly Calories */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Weekly Calories Burned</h3>
                  <p className="text-sm text-gray-600">Total calories burned each week</p>
                </div>
                <BarChart 
                  data={weeklyCalories} 
                  dataKey="calories" 
                  labelKey="label"
                  color="purple"
                  height={220}
                />
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-semibold">Weekly Average</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {Math.round(weeklyCalories.reduce((sum, w) => sum + w.calories, 0) / weeklyCalories.length)} kcal
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-purple-700 font-semibold">Total Weeks</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {weeklyCalories.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calories by Activity Type */}
            {caloriesByType.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Calories by Activity Type</h3>
                  <p className="text-sm text-gray-600">Distribution of calories burned across different activities (% of total cardio calories)</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Pie Chart */}
                  <div className="flex items-center justify-center">
                    <PieChart 
                      data={caloriesByType} 
                      dataKey="calories" 
                      labelKey="activity"
                      size={280}
                    />
                  </div>

                  {/* Horizontal Bar Chart */}
                  <div>
                    <BarChart 
                      data={caloriesByType} 
                      dataKey="calories" 
                      labelKey="activity"
                      color="indigo"
                      horizontal={true}
                    />
                    
                    {/* Activity Details */}
                    <div className="mt-6 space-y-3">
                      {caloriesByType.map((type, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {type.activity.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-600">
                              {type.sessions} sessions • {type.distance.toFixed(1)} km
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-indigo-600">
                              {type.calories.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">kcal</p>
                          </div>
                        </div>
                      ))}
                    </div>
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
