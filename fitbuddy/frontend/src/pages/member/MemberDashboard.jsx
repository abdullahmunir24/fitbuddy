/**
 * MemberDashboard.jsx
 * Main dashboard page showing overview stats and quick links
 */

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useRole } from '../../context/RoleContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card';

const MemberDashboard = () => {
  const { user } = useRole();
  const [stats, setStats] = useState({
    workoutsCompleted: 0,
    classesAttended: 0,
    totalExercises: 0,
    weeklyWorkouts: 0,
    monthlyWorkouts: 0,
    loading: true,
  });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [allWorkouts, setAllWorkouts] = useState([]); // Store all workouts for filtering
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.
  
  // Get user name, with fallback to localStorage if context isn't ready
  const getUserName = () => {
    if (user?.name || user?.full_name) {
      return user.name || user.full_name;
    }
    
    // Fallback: try to get from localStorage directly
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed.name || parsed.full_name || 'there';
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
    return 'there';
  };
  
  const userName = getUserName();
  console.log('MemberDashboard - user:', user, 'userName:', userName);

  // Helper function to get date ISO string
  const getDateISOFromDaysAgo = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate weekly progress based on weekOffset
  const calculateWeeklyProgress = (workouts, offset) => {
    const weekData = [];
    // Calculate the start of the week based on offset
    const startDayOffset = (offset * 7) + 6; // 6 days ago for current week, 13 for last week, etc.
    
    for (let i = 6; i >= 0; i--) {
      const dayOffset = startDayOffset - (6 - i);
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = getDateISOFromDaysAgo(dayOffset);
      const count = workouts.filter(w => w.dateISO === dateStr).length;
      weekData.push({ day: dayName, date: dateStr, count });
    }
    return weekData;
  };

  // Get week date range for display
  const getWeekDateRange = (offset) => {
    const startDayOffset = (offset * 7) + 6;
    const endDayOffset = (offset * 7);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDayOffset);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - endDayOffset);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Update weekly progress when weekOffset changes
  useEffect(() => {
    if (allWorkouts.length > 0) {
      const weekData = calculateWeeklyProgress(allWorkouts, weekOffset);
      setWeeklyProgress(weekData);
    }
  }, [weekOffset, allWorkouts]);

  // Fetch real stats from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch workouts
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const workoutsResponse = await fetch(`${apiUrl}/api/workouts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (workoutsResponse.ok) {
          const workoutsData = await workoutsResponse.json();
          const workouts = workoutsData.data || [];
          setAllWorkouts(workouts); // Store all workouts for filtering
          setRecentWorkouts(workouts.slice(0, 5)); // Get 5 most recent
          
          // Calculate stats
          const totalWorkouts = workouts.length;
          const totalExercises = workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0);
          
          // Calculate weekly and monthly workouts using ISO date strings (YYYY-MM-DD)
          const now = new Date();
          
          // Get dates as ISO strings to avoid timezone issues
          const getTodayISO = () => {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };
          
          const weekAgoISO = getDateISOFromDaysAgo(7);
          const monthAgoISO = getDateISOFromDaysAgo(30);
          
          const weeklyWorkouts = workouts.filter(w => {
            return w.dateISO >= weekAgoISO;
          }).length;
          
          const monthlyWorkouts = workouts.filter(w => {
            return w.dateISO >= monthAgoISO;
          }).length;

          // Calculate initial weekly progress (current week)
          const weekData = calculateWeeklyProgress(workouts, 0);
          setWeeklyProgress(weekData);

          setStats({
            workoutsCompleted: totalWorkouts,
            totalExercises,
            weeklyWorkouts,
            monthlyWorkouts,
            classesAttended: 0, // Will be added when classes API is ready
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  const quickLinks = [
    { name: 'Workouts', path: '/member/workouts', color: 'from-blue-500 to-blue-600', icon: '💪', description: 'Log & track' },
    { name: 'Classes', path: '/member/classes', color: 'from-purple-500 to-purple-600', icon: '🧘', description: 'Book a class' },
    { name: 'Progress', path: '/member/progress', color: 'from-green-500 to-green-600', icon: '📈', description: 'View stats' },
    { name: 'Gyms', path: '/member/gyms', color: 'from-orange-500 to-orange-600', icon: '🏋️', description: 'Find gyms' },
  ];

  const quickActions = [
    { name: 'Log Workout', path: '/member/workouts', icon: '✏️', color: 'bg-blue-500' },
    { name: 'Book Class', path: '/member/classes', icon: '📅', color: 'bg-purple-500' },
    { name: 'View Progress', path: '/member/progress', icon: '📊', color: 'bg-green-500' },
    { name: 'Find Trainer', path: '/member/trainer', icon: '👤', color: 'bg-indigo-500' },
  ];

  const getWorkoutTypeIcon = (name) => {
    if (name?.toLowerCase().includes('leg')) return '🦵';
    if (name?.toLowerCase().includes('push') || name?.toLowerCase().includes('chest')) return '💪';
    if (name?.toLowerCase().includes('pull') || name?.toLowerCase().includes('back')) return '🏋️';
    if (name?.toLowerCase().includes('cardio')) return '🏃';
    if (name?.toLowerCase().includes('arm')) return '💪';
    if (name?.toLowerCase().includes('full')) return '🔥';
    return '🏃‍♂️';
  };

  const maxWeeklyCount = Math.max(...weeklyProgress.map(d => d.count), 1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Hey {userName.split(' ')[0]}! 👋</h1>
            <p className="text-blue-100 text-lg md:text-xl">Let's crush your fitness goals today</p>
            <div className="flex items-center space-x-6 mt-6">
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold">{stats.weeklyWorkouts}</span>
                <span className="text-blue-100 text-sm">workouts<br/>this week</span>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold">{stats.monthlyWorkouts}</span>
                <span className="text-blue-100 text-sm">workouts<br/>this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⚡</span> Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center">
                  <div className={`${action.color} w-14 h-14 rounded-xl flex items-center justify-center text-3xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <p className="text-gray-900 font-semibold text-sm">{action.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">Total Workouts</span>
              <span className="text-3xl">💪</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.loading ? '...' : stats.workoutsCompleted}</div>
            <div className="text-blue-100 text-xs">All time logged</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 text-sm font-medium">Exercises Done</span>
              <span className="text-3xl">🏋️</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.loading ? '...' : stats.totalExercises}</div>
            <div className="text-purple-100 text-xs">Total exercises</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm font-medium">Weekly Total</span>
              <span className="text-3xl">📅</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.loading ? '...' : stats.weeklyWorkouts}</div>
            <div className="text-green-100 text-xs">Last 7 days</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-100 text-sm font-medium">Classes Joined</span>
              <span className="text-3xl">🧘</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.loading ? '...' : stats.classesAttended}</div>
            <div className="text-orange-100 text-xs">Book your first!</div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        {weeklyProgress.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">📊</span> Weekly Activity
                </h2>
                <p className="text-sm text-gray-500 mt-1">{getWeekDateRange(weekOffset)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setWeekOffset(weekOffset - 1)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  title="Previous week"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setWeekOffset(0)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    weekOffset === 0 
                      ? 'bg-blue-500 text-white' 
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  disabled={weekOffset >= 0}
                  className={`p-2 rounded-lg border border-gray-200 transition-colors ${
                    weekOffset >= 0 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  title="Next week"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-end justify-between space-x-2 h-48">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '160px' }}>
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                      style={{ height: `${(day.count / maxWeeklyCount) * 100}%` }}
                    >
                      {day.count > 0 && (
                        <div className="absolute top-2 left-0 right-0 text-center text-white font-bold text-sm">
                          {day.count}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-600 mt-2">{day.day}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Workouts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-2">🏃</span> Recent Workouts
                  </span>
                  <Link to="/member/workouts" className="text-sm text-blue-600 hover:text-blue-700 font-normal">
                    View all →
                  </Link>
                </h2>
              </div>
              {stats.loading ? (
                <div className="p-8 text-center text-gray-500">Loading workouts...</div>
              ) : recentWorkouts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">🏋️‍♂️</div>
                  <p className="text-gray-500 mb-4 text-lg">No workouts yet</p>
                  <p className="text-gray-400 text-sm mb-6">Start your fitness journey by logging your first workout!</p>
                  <Link
                    to="/member/workouts"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    <span className="mr-2">✏️</span>
                    Log Your First Workout
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 flex items-center space-x-4 group"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
                        {getWorkoutTypeIcon(workout.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-semibold text-lg truncate">{workout.name}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-gray-500 flex items-center">
                            <span className="mr-1">📅</span> {workout.date}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <span className="mr-1">💪</span> {workout.exercises?.length || 0} exercises
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {workout.completed && (
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            ✓ Done
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Explore Section */}
          <div className="space-y-6">
            {/* Discover Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-bold mb-2">Discover More</h3>
              <p className="text-indigo-100 text-sm mb-4">Explore gyms, classes, and trainers in your area</p>
              <div className="space-y-2">
                <Link to="/member/gyms" className="block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all">
                  🏋️ Find Gyms Nearby
                </Link>
                <Link to="/member/classes" className="block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all">
                  🧘 Browse Classes
                </Link>
                <Link to="/member/trainer" className="block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all">
                  👤 Get a Trainer
                </Link>
              </div>
            </div>

            {/* Motivational Card */}
            {stats.workoutsCompleted > 0 ? (
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-4xl mb-3">
                  {stats.workoutsCompleted >= 20 ? '🔥' : stats.workoutsCompleted >= 10 ? '⭐' : '💪'}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {stats.workoutsCompleted >= 20 ? "Unstoppable!" : stats.workoutsCompleted >= 10 ? "On Fire!" : "Great Start!"}
                </h3>
                <p className="text-orange-100 text-sm">
                  {stats.workoutsCompleted >= 20 
                    ? `${stats.workoutsCompleted} workouts! You're a fitness champion! 🏆`
                    : stats.workoutsCompleted >= 10
                    ? `${stats.workoutsCompleted} workouts completed! Keep that momentum going!`
                    : `${stats.workoutsCompleted} workouts done! You're building amazing habits!`
                  }
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-xl font-bold mb-2">Start Today!</h3>
                <p className="text-emerald-100 text-sm">Your fitness journey begins with a single workout. Let's make it happen!</p>
              </div>
            )}

            {/* Profile Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">�</span> Your Profile
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Name</span>
                  <span className="text-gray-900 font-semibold text-sm">{userName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Role</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Member</span>
                </div>
                <Link to="/member/profile" className="block w-full text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-all">
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
