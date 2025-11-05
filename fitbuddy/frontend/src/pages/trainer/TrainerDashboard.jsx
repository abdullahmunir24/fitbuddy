/**
 * TrainerDashboard.jsx
 * Main dashboard for trainers showing overview stats and upcoming schedule
 */

import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card';

const TrainerDashboard = () => {
  const upcomingClasses = [
    { id: 1, name: 'Morning Yoga', time: 'Today, 9:00 AM', participants: 12, maxCapacity: 15 },
    { id: 2, name: 'HIIT Training', time: 'Today, 2:00 PM', participants: 20, maxCapacity: 20 },
    { id: 3, name: 'Spin Class', time: 'Tomorrow, 7:00 AM', participants: 8, maxCapacity: 15 },
    { id: 4, name: 'Strength Training', time: 'Tomorrow, 5:00 PM', participants: 15, maxCapacity: 20 },
  ];

  const recentActivity = [
    { id: 1, type: 'class', description: 'Completed HIIT Bootcamp class', time: '2 hours ago' },
    { id: 2, type: 'client', description: 'New client Sarah Johnson assigned', time: '5 hours ago' },
    { id: 3, type: 'review', description: 'Received 5-star review from Mike Chen', time: '1 day ago' },
    { id: 4, type: 'schedule', description: 'Updated schedule for next week', time: '2 days ago' },
  ];

  const stats = {
    activeClients: 42,
    classesThisWeek: 18,
    totalRating: 4.8,
    upcomingClasses: 6,
  };

  const quickLinks = [
    { name: 'My Classes', path: '/trainer/classes', color: 'from-blue-500 to-blue-600' },
    { name: 'Clients', path: '/trainer/clients', color: 'from-purple-500 to-purple-600' },
    { name: 'Schedule', path: '/trainer/schedule', color: 'from-green-500 to-green-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-4xl font-bold mb-2">Welcome back, Trainer!</h1>
          <p className="text-blue-100 text-lg">You have {stats.upcomingClasses} classes scheduled for today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card
            title="Active Clients"
            value={stats.activeClients}
            subtitle="Currently training"
            className="hover:scale-105 transition-transform duration-300"
          />
          
          <Card
            title="Classes This Week"
            value={stats.classesThisWeek}
            subtitle="Total sessions"
            className="hover:scale-105 transition-transform duration-300"
          />
          
          <Card
            title="Average Rating"
            value={stats.totalRating}
            subtitle="Out of 5.0"
            className="hover:scale-105 transition-transform duration-300"
          />

          <Card
            title="Upcoming Classes"
            value={stats.upcomingClasses}
            subtitle="Next 7 days"
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

        {/* Upcoming Classes */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Classes</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {upcomingClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{classItem.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{classItem.time}</p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{classItem.participants}/{classItem.maxCapacity}</p>
                      <p className="text-xs text-gray-500">Participants</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${
                      classItem.participants === classItem.maxCapacity 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {classItem.participants === classItem.maxCapacity ? 'Full' : 'Available'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
          <div>
            <h3 className="text-xl font-bold mb-1">Great work this week!</h3>
            <p className="text-green-50">You've completed 18 classes with an average attendance rate of 92%</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerDashboard;

