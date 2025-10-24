# 🧪 How to Test Your FitBuddy API Routes

## 🚀 Quick Start

### 1. Start the Backend Server

Open a terminal and run:
```bash
cd /Users/hashim/Desktop/L04_Alloc/fitbuddy/backend
npm run dev
```

You should see:
```
========================================
🚀 FitBuddy API Server Started
========================================
📡 Server running on: http://localhost:5000
```

**Keep this terminal open!** The server needs to stay running.

---

## ✅ Method 1: Using cURL (Command Line)

Open a **new terminal** and try these commands:

### Test 1: Health Check ❤️
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "uptime": 12.345,
  "timestamp": "2025-10-24T...",
  "environment": "development"
}
```

---

### Test 2: Create a New User (Signup) 📝
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@fitbuddy.com",
    "password": "SecurePass123",
    "role": "member"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@fitbuddy.com",
      "role": "member",
      "createdAt": "2025-10-24T..."
    }
  }
}
```

**📋 Copy the `accessToken` - you'll need it for protected routes!**

---

### Test 3: Login 🔑
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@fitbuddy.com",
    "password": "SecurePass123"
  }'
```

**Expected Response:** Same as signup (token + user data)

---

### Test 4: Get Current User (Protected) 🔒

**Replace `YOUR_TOKEN_HERE` with the actual token from signup/login:**

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Example with real token:**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBmaXRidWRkeS5jb20iLCJyb2xlIjoibWVtYmVyIiwiaWF0IjoxNzI5NzM5NzY0LCJleHAiOjE3MzAzNDQ1NjQsImlzcyI6ImZpdGJ1ZGR5LWFwaSIsImF1ZCI6ImZpdGJ1ZGR5LWFwcCJ9.abc123..."
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@fitbuddy.com",
      "role": "member",
      "createdAt": "2025-10-24T..."
    }
  }
}
```

---

### Test 5: Test Invalid Login ❌
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@email.com",
    "password": "wrongpassword"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Test 6: Protected Route Without Token 🚫
```bash
curl http://localhost:5000/api/auth/me
```

**Expected Response:**
```json
{
  "success": false,
  "message": "No authorization header provided. Please include a valid token."
}
```

---

## ✅ Method 2: Using Thunder Client (VS Code Extension)

**Better for testing with a GUI!**

### 1. Install Thunder Client
- Open VS Code
- Go to Extensions (⌘+Shift+X)
- Search "Thunder Client"
- Click Install

### 2. Create Requests

#### Test Signup:
1. Click "New Request"
2. Method: `POST`
3. URL: `http://localhost:5000/api/auth/signup`
4. Headers tab → Add: `Content-Type: application/json`
5. Body tab → Select "JSON" → Paste:
   ```json
   {
     "name": "John Doe",
     "email": "john@fitbuddy.com",
     "password": "SecurePass123",
     "role": "member"
   }
   ```
6. Click **Send** 🚀

#### Test Login:
1. New Request
2. Method: `POST`
3. URL: `http://localhost:5000/api/auth/login`
4. Headers: `Content-Type: application/json`
5. Body:
   ```json
   {
     "email": "john@fitbuddy.com",
     "password": "SecurePass123"
   }
   ```
6. Send → Copy the `accessToken`

#### Test Protected Route:
1. New Request
2. Method: `GET`
3. URL: `http://localhost:5000/api/auth/me`
4. Headers tab → Add: `Authorization: Bearer YOUR_TOKEN`
5. Send!

---

## ✅ Method 3: Using Postman

1. Download Postman: https://www.postman.com/downloads/
2. Create a new Collection called "FitBuddy API"
3. Add requests same as Thunder Client above
4. Use the "Auth" tab → Select "Bearer Token" for easier testing

---

## ✅ Method 4: Test from Frontend

Once your frontend is running on `http://localhost:3000`:

1. Go to `http://localhost:3000/signup`
2. Fill in the form
3. Submit
4. Check browser console (F12) for the response
5. Check localStorage for token: `localStorage.getItem('token')`

---

## 🎯 Complete Test Flow

Here's a complete workflow to test everything:

```bash
# Terminal 1: Start backend
cd /Users/hashim/Desktop/L04_Alloc/fitbuddy/backend
npm run dev

# Terminal 2: Run tests

# 1. Health check
curl http://localhost:5000/health

# 2. Create user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@fitbuddy.com","password":"Test1234","role":"member"}'

# 3. Save the token from response, then:
export TOKEN="paste_your_token_here"

# 4. Test protected route
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 5. Create a trainer
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Trainer Jane","email":"jane@fitbuddy.com","password":"Trainer123","role":"trainer"}'
```

---

## 📊 What You're Testing

| Endpoint | What It Does | What to Check |
|----------|--------------|---------------|
| `GET /health` | Server status | Returns "healthy" |
| `POST /api/auth/signup` | Create user | Returns token + user |
| `POST /api/auth/login` | Login user | Returns token + user |
| `GET /api/auth/me` | Get user (protected) | Requires valid token |

---

## 🐛 Common Issues

### "Connection refused"
- **Fix**: Make sure backend is running (`npm run dev`)

### "CORS error"
- **Fix**: Backend should allow `http://localhost:3000`
- Already configured in `.env`

### "Invalid token"
- **Fix**: Token might be expired or wrong
- Get a fresh token by logging in again

### "Email already registered"
- **Normal!** User exists in memory
- **Fix**: Use different email OR restart server to clear memory

---

## 💡 Pro Tips

1. **Use jq for pretty JSON** (optional):
   ```bash
   curl http://localhost:5000/health | jq .
   ```
   Install: `brew install jq`

2. **Save tokens automatically**:
   ```bash
   TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@fitbuddy.com","password":"SecurePass123"}' \
     | jq -r '.data.accessToken')
   
   echo $TOKEN
   ```

3. **Use the test script**:
   ```bash
   cd backend
   bash test-api.sh
   ```

---

## 🎉 Success Indicators

You know it's working when:

✅ Health endpoint returns status "healthy"  
✅ Signup returns a token and user object  
✅ Login works with correct credentials  
✅ Login fails with wrong credentials  
✅ Protected route requires Authorization header  
✅ Protected route returns user data with valid token  
✅ You can create users with different roles (member, trainer)  

---

## 🚀 Next Steps

Once you've verified everything works:

1. **Connect Frontend** - Update Login.jsx and Signup.jsx
2. **Build Dashboards** - Member/Trainer/Admin pages
3. **Add More Features** - Workouts, classes, etc.
4. **Set Up PostgreSQL** - Replace in-memory storage

---

**Need Help?** Check the backend console logs - they show every request!
