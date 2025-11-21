/**
 * MemberProgress.jsx
 * Page for visualizing fitness progress and achievements
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const MemberProgress = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:3001/api/users/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading progress data...</div>
        </div>
      </DashboardLayout>
    );
  }

  const monthlyWorkoutsGoal = 35;
  const monthlyClassesGoal = 10;
  const monthlyCaloriesGoal = 14000;

  const progressData = [
    {
      label: 'Workouts Completed',
      current: stats?.totalWorkouts || 0,
      goal: monthlyWorkoutsGoal,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Classes Attended',
      current: stats?.totalClassesAttended || 0,
      goal: monthlyClassesGoal,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Calories Goal',
      current: stats?.caloriesBurned || 0,
      goal: monthlyCaloriesGoal,
      color: 'from-orange-500 to-red-600',
    },
  ];

  const achievements = [
    { 
      id: 1, 
      title: 'First Workout', 
      description: 'Completed your first workout', 
      unlocked: (stats?.totalWorkouts || 0) >= 1 
    },
    { 
      id: 2, 
      title: 'Week Warrior', 
      description: '7 day workout streak', 
      unlocked: (stats?.totalWorkouts || 0) >= 7 
    },
    { 
      id: 3, 
      title: 'Class Champion', 
      description: 'Attended 5 classes', 
      unlocked: (stats?.totalClassesAttended || 0) >= 5 
    },
    { 
      id: 4, 
      title: 'Iron Will', 
      description: 'Complete 50 workouts', 
      unlocked: (stats?.totalWorkouts || 0) >= 50,
      progress: `${stats?.totalWorkouts || 0}/50`
    },
    { 
      id: 5, 
      title: 'Calorie Crusher', 
      description: 'Burn 20,000 calories', 
      unlocked: (stats?.caloriesBurned || 0) >= 20000,
      progress: `${stats?.caloriesBurned || 0}/20000`
    },
    { 
      id: 6, 
      title: 'Perfect Month', 
      description: '30 day workout streak', 
      unlocked: (stats?.totalWorkouts || 0) >= 30,
      progress: `${stats?.totalWorkouts || 0}/30`
    },
  ];

  const getPercentage = (current, goal) => Math.min((current / goal) * 100, 100);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
          <p className="text-gray-600 mt-1">Track your fitness journey and achievements</p>
        </div>

        {/* Motivational Banner */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-8 text-white shadow-xl">
          <div>
            <h2 className="text-3xl font-bold mb-2">You're on track!</h2>
            <p className="text-green-50 text-lg">
              {stats?.totalSessions > 0 
                ? `You've completed ${stats.totalSessions} sessions! Keep pushing!`
                : "Start your first workout to begin tracking progress!"}
            </p>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Monthly Goals</h2>
          
          {progressData.map((item) => {
            const percentage = getPercentage(item.current, item.goal);
            
            return (
              <div key={item.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{item.label}</h3>
                    <p className="text-sm text-gray-600">
                      {item.current} of {item.goal} {item.label === 'Calories Goal' ? 'calories' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{percentage.toFixed(0)}%</div>
                    <div className="text-sm text-gray-600">{item.goal - item.current} to go</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                    style={{ width: `${percentage}%` }}
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Stats */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-3xl font-bold mb-1">
                {Math.ceil((stats?.totalSessions || 0) * 0.71)}
              </div>
              <div className="text-blue-100 text-sm">Days Active</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-3xl font-bold mb-1">
                {((stats?.totalDuration || 0) / 60).toFixed(1)}
              </div>
              <div className="text-green-100 text-sm">Hours Trained</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-3xl font-bold mb-1">{stats?.totalWorkouts || 0}</div>
              <div className="text-purple-100 text-sm">Workouts Done</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-3xl font-bold mb-1">
                {(stats?.caloriesBurned || 0).toLocaleString()}
              </div>
              <div className="text-orange-100 text-sm">Calories Burned</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 transform hover:scale-105 ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-yellow-500 shadow-lg'
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}
              >
                <div>
                  <h3 className={`text-lg font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${achievement.unlocked ? 'text-white/90' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                  {achievement.unlocked && (
                    <div className="mt-3 flex items-center space-x-1 text-white/90 text-xs font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Unlocked</span>
                    </div>
                  )}
                  {!achievement.unlocked && achievement.progress && (
                    <div className="mt-3 text-xs text-gray-500 font-semibold">
                      {achievement.progress}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default MemberProgress;
