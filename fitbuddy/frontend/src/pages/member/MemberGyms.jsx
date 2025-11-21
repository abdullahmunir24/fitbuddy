/**
 * MemberGyms.jsx
 * Page for browsing and discovering local gyms with geolocation
 */

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const MemberGyms = () => {
  const [allGyms, setAllGyms] = useState([]); // Store all gyms from API
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'

  // Filter gyms based on search query in real-time
  const gyms = useMemo(() => {
    if (!searchQuery.trim()) {
      return allGyms; // Return all gyms if search is empty
    }

    const query = searchQuery.toLowerCase().trim();
    return allGyms.filter(gym => {
      const nameMatch = gym.name.toLowerCase().includes(query);
      const cityMatch = gym.city?.toLowerCase().includes(query);
      const addressMatch = gym.address?.toLowerCase().includes(query);
      const descriptionMatch = gym.description?.toLowerCase().includes(query);
      
      return nameMatch || cityMatch || addressMatch || descriptionMatch;
    });
  }, [allGyms, searchQuery]);

  // Request location permission and fetch gyms
  useEffect(() => {
    requestLocationAndFetchGyms();
  }, []);

  const requestLocationAndFetchGyms = () => {
    setLocationLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationPermission('denied');
      fetchGymsWithoutLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setLocationPermission('granted');
        fetchGyms(location.lat, location.lng);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        
        if (error.code === error.PERMISSION_DENIED) {
          setError('Location access denied. Showing all gyms without distance.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setError('Location information unavailable. Showing all gyms.');
        } else {
          setError('Unable to get your location. Showing all gyms.');
        }
        
        fetchGymsWithoutLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const fetchGyms = async (lat, lng) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const url = lat && lng 
        ? `${apiUrl}/api/gyms?lat=${lat}&lng=${lng}&radius=50`
        : `${apiUrl}/api/gyms`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setAllGyms(data.data);
        setError(null);
      } else {
        setError('Failed to load gyms');
      }
    } catch (error) {
      console.error('Error fetching gyms:', error);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
      setLocationLoading(false);
    }
  };

  const fetchGymsWithoutLocation = () => {
    fetchGyms(null, null);
  };

  const handleViewDetails = (gym) => {
    // Open Google Maps with gym location
    const query = encodeURIComponent(`${gym.name} ${gym.address}, ${gym.city}`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleGetDirections = (gym) => {
    // Open Google Maps directions
    if (userLocation) {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${gym.latitude},${gym.longitude}`;
      window.open(directionsUrl, '_blank');
    } else {
      const query = encodeURIComponent(`${gym.name} ${gym.address}, ${gym.city}`);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const getRatingStars = (rating = 4.5) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discover Gyms</h1>
          <p className="text-gray-600 mt-1">
            {locationPermission === 'granted' 
              ? 'Showing gyms near your location' 
              : 'Find the perfect gym near you'}
          </p>
        </div>

        {/* Location Status Banner */}
        {locationLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800 font-medium">Getting your location...</p>
          </div>
        )}

        {locationPermission === 'denied' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-yellow-800 font-medium">Location access not available</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Enable location services to see distances and get directions. Showing all gyms for now.
                </p>
                <button
                  onClick={requestLocationAndFetchGyms}
                  className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {locationPermission === 'granted' && userLocation && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-green-800 font-medium">
              Location found! Showing gyms sorted by distance.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && !locationLoading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gyms by name or location... (filters as you type)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              Showing {gyms.length} of {allGyms.length} gyms
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && !locationLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Gym Cards Grid */}
        {!loading && gyms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map((gym) => (
              <div
                key={gym.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Gym Header with Icon */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                {/* Gym Info */}
                <div className="p-6 space-y-4">
                  {/* Name and Rating */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-gray-900">{gym.name}</h3>
                    <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-lg">
                      {getRatingStars()}
                    </div>
                  </div>

                  {/* Description */}
                  {gym.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{gym.description}</p>
                  )}

                  {/* Distance */}
                  {gym.distance !== undefined && (
                    <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-bold">{gym.distance} km away</span>
                    </div>
                  )}

                  {/* Address */}
                  <div className="flex items-start space-x-2 text-gray-600">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{gym.address}, {gym.city}, {gym.province}</span>
                  </div>

                  {/* Phone */}
                  {gym.phone && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm">{gym.phone}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => handleViewDetails(gym)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleGetDirections(gym)}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                      title="Get Directions"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && gyms.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No Gyms Match Your Search' : 'No Gyms Found'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No gyms found matching "${searchQuery}". Try a different search term.`
                : 'Try adjusting your search or check back later.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
            <div>
              <h3 className="text-xl font-bold mb-2">Gym Tips</h3>
              <ul className="space-y-1 text-green-50 text-sm">
                <li>• Visit during off-peak hours for less crowds</li>
                <li>• Ask about trial memberships</li>
                <li>• Check for student or corporate discounts</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div>
              <h3 className="text-xl font-bold mb-2">What to Look For</h3>
              <ul className="space-y-1 text-blue-50 text-sm">
                <li>• Clean and well-maintained equipment</li>
                <li>• Qualified and friendly staff</li>
                <li>• Convenient location and hours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberGyms;
