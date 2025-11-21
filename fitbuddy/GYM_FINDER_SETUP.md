# Gym Finder Setup Guide

## What's Been Implemented

Your gym finder now has:
- ✅ Real-time geolocation (asks for permission)
- ✅ Distance calculation from user to gyms
- ✅ Sorting by nearest gyms
- ✅ Search functionality
- ✅ "View Details" opens Google Maps
- ✅ "Get Directions" opens Google Maps directions
- ✅ 8 real Kelowna gyms with accurate coordinates
- ✅ Fully functional backend API

---

## Setup Instructions

### 1. Seed the Gyms Database

Run this command in the backend directory:

```bash
cd fitbuddy/backend
npm run seed-gyms
```

You should see:
```
✅ Successfully seeded all gyms!
📊 Summary:
   Total gyms added: 8
   Location: Kelowna, BC
```

### 2. Start the Backend (if not running)

```bash
cd fitbuddy/backend
npm run dev
```

Backend should be running on: `http://localhost:4000`

### 3. Start the Frontend (if not running)

```bash
cd fitbuddy/frontend
npm run dev
```

Frontend should be running on: `http://localhost:3000`

### 4. Test the Gym Finder

1. Go to `http://localhost:3000/member/gyms`
2. Browser will ask for location permission - **Click "Allow"**
3. You'll see gyms sorted by distance from your location
4. Click "View Details" to see gym on Google Maps
5. Click the directions icon to get directions

---

## Features Explained

### 🌍 Geolocation
- Automatically requests your location when page loads
- Shows permission status (granted/denied)
- Calculates distance to each gym
- Sorts gyms by nearest first

### 🔍 Search
- Search by gym name, city, or address
- Works with or without location
- Real-time filtering

### 📍 Google Maps Integration
- **View Details**: Opens gym location in Google Maps (new tab)
- **Get Directions**: Opens Google Maps with directions from your location
- No API key needed - uses Google Maps URL scheme

### 📊 Distance Display
- Shows "X km away" for each gym
- Only visible when location permission granted
- Accurate Haversine formula calculation

---

## Gyms Included

All gyms are real locations in Kelowna, BC:

1. **Anytime Fitness** - 1677 Commerce Ave #110
2. **GoodLife Fitness** - 1835 Gordon Dr
3. **CrossFit Revolution** - 1889 Springfield Rd #103
4. **The Realm Fitness** - 1876 Cooper Rd
5. **Planet Fitness** - 2271 Harvey Ave
6. **Body & Soul Fitness** - 375 Hartman Rd
7. **UBCO Fitness Centre** - 3333 University Way
8. **Yoga Studio Kelowna** - 1441 Ellis St #200

---

## API Endpoints Available

### Get All Gyms (with location filtering)
```
GET http://localhost:4000/api/gyms?lat=49.8880&lng=-119.4960&radius=50
```

### Search Gyms
```
GET http://localhost:4000/api/gyms/search?q=anytime&lat=49.8880&lng=-119.4960
```

### Get Specific Gym
```
GET http://localhost:4000/api/gyms/1
```

### Get Gym Facilities
```
GET http://localhost:4000/api/gyms/1/facilities
```

---

## Troubleshooting

### Location Permission Denied
- Check browser settings (usually a location icon in address bar)
- Try a different browser
- The app still works without location - just won't show distances

### No Gyms Showing
1. Make sure you ran `npm run seed-gyms`
2. Check backend is running on port 4000
3. Check browser console for errors
4. Verify database connection in backend

### Backend Not Connecting
1. Check `.env` file in backend folder
2. Make sure PostgreSQL is running
3. Verify database credentials
4. Check port 4000 is not in use

---

## How It Works

### Frontend Flow:
1. Page loads → Request geolocation permission
2. Get user coordinates (lat, lng)
3. Fetch gyms from API with user location
4. Calculate distance for each gym
5. Sort by distance
6. Display with "X km away"

### Backend Flow:
1. Receive request with user coordinates
2. Query all gyms from database
3. Calculate distance using Haversine formula
4. Filter by radius (default 50km)
5. Sort by distance
6. Return sorted results

### Google Maps Integration:
- Uses Google Maps URL scheme (no API key needed)
- `View Details`: `https://www.google.com/maps/search/?api=1&query=...`
- `Directions`: `https://www.google.com/maps/dir/?api=1&origin=...&destination=...`

---

## Future Enhancements (Optional)

If you want to add more features later:

1. **Google Places API** - Get real-time hours, ratings, reviews
2. **Gym Reviews** - Let users rate and review gyms
3. **Favorites** - Save favorite gyms
4. **Filters** - Filter by facilities, price, rating
5. **Map View** - Embedded map showing all gyms
6. **Photos** - Add gym photos

---

## Testing Checklist

- [ ] Location permission prompt appears
- [ ] Gyms load and display
- [ ] Distance shows correctly (km)
- [ ] Gyms sorted by nearest first
- [ ] Search works
- [ ] "View Details" opens Google Maps
- [ ] "Get Directions" opens Google Maps with directions
- [ ] Works without location permission (shows all gyms)
- [ ] Loading states show properly
- [ ] Error messages display correctly

---

**Status:** ✅ Fully Functional
**Time to Complete:** ~1.5 hours
**Last Updated:** November 21, 2025

