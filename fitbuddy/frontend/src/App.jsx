import { Routes, Route } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MemberDashboard from './pages/member/MemberDashboard'
import MemberWorkouts from './pages/member/MemberWorkouts'
import MemberClasses from './pages/member/MemberClasses'
import MemberProgress from './pages/member/MemberProgress'
import MemberGyms from './pages/member/MemberGyms'
import MemberProfile from './pages/member/MemberProfile'
import MemberTrainer from './pages/member/MemberTrainer'
import MemberCardio from './pages/member/MemberCardio'
import TrainerDashboard from './pages/trainer/TrainerDashboard'
import TrainerClasses from './pages/trainer/TrainerClasses'
import TrainerClients from './pages/trainer/TrainerClients'
import TrainerSchedule from './pages/trainer/TrainerSchedule'
import TrainerProfile from './pages/trainer/TrainerProfile'

function App() {
  return (
    <RoleProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Member Routes */}
        <Route path="/member/dashboard" element={<MemberDashboard />} />
        <Route path="/member/workouts" element={<MemberWorkouts />} />
        <Route path="/member/cardio" element={<MemberCardio />} />
        <Route path="/member/classes" element={<MemberClasses />} />
        <Route path="/member/progress" element={<MemberProgress />} />
        <Route path="/member/gyms" element={<MemberGyms />} />
        <Route path="/member/trainer" element={<MemberTrainer />} />
        <Route path="/member/profile" element={<MemberProfile />} />
        
        {/* Trainer Routes */}
        <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
        <Route path="/trainer/classes" element={<TrainerClasses />} />
        <Route path="/trainer/clients" element={<TrainerClients />} />
        <Route path="/trainer/schedule" element={<TrainerSchedule />} />
        <Route path="/trainer/profile" element={<TrainerProfile />} />
      </Routes>
    </RoleProvider>
  )
}

export default App

