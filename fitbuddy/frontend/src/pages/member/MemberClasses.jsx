import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const MemberClasses = () => {
  const [availableClasses, setAvailableClasses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      const [classesRes, bookingsRes] = await Promise.all([
        fetch(`${apiUrl}/api/classes`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/classes/my-bookings`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      const classesData = await classesRes.json();
      const bookingsData = await bookingsRes.json();

      if (classesData.success) setAvailableClasses(classesData.data);
      if (bookingsData.success) setMyBookings(bookingsData.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async (scheduleId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/classes/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ schedule_id: scheduleId }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchData();
        alert('Class booked!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to book class');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/classes/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();
      if (data.success) {
        await fetchData();
        alert('Booking cancelled');
      }
    } catch (error) {
      alert('Failed to cancel');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Fitness Classes</h1>

        <div className="bg-white rounded-xl p-1 inline-flex">
          <button onClick={() => setActiveTab('available')} className={`px-6 py-2 rounded-lg ${activeTab === 'available' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
            Available
          </button>
          <button onClick={() => setActiveTab('my-classes')} className={`px-6 py-2 rounded-lg ${activeTab === 'my-classes' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
            My Classes ({myBookings.length})
          </button>
        </div>

        {activeTab === 'available' ? (
          loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableClasses.map((cls) => (
                <div key={cls.schedule_id} className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-bold mb-1">{cls.class_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">with {cls.trainer_name}</p>
                  <p className="text-sm text-gray-600">{formatDate(cls.scheduled_date)}</p>
                  <p className="text-sm text-gray-600 mb-4">{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</p>
                  <p className="text-sm text-gray-600 mb-4">{cls.spots_available} / {cls.max_capacity} spots</p>
                  <button
                    onClick={() => handleBookClass(cls.schedule_id)}
                    disabled={cls.spots_available === 0}
                    className={`w-full py-3 rounded-xl font-semibold ${cls.spots_available === 0 ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white'}`}
                  >
                    {cls.spots_available === 0 ? 'Full' : 'Book Class'}
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myBookings.map((booking) => (
              <div key={booking.booking_id} className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-1">{booking.class_name}</h3>
                <p className="text-sm mb-2">with {booking.trainer_name}</p>
                <p className="text-sm">{formatDate(booking.scheduled_date)}</p>
                <p className="text-sm mb-4">{formatTime(booking.start_time)}</p>
                {booking.booking_status === 'confirmed' && (
                  <button onClick={() => handleCancelBooking(booking.booking_id)} className="w-full py-2 bg-white/20 rounded-xl">
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemberClasses;
