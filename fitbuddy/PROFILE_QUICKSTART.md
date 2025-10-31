# User Profile Page - Quick Start Guide

## Test the Profile Page in 5 Minutes

### Step 1: Start the Servers

**Terminal 1 - Backend:**
```bash
cd fitbuddy/backend
npm run dev
```
Backend should be running on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd fitbuddy/frontend
npm run dev
```
Frontend should be running on `http://localhost:3000`

---

### Step 2: Create a Test Account

1. Open browser to `http://localhost:3000`
2. Click "Get Started" or "Sign In"
3. Go to Signup page
4. Create account:
   - Name: Test User
   - Email: test@fitbuddy.com
   - Password: testpass123
   - Role: Member
5. Click "Create Account"

---

### Step 3: Access Profile Page

From the Dashboard, click the **"Profile"** button in the top-right corner (next to Logout).

You should see:
- Your avatar (letter "T" in a circle)
- Your name and email
- Empty phone and bio fields
- Account info section
- Workout stats (all 0 for new account)

---

### Step 4: Edit Your Profile

1. Click **"Edit Profile"** button
2. Fill in the fields:
   - Phone: `555-123-4567`
   - Bio: `I'm a fitness enthusiast who loves working out!`
   - Avatar URL: `https://ui-avatars.com/api/?name=Test+User&size=200&background=6366f1&color=fff`
3. Click **"Save Changes"**
4. You should see a green success message
5. Your avatar should now show (if you used the example URL above)

---

### Step 5: Change Password

1. Click **"Change Password"** button
2. Fill in:
   - Current Password: `testpass123`
   - New Password: `newpass123456`
   - Confirm New Password: `newpass123456`
3. Click **"Update Password"**
4. You should see a green success message
5. Try logging out and back in with the new password

---

### Step 6: Test Validation

Try these to see validation in action:

**Profile Validation:**
- Try setting name to just "T" (should fail - min 2 chars)
- Try invalid email like "notanemail" (should fail)
- Try phone with less than 10 digits (should fail)
- Try bio over 500 characters (should fail)
- Try avatar without http/https (should fail)

**Password Validation:**
- Try wrong current password (should fail)
- Try new password less than 8 chars (should fail)
- Try non-matching confirm password (should fail)

---

## Navigation Flow

```
Login Page
    ↓
Dashboard
    ↓ (Click Profile)
Profile Page
    ↓ (Back to Dashboard)
Dashboard
```

---

## API Endpoints Being Used

1. **GET /api/users/:id** - Load profile data
2. **GET /api/users/:id/stats** - Load workout statistics  
3. **PUT /api/users/:id** - Update profile
4. **PUT /api/users/:id/password** - Change password

All endpoints require JWT authentication.

---

## What You Should See

### Profile Page Sections:

**Left Side (Main Content):**
- Profile Information Card
  - Avatar
  - Name, Email
  - Phone, Bio
  - Edit/Save/Cancel buttons
- Change Password Card
  - Password fields
  - Update/Cancel buttons

**Right Side (Sidebar):**
- Account Info Card
  - Member since date
  - Account type
- Workout Stats Card
  - Total sessions (with blue icon)
  - Completed sessions (with green icon)
  - Total minutes (with purple icon)
  - Average duration (with yellow icon)
- Quick Actions Card
  - View Dashboard button

---

## Testing Different User Roles

Create multiple accounts with different roles to test:

1. **Member Account**
   - test-member@fitbuddy.com
   - Can edit own profile only

2. **Trainer Account**  
   - test-trainer@fitbuddy.com
   - Can edit own profile only
   - Shows "Trainer" role

3. **Admin Account**
   - test-admin@fitbuddy.com
   - Can edit own profile
   - Admin endpoints available

---

## Common Issues & Solutions

### Issue: "Profile won't load"
**Solution**: Make sure you're logged in and token exists in localStorage

### Issue: "Save button does nothing"
**Solution**: Check validation errors - all fields must be valid

### Issue: "Password change fails"
**Solution**: Make sure current password is correct

### Issue: "Avatar not showing"
**Solution**: Avatar URL must start with http:// or https://

---

## Sample Avatar URLs (for testing)

```
https://ui-avatars.com/api/?name=John+Doe&size=200&background=6366f1&color=fff
https://ui-avatars.com/api/?name=Jane+Smith&size=200&background=ec4899&color=fff
https://ui-avatars.com/api/?name=Test+User&size=200&background=10b981&color=fff
https://i.pravatar.cc/200?img=1
https://i.pravatar.cc/200?img=5
```

---

## Feature Checklist

- [x] View profile information
- [x] Edit profile with validation
- [x] Change password securely
- [x] View workout statistics
- [x] Responsive design
- [x] Real-time validation
- [x] Success/error messages
- [x] Avatar support
- [x] Bio with character counter
- [x] Navigation integration
- [x] Protected routes
- [x] JWT authentication

---

## Next: Log Some Workouts!

To see your stats increase:
1. Use the API to create workout sessions
2. Stats will automatically update
3. Return to profile to see updated numbers

Example session creation (via API):
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "workoutName": "Morning Run",
    "date": "2025-10-31",
    "duration": 45,
    "exercises": [],
    "status": "completed"
  }'
```

Then refresh your profile page to see updated stats!

---

**Happy Testing!**

