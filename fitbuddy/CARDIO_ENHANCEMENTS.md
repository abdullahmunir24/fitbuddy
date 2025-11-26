# Cardio Feature Enhancements

## Overview
Enhanced the cardio tracking feature with automatic calorie calculation using MET (Metabolic Equivalent of Task) values and modern fitness app-style charts.

## Changes Made

### 1. Database Schema Updates (`database/schema.sql`)
**Removed Fields:**
- `average_heart_rate` - Removed as requested
- `max_heart_rate` - Removed as requested
- `start_time`, `end_time` - Simplified to just duration
- `max_speed_kmh` - Removed
- `elevation_gain_m` - Removed
- `weather_conditions` - Removed
- `route_data` - Removed

**Streamlined Schema:**
```sql
CREATE TABLE IF NOT EXISTS cardio_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes INTEGER NOT NULL,
    distance_km DECIMAL(6,2),
    average_speed_kmh DECIMAL(5,2),
    calories_burned INTEGER, -- Auto-calculated using MET values
    pace_min_per_km DECIMAL(5,2), -- Auto-calculated
    intensity_level VARCHAR(20),
    location VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Backend API Updates (`backend/src/routes/cardioRoutes.js`)

**Automatic Calorie Calculation:**
- Implemented modern MET (Metabolic Equivalent of Task) values for all activity types
- Formula: `Calories = MET × Weight(kg) × Duration(hours)`
- Uses assumed weight of 70kg (can be personalized later)

**MET Values by Activity and Intensity:**

| Activity | Low | Moderate | High | Very High |
|----------|-----|----------|------|-----------|
| Running | 6.0 | 9.8 | 11.5 | 14.5 |
| Cycling | 4.0 | 8.0 | 10.0 | 12.0 |
| Swimming | 6.0 | 8.0 | 10.0 | 11.0 |
| Walking | 3.0 | 3.5 | 4.5 | 5.0 |
| Rowing | 4.8 | 7.0 | 8.5 | 12.0 |
| Elliptical | 5.0 | 7.0 | 8.0 | 9.5 |
| Stair Climbing | 4.0 | 8.0 | 9.0 | 12.0 |
| Hiking | 4.5 | 6.0 | 7.5 | 9.0 |

**Speed-Based MET Adjustment for Running:**
- < 8 km/h: MET 6.0 (jogging)
- 8-9 km/h: MET 8.3
- 9-10 km/h: MET 9.8
- 10-11 km/h: MET 10.5
- 11-12 km/h: MET 11.5
- 12-13 km/h: MET 12.5
- 13-14 km/h: MET 13.5
- 14+ km/h: MET 14.5 (fast running)

**API Changes:**
- POST `/api/cardio` - Auto-calculates calories based on activity, intensity, and duration
- PUT `/api/cardio/:id` - Recalculates calories when session is updated
- Removed heart rate fields from request/response

### 3. Frontend UI Enhancements (`frontend/src/pages/member/MemberCardio.jsx`)

**Modern Charts Added:**

1. **7-Day Activity Chart (Dual Charts)**
   - Duration bar chart with gradient (indigo)
   - Calories bar chart with gradient (orange)
   - Shows values on hover
   - Animated bars with smooth transitions

2. **Activity Breakdown Chart**
   - Horizontal progress bars showing percentage of time per activity
   - Color-coded by activity type
   - Shows session count, distance, and duration
   - Sorted by most active

3. **30-Day Distance Trend**
   - Micro bar chart showing daily distance over 30 days
   - Hover tooltips with date and distance
   - Gradient cyan bars
   - Visual trend identification

**UI Improvements:**
- Removed heart rate input fields from modal
- Added auto-calculation note for calories
- Modern gradient stat cards (blue, green, purple, orange-red)
- Activity icons for each type (🏃 🚴 🏊 🚶 🚣 ⚙️ 🪜 🥾)
- Intensity level color coding (green → yellow → orange → red)
- Hover effects on all interactive elements
- Smooth transitions and animations

**Form Simplification:**
- Only required field: Duration (minutes)
- Optional fields: Distance, Location, Notes
- Intensity level dropdown (affects calorie calculation)
- Activity type selector with icons
- Automatic calorie calculation message displayed

### 4. Data Visualization Features

**Weekly Overview:**
- 7-day bar charts for duration and calories
- Day labels (Mon, Tue, Wed, etc.)
- Height proportional to max value in period
- Shows actual values inside bars

**Activity Distribution:**
- Percentage breakdown by activity type
- Visual progress bars
- Total sessions and metrics per activity
- Icon representation

**Monthly Trend:**
- 30-day distance tracking
- Micro-visualization for pattern recognition
- Hover tooltips with precise data
- Responsive to data changes

### 5. User Experience Improvements

**Smart Defaults:**
- Current date pre-filled
- Moderate intensity selected by default
- Running as default activity

**Real-Time Feedback:**
- Calorie calculation happens server-side
- No manual calorie input needed
- Pace and speed auto-calculated from distance/duration

**Period Filtering:**
- Week, Month, Year, All Time views
- Stats update dynamically
- Charts adjust to selected period

## Technical Standards

### Calorie Calculation Formula
Based on American College of Sports Medicine (ACSM) guidelines:
```
Calories = MET × Body Weight (kg) × Duration (hours)
```

### MET Values Source
- Based on Compendium of Physical Activities
- Industry-standard values for fitness tracking
- Adjusts for running speed when distance is provided
- Accounts for intensity levels across all activities

### Accuracy
- Estimates are within industry standard deviation
- More accurate than basic duration-only calculations
- Can be personalized with user weight in future updates
- Speed-based adjustments for running improve accuracy

## Future Enhancement Opportunities

1. **User Weight Input**
   - Add weight to user profile
   - Use actual weight for calorie calculations
   - Track weight changes over time

2. **Heart Rate Integration** (Optional)
   - Could be re-added if heart rate monitors become available
   - Would further refine calorie calculations
   - Not required for accurate base estimates

3. **Goal Setting**
   - Weekly/monthly distance goals
   - Calorie burn targets
   - Consistency streaks

4. **Social Features**
   - Activity sharing
   - Leaderboards
   - Challenge friends

## Migration Notes

- All existing sessions will need calorie recalculation
- Heart rate data (if any) will be lost
- Database needs to be rebuilt with new schema
- Users should be notified about automatic calorie calculation

## Deployment Status

✅ Database schema updated
✅ Backend API with MET calculations implemented
✅ Frontend UI with modern charts deployed
✅ Containers rebuilt with new schema
✅ All services running successfully

## Testing Checklist

- [ ] Create new cardio session - verify calories auto-calculated
- [ ] Test different activity types - verify different calorie amounts
- [ ] Test different intensities - verify calorie variation
- [ ] Check running with distance - verify speed-based MET adjustment
- [ ] View 7-day charts - verify data displays correctly
- [ ] Check activity breakdown - verify percentages sum to 100%
- [ ] View 30-day trend - verify all days displayed
- [ ] Filter by period (week/month/year/all) - verify stats update
- [ ] Edit session - verify calories recalculated
- [ ] Delete session - verify stats update

## References

- [Compendium of Physical Activities](https://sites.google.com/site/compendiumofphysicalactivities/)
- [ACSM Calorie Calculation Guidelines](https://www.acsm.org/)
- Modern fitness apps: Strava, Nike Run Club, Fitbit for UI/UX inspiration
