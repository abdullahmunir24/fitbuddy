# Cardio Analytics Dashboard

## Overview
A comprehensive cardio performance analytics dashboard featuring reusable chart components that visualize your actual cardio data with no mock data.

## Features

### 📊 Performance Metrics Charts

1. **Pace Per Session**
   - Line chart showing your pace for each workout
   - Displays min/km for distance-based activities
   - Shows best pace, average pace, and total sessions
   - Lower pace = faster running

2. **Pace Improvement Trend**
   - 7-day moving average to show overall progress
   - Smooth trend line to visualize improvement over time
   - Progress indicator showing pace improvement
   - Motivational feedback based on performance

3. **Calories Burned Per Workout**
   - Vertical bar chart for each session
   - Shows highest, average, and total calories
   - Hover tooltips for detailed information
   - Color-coded with orange gradient

4. **Weekly Calories Burned**
   - Aggregated weekly calorie totals
   - Groups sessions by week (Monday start)
   - Shows weekly average and total weeks tracked
   - Purple gradient bars for visual appeal

5. **Calories by Activity Type**
   - Dual visualization: Donut chart + Horizontal bars
   - Distribution across running, cycling, swimming, etc.
   - Shows sessions, distance, and calories per activity
   - Percentage breakdown with detailed stats

## Reusable Chart Components

### LineChart Component
```jsx
<LineChart 
  data={arrayOfData}           // Array of data points
  dataKey="propertyName"        // Key to extract value from
  label="Chart Label"           // Chart description
  color="indigo"               // Color theme (indigo, blue, green, orange, purple)
  height={200}                 // Chart height in pixels
  showDots={true}              // Show data point dots
/>
```

**Features:**
- SVG-based for crisp rendering
- Automatic scaling and axis generation
- Grid lines with value labels
- Area fill under line
- Hover tooltips on data points
- Responsive design

### BarChart Component
```jsx
<BarChart 
  data={arrayOfData}           // Array of data points
  dataKey="propertyName"        // Key for bar height
  labelKey="labelProperty"      // Key for labels
  color="orange"               // Color theme
  height={250}                 // Chart height in pixels
  horizontal={false}           // Vertical (false) or Horizontal (true)
/>
```

**Features:**
- Vertical or horizontal orientation
- Gradient fills
- Percentage calculations for horizontal mode
- Hover tooltips
- Animated transitions
- Auto-scaling

### PieChart Component
```jsx
<PieChart 
  data={arrayOfData}           // Array of data points
  dataKey="propertyName"        // Key for slice size
  labelKey="labelProperty"      // Key for labels
  size={200}                   // Chart diameter in pixels
/>
```

**Features:**
- Donut chart style (hollow center)
- Total displayed in center
- Color-coded slices
- Legend with percentages
- Hover tooltips
- Responsive layout

## Data Processing

### Automatic Data Transformation
The analytics page automatically processes your cardio session data:

1. **Sorts chronologically** for trend analysis
2. **Filters pace data** (only sessions with valid pace)
3. **Calculates moving averages** for smooth trends
4. **Groups by week** for weekly aggregation
5. **Aggregates by activity type** for distribution analysis

### Real-Time Updates
- Fetches fresh data based on selected period (week/month/year/all time)
- No caching - always shows current data
- Recalculates all metrics on period change

## Navigation

### Access Points
1. **From Cardio Tracking Page**: Click "📊 View Analytics" button
2. **Direct URL**: `/member/cardio/analytics`

### Routes
- Main Cardio: `/member/cardio`
- Analytics: `/member/cardio/analytics`

## Usage

### Viewing Analytics
1. Log some cardio sessions (duration + distance for pace calculations)
2. Navigate to Cardio Tracking page
3. Click "View Analytics" button
4. Select time period (week/month/year/all time)
5. Explore different charts and metrics

### Period Selection
- **Week**: Last 7 days of data
- **Month**: Last 30 days of data
- **Year**: Last 365 days of data
- **All Time**: Complete history

### Chart Interactions
- **Hover** over data points for exact values
- **View tooltips** for detailed information
- **Compare periods** by changing time range
- **Track progress** with moving averages

## Data Requirements

### For Pace Charts
- Sessions must have **distance_km** > 0
- Sessions must have **duration_minutes** > 0
- Pace automatically calculated: `duration / distance`

### For Calorie Charts
- All sessions included
- Calories auto-calculated using MET values
- Works with all activity types

### For Activity Distribution
- Groups by **activity_type**
- Aggregates calories, sessions, and distance
- Minimum 1 session required

## Summary Stats Cards

At the bottom of analytics page:
1. **Total Sessions** - Total count of cardio workouts
2. **Total Distance** - Sum of all distances in km
3. **Total Calories** - Sum of all calories burned
4. **Total Duration** - Sum of all workout minutes

## Technical Details

### Component Location
```
frontend/src/
├── components/
│   └── charts/
│       ├── LineChart.jsx      # Reusable line chart
│       ├── BarChart.jsx       # Reusable bar chart
│       ├── PieChart.jsx       # Reusable pie/donut chart
│       └── index.js           # Export barrel file
└── pages/
    └── member/
        ├── MemberCardio.jsx       # Main tracking page
        └── CardioAnalytics.jsx    # Analytics dashboard
```

### Data Flow
1. User selects period → API call to `/api/cardio?period=X`
2. Receives session array from backend
3. `processChartData()` transforms raw data
4. Updates state for each chart type
5. Charts render with props from processed data

### No Mock Data
- All charts use **real data from database**
- Empty states shown when no data available
- Charts receive data via **props only**
- No hardcoded values or fallbacks

## Color Themes

Charts support these color themes:
- **indigo**: Primary brand color
- **blue**: Pace and speed metrics
- **green**: Improvement and success
- **orange**: Calories and energy
- **purple**: Aggregated data
- **red**: High-intensity metrics
- **cyan**: Distance tracking
- **yellow**: Secondary highlights

## Performance Optimization

- SVG rendering for smooth graphics
- Efficient data processing algorithms
- Minimal re-renders with proper state management
- Responsive design without media queries
- No external chart libraries (native SVG)

## Future Enhancements

Potential additions:
- Export charts as images
- Compare multiple time periods
- Set performance goals
- Achievement badges
- Social sharing
- Personal records tracking
- Training zones analysis
- Heart rate integration (when available)

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

Requires:
- SVG support
- ES6+ JavaScript
- CSS Grid and Flexbox
- Fetch API
