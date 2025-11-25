import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';

const TrainerClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  
  const [formData, setFormData] = useState({
    class_name: '',
    class_type: '',
    difficulty_level: 'beginner',
    max_capacity: '',
    duration_minutes: '',
    description: '',
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    scheduled_date: '',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/classes/trainer`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          max_capacity: parseInt(formData.max_capacity),
          duration_minutes: parseInt(formData.duration_minutes),
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchClasses();
        setIsModalOpen(false);
        setFormData({
          class_name: '',
          class_type: '',
          difficulty_level: 'beginner',
          max_capacity: '',
          duration_minutes: '',
          description: '',
        });
        alert('Class created successfully!');
      } else {
        alert(data.message || 'Failed to create class');
      }
    } catch (error) {
      alert('Failed to create class');
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!confirm('Delete this class?')) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/classes/${classId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();
      if (data.success) {
        await fetchClasses();
        alert('Class deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete class: ' + error.message);
    }
  };

  const handleViewSchedules = async (classItem) => {
    setSelectedClass(classItem);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/classes/${classItem.id}/schedules`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();
      if (data.success) {
        setSchedules(data.data);
        setIsScheduleModalOpen(true);
      }
    } catch (error) {
      alert('Failed to load schedules');
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/classes/${selectedClass.id}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(scheduleFormData),
      });

      const data = await response.json();
      if (data.success) {
        handleViewSchedules(selectedClass);
        setScheduleFormData({ scheduled_date: '', start_time: '', end_time: '' });
        alert('Schedule created!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to create schedule');
    }
  };

  const handleViewBookings = async (scheduleId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/classes/schedules/${scheduleId}/bookings`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();
      if (data.success) {
        setBookings(data.data);
        setSelectedScheduleId(scheduleId);
      }
    } catch (error) {
      alert('Failed to load bookings');
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-600 mt-1">Manage your fitness classes</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
          >
            + Create Class
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No classes yet</h3>
            <p className="text-gray-600 mt-2">Create your first class to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold mb-2">{cls.class_name}</h3>
                <p className="text-sm text-gray-600 mb-1">Type: {cls.class_type}</p>
                <p className="text-sm text-gray-600 mb-1">Level: {cls.difficulty_level}</p>
                <p className="text-sm text-gray-600 mb-1">Duration: {cls.duration_minutes} min</p>
                <p className="text-sm text-gray-600 mb-4">Capacity: {cls.max_capacity}</p>
                <p className="text-sm text-gray-600 mb-4">Schedules: {cls.schedule_count || 0}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewSchedules(cls)}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Schedules
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Class Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Class">
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <input
                type="text"
                required
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Type</label>
              <input
                type="text"
                required
                value={formData.class_type}
                onChange={(e) => setFormData({ ...formData, class_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Yoga, HIIT, Pilates"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
              <input
                type="number"
                required
                min="1"
                value={formData.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                required
                min="15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="3"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
              Create Class
            </button>
          </form>
        </Modal>

        {/* Schedule Modal */}
        <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title={`Schedules - ${selectedClass?.class_name}`}>
          <div className="space-y-4">
            <form onSubmit={handleCreateSchedule} className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-gray-900">Add New Schedule</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={scheduleFormData.scheduled_date}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, scheduled_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={scheduleFormData.start_time}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, start_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={scheduleFormData.end_time}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, end_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Schedule
              </button>
            </form>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Existing Schedules</h3>
              {schedules.length === 0 ? (
                <p className="text-sm text-gray-600">No schedules yet</p>
              ) : (
                schedules.map((schedule) => (
                  <div key={schedule.id} className="bg-white border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formatDate(schedule.scheduled_date)}</p>
                        <p className="text-sm text-gray-600">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {schedule.confirmed_bookings || 0} / {schedule.max_capacity} booked
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewBookings(schedule.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                      >
                        View Bookings
                      </button>
                    </div>
                    
                    {selectedScheduleId === schedule.id && bookings.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Booked Members:</p>
                        <div className="space-y-1">
                          {bookings.map((booking) => (
                            <div key={booking.booking_id} className="text-sm text-gray-600">
                              • {booking.full_name} ({booking.email})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default TrainerClasses;
