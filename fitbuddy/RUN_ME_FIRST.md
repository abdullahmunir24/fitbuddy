# RUN ME FIRST - Quick Start Guide

## Your App is Ready to Run!

Everything is connected and working. Follow these 3 simple steps:

---

## Step 1: Start Backend (Terminal 1)

```bash
cd fitbuddy/backend
npm install
npm run dev
```

Wait for this message:
```
FitBuddy API Server Started
Server running on: http://localhost:5000
```

KEEP THIS WINDOW OPEN!

---

## Step 2: Start Frontend (Terminal 2)

Open a NEW terminal window and run:

```bash
cd fitbuddy/frontend
npm install
npm run dev
```

Wait for this message:
```
Local:   http://localhost:3000/
```

KEEP THIS WINDOW OPEN!

---

## Step 3: Open Browser

Go to: **http://localhost:3000**

1. Click "Get Started"
2. Create an account:
   - Name: Your Name
   - Email: test@test.com
   - Password: Test1234
   - Role: Member
3. Click "Create Account"
4. You'll see your Dashboard!

---

## What You Can Do Now

- Create accounts
- Login/Logout
- View Dashboard with stats
- Test all backend endpoints

---

## Files Created/Updated

### Configuration Files
- `fitbuddy/frontend/.env` - Frontend API URL config
- `fitbuddy/backend/.env` - Backend server config

### Frontend
- `fitbuddy/frontend/src/pages/Login.jsx` - Connected to API
- `fitbuddy/frontend/src/pages/Signup.jsx` - Connected to API
- `fitbuddy/frontend/src/pages/Dashboard.jsx` - NEW protected page
- `fitbuddy/frontend/src/App.jsx` - Added dashboard route
- `fitbuddy/frontend/src/context/AuthContext.jsx` - NEW auth state management

### Documentation
- `fitbuddy/SETUP_AND_TEST_GUIDE.md` - Detailed guide
- `fitbuddy/README.md` - Updated with current status
- `fitbuddy/RUN_ME_FIRST.md` - This file

---

## Need Help?

See these files for more details:
- **SETUP_AND_TEST_GUIDE.md** - Complete setup and testing instructions
- **INTEGRATION_GUIDE.md** - Your teammate's integration notes
- **README.md** - Project overview

---

## Common Issues

**Port already in use?**
- Backend: Change PORT in `fitbuddy/backend/.env`
- Frontend: It will prompt you to use a different port

**CORS Error?**
- Make sure backend is on port 5000
- Check `FRONTEND_URL` in `fitbuddy/backend/.env`

**Can't login?**
- Check both servers are running
- Check browser console for errors (F12)

---

## That's It!

Your FitBuddy app is fully integrated and ready to use. Enjoy!

