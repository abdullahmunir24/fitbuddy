/**
 * MemberProfile.jsx
 * Modern fitness app profile page
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import { useRole } from '../../context/RoleContext';

const MemberProfile = () => {
  const { user, setUser } = useRole();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualBMI, setManualBMI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    activeDays: 0,
    caloriesBurned: 0,
  });
  
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
    bmi: currentUser?.bmi || '',
    location: currentUser?.location || 'Kelowna, BC',
    bio: currentUser?.bio || 'Fitness enthusiast and gym lover. Always looking to improve and stay healthy!',
    height: currentUser?.height || '175',
    weight: currentUser?.weight || '70',
    goal: currentUser?.goal || 'Build muscle and stay fit',
  });

  // Fetch real workout stats from API
  useEffect(() => {
    const fetchWorkoutStats = async () => {
      try {
        setStatsLoading(true);
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/cardio?limit=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const sessions = data.data || [];
          
          // Calculate stats from sessions
          const totalWorkouts = sessions.length;
          const uniqueDays = new Set(sessions.map(s => s.session_date?.split('T')[0])).size;
          const totalCalories = sessions.reduce((sum, s) => sum + (parseInt(s.calories_burned) || 0), 0);
          
          setWorkoutStats({
            totalWorkouts,
            activeDays: uniqueDays,
            caloriesBurned: totalCalories,
          });
        }
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = currentUser?.id;
        
        if (!userId) return;
        
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/users/${userId}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          const profile = result.data;
          
          if (profile) {
            // Update form data with real database values
            setFormData(prev => ({
              ...prev,
              height: profile.height_cm?.toString() || prev.height,
              weight: profile.weight_kg?.toString() || prev.weight,
              goal: profile.fitness_goal || prev.goal,
            }));
            
            // Calculate BMI if we have height and weight
            if (profile.height_cm && profile.weight_kg) {
              const bmi = (profile.weight_kg / ((profile.height_cm / 100) ** 2)).toFixed(1);
              setFormData(prev => ({
                ...prev,
                bmi: bmi,
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutStats();
    fetchUserProfile();
  }, [currentUser?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // If the user edits height/weight and they haven't enabled manual BMI, auto-calc BMI
    if ((name === 'height' || name === 'weight') && !manualBMI) {
      const newHeight = name === 'height' ? value : formData.height;
      const newWeight = name === 'weight' ? value : formData.weight;
      let newBmi = '';
      const h = parseFloat(newHeight);
      const w = parseFloat(newWeight);
      if (h > 0 && w > 0) {
        newBmi = (w / ((h / 100) ** 2)).toFixed(1);
      }
      setFormData({
        ...formData,
        [name]: value,
        bmi: newBmi,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const userId = currentUser?.id;
      
      // Update user profile via API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          bio: formData.bio,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update user_profiles with height, weight
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const profileResponse = await fetch(`${apiUrl}/api/users/${userId}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            height_cm: parseFloat(formData.height),
            weight_kg: parseFloat(formData.weight),
            fitness_goal: formData.goal,
          }),
        });

        if (profileResponse.ok) {
          const updatedUser = { 
            ...currentUser, 
            ...formData,
            height: formData.height,
            weight: formData.weight,
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setIsModalOpen(false);
          alert('Profile updated successfully!');
        } else {
          console.error('Failed to update profile');
          alert('Failed to update some profile fields. Please try again.');
        }
      } else {
        console.error('Failed to update user');
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile.');
    }
  };

  // Compute real stats
  const computeFitnessStats = () => {
    const memberSince = currentUser?.created_at 
      ? new Date(currentUser.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) 
      : '—';

    return [
      { 
        label: 'Total Workouts', 
        value: statsLoading ? '...' : workoutStats.totalWorkouts.toString(), 
        icon: '🏋️', 
        color: 'from-orange-400 to-red-500', 
        bgColor: 'bg-orange-50' 
      },
      { 
        label: 'Active Days', 
        value: statsLoading ? '...' : workoutStats.activeDays.toString(), 
        icon: '🔥', 
        color: 'from-red-400 to-pink-500', 
        bgColor: 'bg-red-50' 
      },
      { 
        label: 'Calories Burned', 
        value: statsLoading ? '...' : (workoutStats.caloriesBurned >= 1000 
          ? `${(workoutStats.caloriesBurned/1000).toFixed(1)}k` 
          : `${workoutStats.caloriesBurned}`), 
        icon: '⚡', 
        color: 'from-yellow-400 to-orange-500', 
        bgColor: 'bg-yellow-50' 
      },
      { 
        label: 'Member Since', 
        value: memberSince, 
        icon: '🎯', 
        color: 'from-blue-400 to-indigo-500', 
        bgColor: 'bg-blue-50' 
      },
    ];
  };

  const fitnessStats = computeFitnessStats();

  const computeBMI = (w, h) => {
    const weight = parseFloat(w);
    const height = parseFloat(h);
    if (!weight || !height) return '—';
    return (weight / ((height / 100) ** 2)).toFixed(1);
  };

  const bodyStats = [
    { label: 'Height', value: `${formData.height} cm`, icon: '📏' },
    { label: 'Weight', value: `${formData.weight} kg`, icon: '⚖️' },
    { label: 'BMI', value: formData.bmi && formData.bmi !== '' ? formData.bmi : computeBMI(formData.weight, formData.height), icon: '📊' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Track your fitness journey</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        </div>

        {/* Main Profile Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 shadow-xl text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-5xl font-bold border-4 border-white/30 shadow-2xl">
                {formData.name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">{formData.name}</h2>
              <p className="text-white/90 text-lg mb-4">{formData.goal}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2 text-white/90">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{formData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 md:col-span-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{formData.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body Stats */}
        <div className="grid grid-cols-3 gap-4">
          {bodyStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Fitness Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {fitnessStats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-2xl p-5 hover:scale-105 transition-transform duration-300 border border-gray-100`}
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-700">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>💭</span>
            About Me
          </h3>
          <p className="text-gray-600 leading-relaxed">{formData.bio}</p>
        </div>

        {/* Preferences removed to simplify profile per request */}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Phone removed from profile to protect privacy */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">BMI</label>
                <input
                  type="text"
                  name="bmi"
                  value={formData.bmi}
                  onChange={handleInputChange}
                  disabled={!manualBMI}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none ${manualBMI ? 'focus:ring-2 focus:ring-indigo-500' : 'bg-gray-50'}`}
                />
                <p className="text-xs text-gray-500 mt-1">BMI is auto-calculated from height & weight. Enable manual edit to override.</p>
              </div>

              <div className="w-48 flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Manual BMI</label>
                <input type="checkbox" checked={manualBMI} onChange={(e) => setManualBMI(e.target.checked)} className="h-4 w-4" />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fitness Goal</label>
              <input
                type="text"
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                placeholder="e.g., Build muscle, lose weight, stay fit"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
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