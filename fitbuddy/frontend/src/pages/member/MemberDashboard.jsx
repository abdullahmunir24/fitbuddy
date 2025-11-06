/**
 * MemberDashboard.jsx
 * Main dashboard page showing overview stats and quick links
 */

import { Link } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card';
import { progressStats, recentActivity } from '../../data/mockData';

const MemberDashboard = () => {
  const { user } = useRole();
  
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
  const quickLinks = [
    { name: 'Workouts', path: '/member/workouts', color: 'from-blue-500 to-blue-600' },
    { name: 'Classes', path: '/member/classes', color: 'from-purple-500 to-purple-600' },
    { name: 'Progress', path: '/member/progress', color: 'from-green-500 to-green-600' },
  ];

  const getActivityIcon = (type) => {
    const iconMap = {
      workout: 'W',
      class: 'C',
      achievement: 'A',
      default: 'N'
    };
    return iconMap[type] || iconMap.default;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {userName.split(' ')[0]}!</h1>
          <p className="text-blue-100 text-lg">Ready to crush your fitness goals today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Workouts Logged"
            value={progressStats.workoutsCompleted}
            subtitle={`${progressStats.workoutsGoal - progressStats.workoutsCompleted} more to reach monthly goal`}
            className="hover:scale-105 transition-transform duration-300"
          />
          
          <Card
            title="Classes Joined"
            value={progressStats.classesAttended}
            subtitle={`${progressStats.classesGoal - progressStats.classesAttended} more this month`}
            className="hover:scale-105 transition-transform duration-300"
          />
          
          <Card
            title="Calories Burned"
            value={progressStats.caloriesBurned.toLocaleString()}
            subtitle="Keep up the great work!"
            className="hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="group"
              >
                <div className={`bg-gradient-to-br ${link.color} rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                  <h3 className="text-2xl font-bold mb-2">{link.name}</h3>
                  <p className="text-white/80 flex items-center">
                    Go to {link.name}
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-4"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Motivational Card */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
          <div>
            <h3 className="text-xl font-bold mb-1">You're on fire!</h3>
            <p className="text-white/90">You're 80% closer to your monthly goal. Keep pushing!</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
