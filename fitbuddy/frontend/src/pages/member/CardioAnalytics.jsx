import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';

const CardioAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [period, setPeriod] = useState('month');

  // Processed data for charts
  const [pacePerSession, setPacePerSession] = useState([]);
  const [paceImprovement, setPaceImprovement] = useState([]);
  const [caloriesPerWorkout, setCaloriesPerWorkout] = useState([]);
  const [weeklyCalories, setWeeklyCalories] = useState([]);
  const [caloriesByType, setCaloriesByType] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, [period]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/cardio?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
        processChartData(data.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (sessionsData) => {
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

    // 5. Calories by Cardio Type
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

  const formatPace = (pace) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cardio Analytics</h1>
            <p className="text-gray-600 mt-1">Performance metrics and trends</p>
          </div>
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

        {sessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              Start logging cardio sessions to see your performance analytics!
            </p>
          </div>
        ) : (
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
                        {formatPace(Math.min(...pacePerSession.map(p => p.pace)))} /km
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Avg Pace</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatPace(pacePerSession.reduce((sum, p) => sum + p.pace, 0) / pacePerSession.length)} /km
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
                              <p className="text-sm">Your pace has improved by {formatPace(paceImprovement[0].pace - paceImprovement[paceImprovement.length - 1].pace)}/km</p>
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Calories by Activity Type</h3>
                <p className="text-sm text-gray-600">Distribution of calories burned across different activities</p>
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

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Sessions</p>
                    <p className="text-3xl font-bold mt-2">{sessions.length}</p>
                  </div>
                  <div className="text-4xl opacity-80">🎯</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Distance</p>
                    <p className="text-3xl font-bold mt-2">
                      {sessions.reduce((sum, s) => sum + parseFloat(s.distance_km || 0), 0).toFixed(1)}
                      <span className="text-lg ml-1">km</span>
                    </p>
                  </div>
                  <div className="text-4xl opacity-80">📍</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Total Calories</p>
                    <p className="text-3xl font-bold mt-2">
                      {sessions.reduce((sum, s) => sum + parseInt(s.calories_burned || 0), 0).toLocaleString()}
                      <span className="text-lg ml-1">kcal</span>
                    </p>
                  </div>
                  <div className="text-4xl opacity-80">🔥</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Duration</p>
                    <p className="text-3xl font-bold mt-2">
                      {Math.round(sessions.reduce((sum, s) => sum + parseInt(s.duration_minutes || 0), 0))}
                      <span className="text-lg ml-1">min</span>
                    </p>
                  </div>
                  <div className="text-4xl opacity-80">⏱️</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CardioAnalytics;
