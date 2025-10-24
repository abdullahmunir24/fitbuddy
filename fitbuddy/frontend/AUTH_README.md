# FitBuddy Authentication Pages

This document provides an overview of the Login and Signup pages implementation for the FitBuddy fitness web application.

## 📁 Project Structure

```
frontend/
├── components/
│   ├── Button.jsx       # Reusable button component with variants
│   ├── Input.jsx        # Reusable input field with validation
│   └── Select.jsx       # Reusable dropdown/select component
├── src/
│   ├── pages/
│   │   ├── Login.jsx    # Login page with authentication
│   │   └── Signup.jsx   # Signup page with user registration
│   ├── App.jsx          # Main app with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles with Tailwind
├── tailwind.config.js   # Tailwind configuration with FitBuddy theme
└── package.json         # Dependencies
```

## 🎨 Design System

### Color Palette

The FitBuddy brand uses a gym-inspired color palette:

- **Primary (Emerald Green)**: `#10b981` - Used for CTAs and accents
- **Dark Tones**: Shades of gray/black for backgrounds and text
- **Gradients**: 
  - `gradient-primary`: Green gradient for buttons
  - `gradient-dark`: Dark gradient for backgrounds

### Components

#### Input Component (`components/Input.jsx`)
- **Features**:
  - Label with optional required indicator
  - Error state with validation messages
  - Accessible with ARIA attributes
  - Focus states with ring effect
  - Disabled state support

#### Button Component (`components/Button.jsx`)
- **Variants**:
  - `primary`: Green gradient (default)
  - `secondary`: Dark background
  - `outline`: Transparent with border
- **Features**:
  - Loading state with spinner
  - Disabled state
  - Hover and active animations
  - Accessible focus states

#### Select Component (`components/Select.jsx`)
- **Features**:
  - Dropdown with options array
  - Error state with validation
  - Placeholder support
  - Accessible with ARIA attributes

## 🔐 Authentication Pages

### Login Page (`/login`)

**Features**:
- Email and password fields
- Client-side form validation
- "Forgot Password?" link (placeholder)
- Link to Signup page
- Loading state during authentication
- Error handling and display

**Validation Rules**:
- Email: Required, valid email format
- Password: Required, minimum 6 characters

**Mock Authentication**:
```javascript
// TODO: Replace with actual API call
// const response = await fetch('/api/auth/login', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify(formData)
// });
```

### Signup Page (`/signup`)

**Features**:
- Full name, email, password, confirm password fields
- Role selection dropdown (Member/Trainer)
- Comprehensive form validation
- Password requirements display
- Link to Login page
- Loading state during registration
- Error handling and display

**Validation Rules**:
- Full Name: Required, minimum 2 characters
- Email: Required, valid email format
- Password: Required, minimum 8 characters, must contain uppercase, lowercase, and number
- Confirm Password: Must match password
- Role: Required selection

**Mock Registration**:
```javascript
// TODO: Replace with actual API call
// const response = await fetch('/api/auth/signup', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     fullName: formData.fullName,
//     email: formData.email,
//     password: formData.password,
//     role: formData.role
//   })
// });
```

## 🚀 Getting Started

### Installation

Make sure you're in the frontend directory:

```bash
cd frontend
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Then navigate to:
- Login: `http://localhost:5173/login`
- Signup: `http://localhost:5173/signup`

### Build

Create a production build:

```bash
npm run build
```

## 🔧 Integration Checklist

To integrate with the backend authentication system:

### 1. API Endpoints

Create the following endpoints in your backend:

- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ token, user }`

- `POST /api/auth/signup`
  - Body: `{ fullName, email, password, role }`
  - Response: `{ token, user }`

### 2. JWT Token Management

```javascript
// After successful login/signup
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

// Add to API requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
}
```

### 3. Protected Routes

Create an authentication context or hook:

```javascript
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and validate
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token with backend
      // Set user if valid
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 4. Update Form Handlers

Replace mock API calls in `Login.jsx` and `Signup.jsx`:

```javascript
// In handleSubmit function
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});

if (!response.ok) {
  throw new Error('Authentication failed');
}

const data = await response.json();
localStorage.setItem('token', data.token);
navigate('/dashboard');
```

## 📱 Responsive Design

Both pages are fully responsive with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Key responsive features:
- Flexible form containers
- Responsive padding and spacing
- Mobile-optimized touch targets
- Readable font sizes across devices

## ♿ Accessibility

- Semantic HTML elements
- ARIA attributes for screen readers
- Keyboard navigation support
- Focus indicators
- Error messages linked to inputs
- Color contrast compliance

## 🎯 Next Steps

1. **Set up backend authentication API**
2. **Implement JWT token storage and refresh**
3. **Create protected route wrapper component**
4. **Add authentication context/provider**
5. **Implement "Forgot Password" functionality**
6. **Add social authentication (Google, Facebook)**
7. **Create email verification flow**
8. **Add two-factor authentication (2FA)**

## 📝 Notes

- All forms include client-side validation before submission
- Error states are cleared when users start typing
- Loading states prevent duplicate submissions
- Console logs are in place for debugging (remove in production)
- Mock alerts simulate successful operations

## 🐛 Known Issues / Future Enhancements

- [ ] Implement actual API integration
- [ ] Add password strength indicator
- [ ] Show/hide password toggle
- [ ] Remember me functionality
- [ ] Rate limiting for login attempts
- [ ] Email verification after signup
- [ ] Password reset functionality
- [ ] Social login integration

---

**Created**: October 23, 2025  
**Version**: 1.0.0  
**Framework**: React 18 + Vite + Tailwind CSS
