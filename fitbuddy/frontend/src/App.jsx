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

function App() {
  return (
    <RoleProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/member/dashboard" element={<MemberDashboard />} />
        <Route path="/member/workouts" element={<MemberWorkouts />} />
        <Route path="/member/classes" element={<MemberClasses />} />
        <Route path="/member/progress" element={<MemberProgress />} />
        <Route path="/member/gyms" element={<MemberGyms />} />
        <Route path="/member/profile" element={<MemberProfile />} />
      </Routes>
    </RoleProvider>
  )
}

export default App

