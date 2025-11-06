/**
 * TrainerClients.jsx
 * Page for trainers to view and manage their clients
 */

import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const TrainerClients = () => {
  const [clients] = useState([
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      email: 'sarah.j@email.com',
      joinDate: 'Jan 15, 2024',
      sessionsCompleted: 24,
      lastSession: '2 days ago',
      status: 'active',
      goal: 'Weight Loss',
      progress: 75
    },
    { 
      id: 2, 
      name: 'Mike Chen', 
      email: 'mike.chen@email.com',
      joinDate: 'Feb 3, 2024',
      sessionsCompleted: 18,
      lastSession: '1 day ago',
      status: 'active',
      goal: 'Muscle Gain',
      progress: 60
    },
    { 
      id: 3, 
      name: 'Emma Davis', 
      email: 'emma.d@email.com',
      joinDate: 'Dec 20, 2023',
      sessionsCompleted: 45,
      lastSession: 'Today',
      status: 'active',
      goal: 'General Fitness',
      progress: 90
    },
    { 
      id: 4, 
      name: 'James Wilson', 
      email: 'j.wilson@email.com',
      joinDate: 'Mar 1, 2024',
      sessionsCompleted: 12,
      lastSession: '3 days ago',
      status: 'active',
      goal: 'Strength Training',
      progress: 45
    },
    { 
      id: 5, 
      name: 'Lisa Anderson', 
      email: 'lisa.a@email.com',
      joinDate: 'Jan 28, 2024',
      sessionsCompleted: 32,
      lastSession: '1 day ago',
      status: 'active',
      goal: 'Endurance',
      progress: 80
    },
  ]);

  const [filter, setFilter] = useState('all');

  const filteredClients = filter === 'all' 
    ? clients 
    : clients.filter(client => client.status === filter);

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalSessions = clients.reduce((sum, c) => sum + c.sessionsCompleted, 0);
  const avgProgress = Math.round(clients.reduce((sum, c) => sum + c.progress, 0) / clients.length);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Clients</h1>
          <p className="text-gray-600 mt-1">Track and manage your client progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{totalClients}</div>
            <div className="text-blue-100">Total Clients</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{activeClients}</div>
            <div className="text-green-100">Active Clients</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{totalSessions}</div>
            <div className="text-purple-100">Total Sessions</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{avgProgress}%</div>
            <div className="text-orange-100">Avg Progress</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Clients ({totalClients})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                filter === 'active'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Active ({activeClients})
            </button>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-white">
                    <h3 className="text-xl font-bold">{client.name}</h3>
                    <p className="text-blue-100 text-sm">{client.email}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                {/* Goal */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Goal</p>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                    {client.goal}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{client.sessionsCompleted}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Session</p>
                    <p className="text-sm font-semibold text-gray-900">{client.lastSession}</p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Progress</p>
                    <p className="text-sm font-bold text-gray-900">{client.progress}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${client.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Member since {client.joinDate}</p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors duration-200">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-200">
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div>
            <h3 className="text-xl font-bold mb-2">Client Management Tips</h3>
            <ul className="space-y-1 text-blue-50">
              <li>• Regular check-ins help maintain client motivation</li>
              <li>• Track progress weekly to adjust training plans</li>
              <li>• Celebrate milestones to keep clients engaged</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerClients;

