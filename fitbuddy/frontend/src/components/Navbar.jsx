/**
 * Navbar.jsx
 * Top navigation bar with user info and logout functionality
 */

import { useRole } from '../context/RoleContext';

const Navbar = () => {
  const { user, logout } = useRole();

  return (
    <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 sticky top-0 z-40 backdrop-blur-xl bg-white/95">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Page Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Let's crush your fitness goals today</p>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 relative">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                {user?.name?.charAt(0) || 'H'}
              </div>
              
              {/* Name & Role */}
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Haider Ali'}</p>
                <p className="text-xs text-gray-500">Member</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-all duration-300 hover:scale-105 border border-red-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
