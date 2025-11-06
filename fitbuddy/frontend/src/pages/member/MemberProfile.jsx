/**
 * MemberProfile.jsx
 * User profile page with editable information
 */

import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import { useRole } from '../../context/RoleContext';

const MemberProfile = () => {
  const { user, setUser } = useRole();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Initialize formData from user context or localStorage
  const getUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    return user;
  };

  const currentUser = getUserData();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '+1 (250) 555-0123',
    location: currentUser?.location || 'Kelowna, BC',
    bio: currentUser?.bio || 'Fitness enthusiast and gym lover. Always looking to improve and stay healthy!',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedUser = { 
      ...currentUser, 
      name: formData.name, 
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      bio: formData.bio
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsModalOpen(false);
  };

  const stats = [
    { label: 'Total Workouts', value: '28', color: 'from-blue-500 to-blue-600' },
    { label: 'Classes Joined', value: '7', color: 'from-purple-500 to-purple-600' },
    { label: 'Member Since', value: 'Jan 2024', color: 'from-green-500 to-green-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>

          {/* Profile Content */}
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-xl">
                {formData.name.charAt(0)}
              </div>
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 border border-gray-200">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* User Info */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{formData.name}</h2>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{formData.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{formData.location}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Edit Profile
              </button>
            </div>

            {/* Bio */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">About</h3>
              <p className="text-gray-600">{formData.bio}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform duration-300`}
            >
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates about your workouts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Get reminders for your classes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Weekly Reports</p>
                <p className="text-sm text-gray-600">Get your weekly progress summary</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default MemberProfile;
