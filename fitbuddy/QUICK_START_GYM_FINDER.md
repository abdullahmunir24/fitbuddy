# Quick Start - Gym Finder

## 🚀 Get It Running in 3 Steps

### Step 1: Seed the Gyms
```bash
cd fitbuddy/backend
npm run seed-gyms
```

Wait for: `✅ Successfully seeded all gyms!`

### Step 2: Start Backend (if not running)
```bash
cd fitbuddy/backend
npm run dev
```

Should see: `Server running on: http://localhost:4000`

### Step 3: Go to Gym Finder
Open browser: `http://localhost:3000/member/gyms`

**Click "Allow" when browser asks for location!**

---

## ✅ What You'll See

1. **Location Permission Popup** - Click "Allow"
2. **Green Banner** - "Location found! Showing gyms sorted by distance"
3. **8 Gym Cards** - Sorted by nearest first
4. **Distance Labels** - "2.3 km away" on each card
5. **View Details Button** - Opens Google Maps
6. **Directions Icon** - Opens Google Maps directions

---

## 🎯 Test These Features

### Test Geolocation
- Allow location → See distances
- Deny location → Still works, no distances shown
- Click "Try again" → Re-request permission

### Test Search
- Search "Anytime" → Find Anytime Fitness
- Search "CrossFit" → Find CrossFit Revolution
- Clear search → Show all gyms

### Test Google Maps
- Click "View Details" → Opens gym in Google Maps (new tab)
- Click directions icon → Opens Google Maps with directions

### Test Distance Sorting
- Gyms should be sorted nearest to farthest
- Distance should be accurate (Kelowna area)

---

## 🏋️ Gyms You'll See

1. Anytime Fitness (1677 Commerce Ave)
2. GoodLife Fitness (1835 Gordon Dr)
3. CrossFit Revolution (1889 Springfield Rd)
4. The Realm Fitness (1876 Cooper Rd)
5. Planet Fitness (2271 Harvey Ave)
6. Body & Soul Fitness (375 Hartman Rd)
7. UBCO Fitness Centre (3333 University Way)
8. Yoga Studio Kelowna (1441 Ellis St)

All real locations in Kelowna, BC!

---

## 🐛 Quick Fixes

**No gyms showing?**
```bash
cd fitbuddy/backend
npm run seed-gyms
```

**Backend not running?**
```bash
cd fitbuddy/backend
npm run dev
```

**Location not working?**
- Check browser address bar for location icon
- Click it and allow location
- Refresh page

---

## 📱 How to Demo

1. Open `http://localhost:3000/member/gyms`
2. Allow location when prompted
3. Show gyms sorted by distance
4. Click "View Details" on any gym
5. Show Google Maps opens with gym location
6. Go back, click directions icon
7. Show Google Maps directions from your location

**Perfect for showing off your project!**

---

## 🎓 What This Demonstrates

- ✅ Geolocation API usage
- ✅ Distance calculation (Haversine formula)
- ✅ RESTful API integration
- ✅ Real-time data fetching
- ✅ Error handling
- ✅ Loading states
- ✅ Google Maps integration
- ✅ Responsive design
- ✅ User permissions handling

---

**Time to set up:** 2 minutes
**Status:** ✅ Ready to use!

