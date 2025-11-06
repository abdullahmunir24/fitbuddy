/**
 * mockData.js
 * Contains all mock data for member features
 */

export const workouts = [
  { id: 1, date: 'Nov 1', name: 'Bench Press', sets: 3, reps: 10, duration: '25 min', calories: 180 },
  { id: 2, date: 'Nov 2', name: 'Running', sets: '-', reps: '-', duration: '40 min', calories: 420 },
  { id: 3, date: 'Nov 3', name: 'Squats', sets: 4, reps: 12, duration: '30 min', calories: 240 },
  { id: 4, date: 'Nov 4', name: 'Swimming', sets: '-', reps: '-', duration: '45 min', calories: 380 },
];

export const classes = [
  { 
    id: 1, 
    name: 'Yoga Flow with Sarah', 
    instructor: 'Sarah Johnson',
    time: '10:00 AM', 
    duration: '60 min',
    difficulty: 'Beginner',
    joined: false 
  },
  { 
    id: 2, 
    name: 'HIIT Bootcamp with Alex', 
    instructor: 'Alex Chen',
    time: '5:00 PM', 
    duration: '45 min',
    difficulty: 'Advanced',
    joined: false 
  },
  { 
    id: 3, 
    name: 'Spin Class with Mike', 
    instructor: 'Mike Rodriguez',
    time: '7:00 AM', 
    duration: '50 min',
    difficulty: 'Intermediate',
    joined: false 
  },
  { 
    id: 4, 
    name: 'Pilates Core with Emma', 
    instructor: 'Emma Watson',
    time: '6:00 PM', 
    duration: '55 min',
    difficulty: 'Beginner',
    joined: false 
  },
];

export const gyms = [
  { 
    id: 1, 
    name: "Gold's Gym", 
    rating: 4.8, 
    price: '$45/mo', 
    facilities: 'Pool, Sauna, 24/7 Access',
    distance: '2.3 km',
    image: '🏋️'
  },
  { 
    id: 2, 
    name: 'UBCO Fitness Center', 
    rating: 4.9, 
    price: '$25/mo', 
    facilities: 'Students Only, Modern Equipment',
    distance: '0.5 km',
    image: '🎓'
  },
  { 
    id: 3, 
    name: 'CrossFit Revolution', 
    rating: 4.7, 
    price: '$65/mo', 
    facilities: 'Group Classes, Personal Training',
    distance: '3.1 km',
    image: '💪'
  },
  { 
    id: 4, 
    name: 'Yoga Studio Kelowna', 
    rating: 4.9, 
    price: '$35/mo', 
    facilities: 'Hot Yoga, Meditation Room',
    distance: '1.8 km',
    image: '🧘'
  },
];

export const progressStats = {
  workoutsCompleted: 28,
  workoutsGoal: 35,
  classesAttended: 7,
  classesGoal: 10,
  caloriesBurned: 12450,
  caloriesGoal: 14000,
};

export const recentActivity = [
  { id: 1, type: 'workout', description: 'Completed Swimming session', time: '2 hours ago' },
  { id: 2, type: 'class', description: 'Joined HIIT Bootcamp', time: '1 day ago' },
  { id: 3, type: 'achievement', description: 'Reached 25 workout milestone! 🎉', time: '2 days ago' },
  { id: 4, type: 'workout', description: 'Completed Bench Press', time: '3 days ago' },
];
