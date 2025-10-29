/**
 * ========================================
 * Mock Data Storage - In-Memory Database
 * ========================================
 * 
 * Temporary in-memory storage for:
 * - Workouts
 * - Exercises
 * - Sessions (Workout Logs)
 * 
 * TODO: Replace with PostgreSQL when database is ready
 * Each entity has CRUD operations (Create, Read, Update, Delete)
 * 
 * @module data/mockData
 */

// ========================================
// EXERCISES DATA
// ========================================

let exercises = [
  {
    id: 1,
    name: 'Bench Press',
    description: 'Push bar up from chest level',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
  },
  {
    id: 2,
    name: 'Squats',
    description: 'Lower body compound exercise',
    muscleGroup: 'Legs',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
  },
  {
    id: 3,
    name: 'Deadlifts',
    description: 'Full body compound lift',
    muscleGroup: 'Back',
    difficulty: 'Advanced',
    equipment: 'Barbell',
  },
  {
    id: 4,
    name: 'Pull-ups',
    description: 'Upper body pulling exercise',
    muscleGroup: 'Back',
    difficulty: 'Advanced',
    equipment: 'Pull-up Bar',
  },
  {
    id: 5,
    name: 'Dumbbell Curls',
    description: 'Bicep isolation exercise',
    muscleGroup: 'Biceps',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
  },
  {
    id: 6,
    name: 'Leg Press',
    description: 'Lower body pressing exercise',
    muscleGroup: 'Legs',
    difficulty: 'Beginner',
    equipment: 'Machine',
  },
];

// Counter for generating unique IDs
let exerciseCounter = exercises.length;

/**
 * Get all exercises
 * @returns {Array} List of all exercises
 */
export function getAllExercises() {
  return exercises;
}

/**
 * Get exercise by ID
 * @param {number} exerciseId - Exercise ID
 * @returns {Object|null} Exercise object or null if not found
 */
export function getExerciseById(exerciseId) {
  return exercises.find(ex => ex.id === exerciseId) || null;
}

/**
 * Create new exercise (Admin only)
 * @param {Object} exerciseData - Exercise data
 * @returns {Object} Created exercise with ID
 */
export function createExercise(exerciseData) {
  exerciseCounter++;
  const newExercise = {
    id: exerciseCounter,
    ...exerciseData,
    createdAt: new Date().toISOString(),
  };
  exercises.push(newExercise);
  return newExercise;
}

/**
 * Update exercise by ID
 * @param {number} exerciseId - Exercise ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated exercise or null if not found
 */
export function updateExercise(exerciseId, updates) {
  const exercise = exercises.find(ex => ex.id === exerciseId);
  if (!exercise) return null;
  
  Object.assign(exercise, updates, { updatedAt: new Date().toISOString() });
  return exercise;
}

/**
 * Delete exercise by ID
 * @param {number} exerciseId - Exercise ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteExercise(exerciseId) {
  const index = exercises.findIndex(ex => ex.id === exerciseId);
  if (index === -1) return false;
  exercises.splice(index, 1);
  return true;
}

// ========================================
// WORKOUTS DATA
// ========================================

let workouts = [];
let workoutCounter = 0;

/**
 * Create new workout
 * @param {number} userId - User ID
 * @param {Object} workoutData - Workout data
 * @returns {Object} Created workout with ID
 */
export function createWorkout(userId, workoutData) {
  workoutCounter++;
  const newWorkout = {
    id: workoutCounter,
    userId,
    ...workoutData,
    createdAt: new Date().toISOString(),
  };
  workouts.push(newWorkout);
  return newWorkout;
}

/**
 * Get all workouts
 * @returns {Array} List of all workouts
 */
export function getAllWorkouts() {
  return workouts;
}

/**
 * Get workout by ID
 * @param {number} workoutId - Workout ID
 * @returns {Object|null} Workout object or null if not found
 */
export function getWorkoutById(workoutId) {
  return workouts.find(w => w.id === workoutId) || null;
}

/**
 * Get workouts for a specific user
 * @param {number} userId - User ID
 * @returns {Array} List of user's workouts
 */
export function getUserWorkouts(userId) {
  return workouts.filter(w => w.userId === userId);
}

/**
 * Update workout by ID
 * @param {number} workoutId - Workout ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated workout or null if not found
 */
export function updateWorkout(workoutId, updates) {
  const workout = workouts.find(w => w.id === workoutId);
  if (!workout) return null;
  
  Object.assign(workout, updates, { updatedAt: new Date().toISOString() });
  return workout;
}

/**
 * Delete workout by ID
 * @param {number} workoutId - Workout ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteWorkout(workoutId) {
  const index = workouts.findIndex(w => w.id === workoutId);
  if (index === -1) return false;
  workouts.splice(index, 1);
  return true;
}

// ========================================
// SESSIONS (WORKOUT LOGS) DATA
// ========================================

let sessions = [];
let sessionCounter = 0;

/**
 * Create new workout session
 * @param {number} userId - User ID
 * @param {Object} sessionData - Session data
 * @returns {Object} Created session with ID
 */
export function createSession(userId, sessionData) {
  sessionCounter++;
  const newSession = {
    id: sessionCounter,
    userId,
    ...sessionData,
    status: sessionData.status || 'completed',
    createdAt: new Date().toISOString(),
  };
  sessions.push(newSession);
  return newSession;
}

/**
 * Get all sessions
 * @returns {Array} List of all sessions
 */
export function getAllSessions() {
  return sessions;
}

/**
 * Get session by ID
 * @param {number} sessionId - Session ID
 * @returns {Object|null} Session object or null if not found
 */
export function getSessionById(sessionId) {
  return sessions.find(s => s.id === sessionId) || null;
}

/**
 * Get sessions for a specific user
 * @param {number} userId - User ID
 * @returns {Array} List of user's sessions
 */
export function getUserSessions(userId) {
  return sessions.filter(s => s.userId === userId);
}

/**
 * Update session by ID
 * @param {number} sessionId - Session ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated session or null if not found
 */
export function updateSession(sessionId, updates) {
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return null;
  
  Object.assign(session, updates, { updatedAt: new Date().toISOString() });
  return session;
}

/**
 * Delete session by ID
 * @param {number} sessionId - Session ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteSession(sessionId) {
  const index = sessions.findIndex(s => s.id === sessionId);
  if (index === -1) return false;
  sessions.splice(index, 1);
  return true;
}

/**
 * Get user session statistics
 * @param {number} userId - User ID
 * @returns {Object} Statistics object
 */
export function getUserSessionStats(userId) {
  const userSessions = getUserSessions(userId);
  const completedSessions = userSessions.filter(s => s.status === 'completed');
  const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  
  return {
    totalSessions: userSessions.length,
    completedSessions: completedSessions.length,
    totalDuration,
    averageDuration: completedSessions.length > 0 ? Math.round(totalDuration / completedSessions.length) : 0,
  };
}
