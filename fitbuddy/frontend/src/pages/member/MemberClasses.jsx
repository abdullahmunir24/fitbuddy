/**
 * MemberClasses.jsx
 * Page for browsing and joining fitness classes
 */

import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { classes as initialClasses } from '../../data/mockData';

const MemberClasses = () => {
  const [classes, setClasses] = useState(initialClasses);

  const toggleJoinClass = (classId) => {
    setClasses(classes.map(cls => 
      cls.id === classId ? { ...cls, joined: !cls.joined } : cls
    ));
  };

  const availableClasses = classes.filter(cls => !cls.joined);
  const myClasses = classes.filter(cls => cls.joined);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fitness Classes</h1>
          <p className="text-gray-600 mt-1">Join live classes with expert instructors</p>
        </div>

        {/* My Classes Section */}
        {myClasses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              My Classes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{cls.name}</h3>
                      <p className="text-blue-100 text-sm">with {cls.instructor}</p>
                    </div>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-semibold">
                      Joined
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-blue-100">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">{cls.time} • {cls.duration}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleJoinClass(cls.id)}
                    className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl font-semibold transition-all duration-200"
                  >
                    Leave Class
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Classes Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Available Classes
          </h2>
          
          {availableClasses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">You've joined all available classes. Check back later for new sessions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">{cls.name}</h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getDifficultyColor(cls.difficulty)}`}>
                        {cls.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">with {cls.instructor}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{cls.time}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-sm font-medium">{cls.duration}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleJoinClass(cls.id)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Join Class
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
          <div>
            <h3 className="text-xl font-bold mb-2">Class Tips</h3>
            <ul className="space-y-1 text-green-50">
              <li>• Join classes 5 minutes early to warm up</li>
              <li>• Keep your water bottle handy</li>
              <li>• Listen to your body and take breaks when needed</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberClasses;
