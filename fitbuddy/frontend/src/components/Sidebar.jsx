/**
 * Sidebar.jsx
 * Navigation sidebar for member dashboard
 */

import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/member/dashboard', icon: '📊' },
    { name: 'Workouts', path: '/member/workouts', icon: '💪' },
    { name: 'Classes', path: '/member/classes', icon: '🏃' },
    { name: 'Progress', path: '/member/progress', icon: '📈' },
    { name: 'Gyms', path: '/member/gyms', icon: '🏋️' },
    { name: 'Profile', path: '/member/profile', icon: '👤' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen border-r border-gray-800 shadow-2xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/member/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">FitBuddy</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300
              ${isActive(item.path)
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:scale-105'
              }
            `}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-semibold">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
          <p className="text-xs text-gray-400 mb-2">💡 Pro Tip</p>
          <p className="text-sm text-gray-300">Track your workouts daily for best results!</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
