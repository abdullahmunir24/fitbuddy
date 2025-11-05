/**
 * TrainerSchedule.jsx
 * Page for trainers to view and manage their teaching schedule
 */

import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const TrainerSchedule = () => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const [schedule] = useState({
    Monday: [
      { id: 1, time: '09:00 AM', class: 'Morning Yoga', duration: '60 min', participants: 12, room: 'Studio A' },
      { id: 2, time: '06:00 PM', class: 'Evening Spin', duration: '50 min', participants: 8, room: 'Cycle Room' },
    ],
    Tuesday: [
      { id: 3, time: '06:00 AM', class: 'HIIT Bootcamp', duration: '45 min', participants: 20, room: 'Main Gym' },
      { id: 4, time: '05:00 PM', class: 'Strength Training', duration: '60 min', participants: 15, room: 'Weight Room' },
    ],
    Wednesday: [
      { id: 5, time: '09:00 AM', class: 'Morning Yoga', duration: '60 min', participants: 12, room: 'Studio A' },
      { id: 6, time: '11:00 AM', class: 'Pilates Core', duration: '45 min', participants: 10, room: 'Studio B' },
      { id: 7, time: '06:00 PM', class: 'Evening Spin', duration: '50 min', participants: 8, room: 'Cycle Room' },
    ],
    Thursday: [
      { id: 8, time: '06:00 AM', class: 'HIIT Bootcamp', duration: '45 min', participants: 20, room: 'Main Gym' },
      { id: 9, time: '05:00 PM', class: 'Strength Training', duration: '60 min', participants: 15, room: 'Weight Room' },
    ],
    Friday: [
      { id: 10, time: '09:00 AM', class: 'Morning Yoga', duration: '60 min', participants: 12, room: 'Studio A' },
      { id: 11, time: '11:00 AM', class: 'Pilates Core', duration: '45 min', participants: 10, room: 'Studio B' },
      { id: 12, time: '06:00 PM', class: 'Evening Spin', duration: '50 min', participants: 8, room: 'Cycle Room' },
    ],
    Saturday: [
      { id: 13, time: '10:00 AM', class: 'Weekend Warrior', duration: '75 min', participants: 18, room: 'Main Gym' },
      { id: 14, time: '05:00 PM', class: 'Strength Training', duration: '60 min', participants: 15, room: 'Weight Room' },
    ],
    Sunday: [
      { id: 15, time: '10:00 AM', class: 'Relaxation Yoga', duration: '60 min', participants: 14, room: 'Studio A' },
    ],
  });

  const [selectedDay, setSelectedDay] = useState('Monday');

  const totalClasses = Object.values(schedule).flat().length;
  const totalHours = Object.values(schedule).flat().reduce((sum, session) => {
    const hours = parseInt(session.duration) / 60;
    return sum + hours;
  }, 0);

  const busiestDay = Object.entries(schedule).reduce((max, [day, sessions]) => 
    sessions.length > (schedule[max]?.length || 0) ? day : max
  , 'Monday');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600 mt-1">View and manage your weekly teaching schedule</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{totalClasses}</div>
            <div className="text-blue-100">Classes This Week</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{totalHours.toFixed(1)}h</div>
            <div className="text-purple-100">Teaching Hours</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{busiestDay}</div>
            <div className="text-green-100">Busiest Day</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">92%</div>
            <div className="text-orange-100">Avg Attendance</div>
          </div>
        </div>

        {/* Day Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedDay === day
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-xs md:text-sm">{day}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {schedule[day]?.length || 0} classes
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Calendar View */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">{selectedDay}'s Schedule</h2>
          </div>

          <div className="p-6">
            {schedule[selectedDay] && schedule[selectedDay].length > 0 ? (
              <div className="space-y-4">
                {schedule[selectedDay].map((session) => (
                  <div
                    key={session.id}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-300 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        {/* Time */}
                        <div className="flex flex-col items-center bg-blue-600 text-white rounded-xl px-4 py-3 min-w-[100px]">
                          <div className="text-2xl font-bold">{session.time.split(' ')[0]}</div>
                          <div className="text-xs">{session.time.split(' ')[1]}</div>
                        </div>

                        {/* Class Details */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{session.class}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{session.duration}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>{session.participants} participants</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span>{session.room}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors duration-200 border border-blue-600">
                          View Roster
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg transition-colors">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Classes Scheduled</h3>
                <p className="text-gray-600">You have a free day on {selectedDay}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tips Banner */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
          <div>
            <h3 className="text-xl font-bold mb-2">Schedule Management Tips</h3>
            <ul className="space-y-1 text-green-50">
              <li>• Arrive 15 minutes early to prepare the space</li>
              <li>• Check equipment before each class</li>
              <li>• Keep emergency contact information handy</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerSchedule;

