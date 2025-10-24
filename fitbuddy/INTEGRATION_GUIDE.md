# 🔗 Frontend-Backend Integration Guide

## Quick Setup

### Backend is Running ✅
- **URL**: `http://localhost:5000`
- **Status**: Ready to receive requests

### Frontend is Running ✅
- **URL**: `http://localhost:3000`
- **Status**: Login and Signup pages ready

---

## 🎯 Integration Steps

### Step 1: Update Frontend Environment Variables

Create or update `/frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### Step 2: Update Login Page

Open `/frontend/src/pages/Login.jsx` and replace the mock API call:

**Find this code** (around line 75):
```javascript
// TODO: Replace with actual API call
// Mock API call for now
await new Promise(resolve => setTimeout(resolve, 1500));

console.log('Login data:', formData);
// Simulate successful login
alert('Login successful! (Mock)');
```

**Replace with**:
```javascript
// Make actual API call to backend
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Login failed');
}

const data = await response.json();

// Store token and user data
localStorage.setItem('token', data.data.accessToken);
localStorage.setItem('user', JSON.stringify(data.data.user));

// Redirect to dashboard (create this later)
alert('Login successful!');
console.log('User:', data.data.user);
// navigate('/dashboard'); // Uncomment when dashboard is ready
```

### Step 3: Update Signup Page

Open `/frontend/src/pages/Signup.jsx` and replace the mock API call:

**Find this code** (around line 110):
```javascript
// TODO: Replace with actual API call
// Mock API call for now
await new Promise(resolve => setTimeout(resolve, 1500));

console.log('Signup data:', {
  fullName: formData.fullName,
  email: formData.email,
  role: formData.role
});

// Simulate successful signup
alert('Account created successfully! (Mock)');
navigate('/login');
```

**Replace with**:
```javascript
// Make actual API call to backend
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: formData.fullName,
    email: formData.email,
    password: formData.password,
    role: formData.role
  })
});

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Signup failed');
}

const data = await response.json();

// Store token and user data
localStorage.setItem('token', data.data.accessToken);
localStorage.setItem('user', JSON.stringify(data.data.user));

// Redirect to login or dashboard
alert('Account created successfully!');
navigate('/login');
```

---

## 🧪 Testing the Integration

### Test 1: Signup Flow

1. Go to `http://localhost:3000/signup`
2. Fill in the form:
   - **Name**: John Doe
   - **Email**: john@fitbuddy.com
   - **Password**: SecurePass123
   - **Confirm Password**: SecurePass123
   - **Role**: Member
3. Click "Create Account"
4. ✅ Should receive success message
5. ✅ Should be redirected to login page
6. ✅ Check browser console - should see user data
7. ✅ Check localStorage - should have `token` and `user`

### Test 2: Login Flow

1. Go to `http://localhost:3000/login`
2. Enter credentials:
   - **Email**: john@fitbuddy.com
   - **Password**: SecurePass123
3. Click "Sign In"
4. ✅ Should receive success message
5. ✅ Check browser console - should see user data
6. ✅ Check localStorage - should have updated `token`

### Test 3: Protected Route (Optional)

Create a test protected route to verify the token works:

```javascript
// In your frontend
const testProtectedRoute = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Current user:', data);
};
```

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
```
Access to fetch at 'http://localhost:5000' has been blocked by CORS policy
```

**Solution**: Backend CORS is already configured for `http://localhost:3000`. If your frontend runs on a different port, update `FRONTEND_URL` in `/backend/.env`

---

### Issue 2: Network Error
```
Failed to fetch
```

**Checklist**:
- ✅ Backend running? Check `http://localhost:5000/health`
- ✅ Correct URL in frontend? Check `.env` file
- ✅ CORS configured? Check backend `.env`

---

### Issue 3: 401 Unauthorized on Protected Routes
```
{"success": false, "message": "Invalid or expired token"}
```

**Solutions**:
1. Check token is in localStorage: `localStorage.getItem('token')`
2. Token might be expired (default: 7 days)
3. Re-login to get a new token

---

### Issue 4: Email Already Registered
```
{"success": false, "message": "Email already registered..."}
```

**This is normal!** The backend is using in-memory storage. Users persist until you restart the backend server.

**To reset**: Restart the backend server (`npm run dev`)

---

## 📦 Full Code Examples

### Example: Login with Error Handling

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setLoading(true);
  setErrors({});

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Success - store token and user
    localStorage.setItem('token', data.data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));

    console.log('Login successful:', data.data.user);
    alert('Welcome back!');
    
    // Navigate to dashboard
    // navigate('/dashboard');
    
  } catch (error) {
    console.error('Login error:', error);
    setErrors({ general: error.message || 'Login failed. Please try again.' });
  } finally {
    setLoading(false);
  }
};
```

### Example: Creating an Auth Context

For better state management, create an auth context:

```javascript
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user and token from localStorage on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }

    localStorage.setItem('token', data.data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    setToken(data.data.accessToken);
    setUser(data.data.user);
    
    return data.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## ✅ Integration Checklist

- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend server running on `http://localhost:3000`
- [ ] Created `/frontend/.env` with `VITE_API_URL`
- [ ] Updated Login page with real API call
- [ ] Updated Signup page with real API call
- [ ] Tested signup flow - user created successfully
- [ ] Tested login flow - authentication successful
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage
- [ ] Ready to build dashboard and protected routes!

---

## 🚀 Next Steps

1. **Create Dashboard Pages**
   - Member dashboard
   - Trainer dashboard
   - Admin dashboard

2. **Add Protected Routes**
   - Use `requireAuth` middleware pattern in frontend
   - Redirect to login if no token

3. **Implement Logout**
   - Clear localStorage
   - Redirect to login page

4. **Add More Features**
   - Workout tracking
   - Class scheduling
   - Progress analytics
   - Gym discovery

5. **Set Up PostgreSQL Database**
   - Follow backend README for migration guide
   - All TODO comments are in place!

---

**Happy Coding! 🎉**
