/**
 * MemberProgress.jsx
 * Page for visualizing fitness progress and achievements
 */

import DashboardLayout from '../../layouts/DashboardLayout';
import { progressStats } from '../../data/mockData';

const MemberProgress = () => {
  const progressData = [
    {
      label: 'Workouts Completed',
      current: progressStats.workoutsCompleted,
      goal: progressStats.workoutsGoal,
      color: 'from-blue-500 to-blue-600',
      icon: '💪',
    },
    {
      label: 'Classes Attended',
      current: progressStats.classesAttended,
      goal: progressStats.classesGoal,
      color: 'from-purple-500 to-purple-600',
      icon: '🏃',
    },
    {
      label: 'Calories Goal',
      current: progressStats.caloriesBurned,
      goal: progressStats.caloriesGoal,
      color: 'from-orange-500 to-red-600',
      icon: '🔥',
    },
  ];

  const achievements = [
    { id: 1, title: 'First Workout', description: 'Completed your first workout', icon: '🎯', unlocked: true },
    { id: 2, title: 'Week Warrior', description: '7 day workout streak', icon: '⚡', unlocked: true },
    { id: 3, title: 'Class Champion', description: 'Attended 5 classes', icon: '🏆', unlocked: true },
    { id: 4, title: 'Iron Will', description: 'Complete 50 workouts', icon: '💎', unlocked: false },
    { id: 5, title: 'Calorie Crusher', description: 'Burn 20,000 calories', icon: '🔥', unlocked: false },
    { id: 6, title: 'Perfect Month', description: '30 day workout streak', icon: '👑', unlocked: false },
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
          <div className="flex items-center space-x-4">
            <div className="text-6xl">🚀</div>
            <div>
              <h2 className="text-3xl font-bold mb-2">You're on track!</h2>
              <p className="text-green-50 text-lg">You're on pace to beat last week's stats by 15%. Keep pushing!</p>
            </div>
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
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{item.label}</h3>
                      <p className="text-sm text-gray-600">
                        {item.current} of {item.goal} {item.label === 'Calories Goal' ? 'calories' : ''}
                      </p>
                    </div>
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
              <div className="text-3xl mb-3">📅</div>
              <div className="text-3xl font-bold mb-1">5</div>
              <div className="text-blue-100 text-sm">Days Active</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-3xl mb-3">⏱️</div>
              <div className="text-3xl font-bold mb-1">4.5</div>
              <div className="text-green-100 text-sm">Hours Trained</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-3xl mb-3">🎯</div>
              <div className="text-3xl font-bold mb-1">8</div>
              <div className="text-purple-100 text-sm">Workouts Done</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-3xl mb-3">🔥</div>
              <div className="text-3xl font-bold mb-1">2,840</div>
              <div className="text-orange-100 text-sm">Calories Burned</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🏆</span>
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
                <div className="flex items-start space-x-4">
                  <div className={`text-4xl ${achievement.unlocked ? 'scale-110' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
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
                  </div>
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
