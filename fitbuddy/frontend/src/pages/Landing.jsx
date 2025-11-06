/**
 * Landing.jsx
 * Landing page with hero section and call-to-action buttons
 */

import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 transform hover:scale-110 transition-transform duration-300 animate-float">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-slideUp">
              FitBuddy
            </h1>
            <p className="text-3xl md:text-4xl text-gray-300 font-light">
              All your fitness needs, <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-semibold">one platform</span>
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mt-6">
              Track workouts, join classes, monitor progress, and discover the best gyms near you. Your complete fitness journey starts here.
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link 
              to="/signup"
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto overflow-hidden"
            >
              <span className="relative z-10">Sign Up</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link 
              to="/login"
              className="px-10 py-5 bg-gray-800 text-white font-bold text-lg rounded-2xl border-2 border-gray-700 hover:border-blue-500 hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              Login
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-16">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">💪</div>
              <h3 className="text-white font-semibold mb-2">Track Workouts</h3>
              <p className="text-gray-400 text-sm">Log and monitor your training sessions</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">🏃</div>
              <h3 className="text-white font-semibold mb-2">Join Classes</h3>
              <p className="text-gray-400 text-sm">Access live and recorded fitness classes</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="text-white font-semibold mb-2">View Progress</h3>
              <p className="text-gray-400 text-sm">Visualize your fitness journey</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-yellow-500 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">🏋️</div>
              <h3 className="text-white font-semibold mb-2">Find Gyms</h3>
              <p className="text-gray-400 text-sm">Discover gyms in your area</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;
