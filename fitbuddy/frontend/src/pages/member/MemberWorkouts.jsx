/**
 * MemberWorkouts.jsx
 * Page for managing workout sessions with exercises
 */

import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';

const MemberWorkouts = () => {
  const [workouts, setWorkouts] = useState([
    {
      id: 1,
      name: "Chest & Triceps",
      date: "Nov 1 2025",
      completed: true,
      exercises: [
        { id: 1, name: "Bench Press", sets: 3, reps: 10, weight: "135 lbs" },
        { id: 2, name: "Incline Dumbbell Press", sets: 3, reps: 12, weight: "60 lbs" },
        { id: 3, name: "Tricep Dips", sets: 3, reps: 15, weight: "Body Weight" }
      ]
    },
    {
      id: 2,
      name: "Back & Biceps",
      date: "Nov 3 2025",
      completed: true,
      exercises: [
        { id: 1, name: "Pull-ups", sets: 4, reps: 8, weight: "Body Weight" },
        { id: 2, name: "Barbell Row", sets: 3, reps: 10, weight: "115 lbs" }
      ]
    }
  ]);

  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState(new Set([1, 2]));

  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    sets: '',
    reps: '',
    weight: '',
  });

  const handleStartWorkout = (e) => {
    e.preventDefault();
    const newWorkout = {
      id: Date.now(),
      name: workoutForm.name,
      date: new Date(workoutForm.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      completed: false,
      exercises: []
    };
    setWorkouts([newWorkout, ...workouts]);
    setExpandedWorkouts(new Set([newWorkout.id, ...expandedWorkouts]));
    setIsWorkoutModalOpen(false);
    setWorkoutForm({ name: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleAddExercise = (e) => {
    e.preventDefault();
    const newExercise = {
      id: Date.now(),
      name: exerciseForm.name,
      sets: parseInt(exerciseForm.sets) || 0,
      reps: parseInt(exerciseForm.reps) || 0,
      weight: exerciseForm.weight || 'Body Weight'
    };
    setWorkouts(workouts.map(workout => 
      workout.id === selectedWorkoutId
        ? { ...workout, exercises: [...workout.exercises, newExercise] }
        : workout
    ));
    setIsExerciseModalOpen(false);
    setExerciseForm({ name: '', sets: '', reps: '', weight: '' });
  };

  const toggleWorkout = (workoutId) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(workoutId)) {
      newExpanded.delete(workoutId);
    } else {
      newExpanded.add(workoutId);
    }
    setExpandedWorkouts(newExpanded);
  };

  const openExerciseModal = (workoutId) => {
    setSelectedWorkoutId(workoutId);
    setIsExerciseModalOpen(true);
  };

  const endWorkout = (workoutId) => {
    setWorkouts(workouts.map(workout =>
      workout.id === workoutId ? { ...workout, completed: true } : workout
    ));
  };

  const totalWorkouts = workouts.length;
  const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0);
  const activeWorkouts = workouts.filter(w => !w.completed).length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Workouts</h1>
            <p className="text-gray-600 mt-2">Track your training sessions and exercises</p>
          </div>
          <button
            onClick={() => setIsWorkoutModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold">Start New Workout</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-md rounded-xl p-5 transition hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Workouts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalWorkouts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-xl p-5 transition hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Exercises</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalExercises}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-xl p-5 transition hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeWorkouts}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              isExpanded={expandedWorkouts.has(workout.id)}
              onToggle={() => toggleWorkout(workout.id)}
              onAddExercise={() => openExerciseModal(workout.id)}
              onEndWorkout={() => endWorkout(workout.id)}
            />
          ))}
        </div>
      </div>

      <Modal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} title="Start New Workout">
        <form onSubmit={handleStartWorkout} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Workout Name</label>
            <input
              type="text"
              value={workoutForm.name}
              onChange={(e) => setWorkoutForm({ ...workoutForm, name: e.target.value })}
              required
              placeholder="e.g., Chest Day, Leg Day"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Date</label>
            <input
              type="date"
              value={workoutForm.date}
              onChange={(e) => setWorkoutForm({ ...workoutForm, date: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="submit" className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold">Start</button>
            <button type="button" onClick={() => setIsWorkoutModalOpen(false)} className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-200 transition font-semibold">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isExerciseModalOpen} onClose={() => setIsExerciseModalOpen(false)} title="Add Exercise">
        <form onSubmit={handleAddExercise} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Exercise Name</label>
            <input
              type="text"
              value={exerciseForm.name}
              onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
              required
              placeholder="e.g., Bench Press"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Sets</label>
              <input
                type="number"
                value={exerciseForm.sets}
                onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value })}
                required
                placeholder="3"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Reps</label>
              <input
                type="number"
                value={exerciseForm.reps}
                onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })}
                required
                placeholder="10"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Weight (optional)</label>
            <input
              type="text"
              value={exerciseForm.weight}
              onChange={(e) => setExerciseForm({ ...exerciseForm, weight: e.target.value })}
              placeholder="e.g., 135 lbs, 60 kg, or leave empty"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="submit" className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold">Add Exercise</button>
            <button type="button" onClick={() => setIsExerciseModalOpen(false)} className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-200 transition font-semibold">Cancel</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

const WorkoutCard = ({ workout, isExpanded, onToggle, onAddExercise, onEndWorkout }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-5 transition hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button onClick={onToggle} className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center justify-center">
            <svg className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{workout.name}</h3>
            <p className="text-sm text-gray-600">{workout.date}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {workout.completed ? (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">✓ Completed</span>
          ) : (
            <>
              <button onClick={onAddExercise} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-semibold">Add Exercise</button>
              <button onClick={onEndWorkout} className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-semibold">End Workout</button>
            </>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 space-y-3 pl-14">
          {workout.exercises.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No exercises added yet</p>
          ) : (
            workout.exercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">{exercise.name}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="bg-white px-3 py-1 rounded-lg border border-gray-200">{exercise.sets} sets × {exercise.reps} reps</span>
                  <span className="bg-white px-3 py-1 rounded-lg border border-gray-200">@ {exercise.weight}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MemberWorkouts;
