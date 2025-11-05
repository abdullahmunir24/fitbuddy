# 🎨 FitBuddy Member Dashboard - Visual Guide

## 📱 Page Layouts & Features

### 1. **Landing Page** (`/`)
```
┌─────────────────────────────────────────────┐
│                                             │
│              [Floating Logo 💪]             │
│                                             │
│              FitBuddy                       │
│    All your fitness needs, one platform     │
│                                             │
│        [Sign Up]    [Login]                 │
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐│
│  │Track   │ │Join    │ │View    │ │Find  ││
│  │Workouts│ │Classes │ │Progress│ │Gyms  ││
│  └────────┘ └────────┘ └────────┘ └──────┘│
└─────────────────────────────────────────────┘
```
**Features:**
- Gradient background (gray-900 to gray-800)
- Animated floating logo
- Feature highlight cards
- CTA buttons for signup/login

---

### 2. **Member Dashboard** (`/member/dashboard`)
```
┌─[Sidebar]─┬──────────────────────────────────┐
│           │ [Navbar: Welcome! | User | Logout]│
│ 📊 Dashboard │                                 │
│ 💪 Workouts  │  Welcome back, Haider! 🎉      │
│ 🏃 Classes   │                                 │
│ 📈 Progress  │ ┌──────┐ ┌──────┐ ┌──────┐    │
│ 🏋️ Gyms      │ │ 28   │ │  7   │ │12,450│    │
│ 👤 Profile   │ │Works │ │Class │ │ Cal  │    │
│              │ └──────┘ └──────┘ └──────┘    │
│              │                                 │
│              │ Quick Links:                    │
│              │ ┌──────┐ ┌──────┐ ┌──────┐    │
│              │ │💪    │ │🏃    │ │📈    │    │
│              │ │Workts│ │Class │ │Prog  │    │
│              │ └──────┘ └──────┘ └──────┘    │
│              │                                 │
│              │ Recent Activity:                │
│              │ • 💪 Swimming - 2 hours ago     │
│              │ • 🏃 Joined HIIT - 1 day ago    │
└──────────────┴──────────────────────────────────┘
```
**Features:**
- Stats cards (workouts, classes, calories)
- Quick link gradient cards
- Recent activity feed
- Motivational card

---

### 3. **Workouts Page** (`/member/workouts`)
```
┌─[Sidebar]─┬──────────────────────────────────┐
│           │ [Navbar]                          │
│           │                                    │
│           │  My Workouts      [+ Add Workout] │
│           │                                    │
│           │ ┌──────┐ ┌──────┐ ┌──────┐       │
│           │ │  28  │ │12,450│ │ 12.5 │       │
│           │ │Total │ │Cals  │ │Hours │       │
│           │ └──────┘ └──────┘ └──────┘       │
│           │                                    │
│           │ ┌──────────────────────────────┐  │
│           │ │Date│Workout│Sets│Reps│Duration││
│           │ ├──────────────────────────────┤  │
│           │ │Nov1│Bench  │ 3  │ 10 │ 25min ││
│           │ │Nov2│Running│ -  │ -  │ 40min ││
│           │ └──────────────────────────────┘  │
└──────────────┴──────────────────────────────────┘
```
**Features:**
- Add workout modal
- Stats overview cards
- Workout history table
- Calories & duration tracking

---

### 4. **Classes Page** (`/member/classes`)
```
┌─[Sidebar]─┬──────────────────────────────────┐
│           │ [Navbar]                          │
│           │                                    │
│           │  🎯 My Classes                     │
│           │ ┌────────────────────────────┐    │
│           │ │ Yoga Flow with Sarah       │    │
│           │ │ 10:00 AM • 60 min         │    │
│           │ │ [Leave Class]              │    │
│           │ └────────────────────────────┘    │
│           │                                    │
│           │  📚 Available Classes              │
│           │ ┌─────────┐ ┌─────────┐ ┌──────┐ │
│           │ │HIIT     │ │Spin     │ │Pilates││
│           │ │w/ Alex  │ │w/ Mike  │ │w/ Emma││
│           │ │Advanced │ │Intermed│ │Beginner││
│           │ │[Join]   │ │[Join]   │ │[Join] ││
│           │ └─────────┘ └─────────┘ └──────┘ │
└──────────────┴──────────────────────────────────┘
```
**Features:**
- My classes section (joined)
- Available classes grid
- Join/Leave toggle
- Difficulty badges
- Class tips card

---

### 5. **Progress Page** (`/member/progress`)
```
┌─[Sidebar]─┬──────────────────────────────────┐
│           │ [Navbar]                          │
│           │                                    │
│           │  🚀 You're on track!               │
│           │                                    │
│           │  Monthly Goals:                    │
│           │  💪 Workouts Completed    80%     │
│           │  ████████░░ 28 of 35              │
│           │                                    │
│           │  🏃 Classes Attended      70%     │
│           │  ███████░░░ 7 of 10               │
│           │                                    │
│           │  🔥 Calories Goal         90%     │
│           │  █████████░ 12,450 of 14,000      │
│           │                                    │
│           │  🏆 Achievements                   │
│           │ ┌──────┐ ┌──────┐ ┌──────┐       │
│           │ │🎯✓  │ │⚡✓  │ │🏆✓  │       │
│           │ │First│ │Week │ │Class│       │
│           │ └──────┘ └──────┘ └──────┘       │
└──────────────┴──────────────────────────────────┘
```
**Features:**
- Animated progress bars
- Percentage completion
- Weekly stats cards
- Achievement badges (locked/unlocked)
- Motivational banner

---

### 6. **Gyms Page** (`/member/gyms`)
```
┌─[Sidebar]─┬──────────────────────────────────┐
│           │ [Navbar]                          │
│           │                                    │
│           │  Discover Gyms                     │
│           │  [Search bar............]         │
│           │                                    │
│           │ ┌─────────┐ ┌─────────┐ ┌───────┐│
│           │ │🏋️      │ │🎓      │ │💪     ││
│           │ │Gold's   │ │UBCO    │ │CrossFit││
│           │ │⭐ 4.8   │ │⭐ 4.9  │ │⭐ 4.7 ││
│           │ │$45/mo   │ │$25/mo  │ │$65/mo ││
│           │ │2.3 km   │ │0.5 km  │ │3.1 km ││
│           │ │Pool,24/7│ │Students│ │Classes││
│           │ │[Details]│ │[Details]│ │[Details]││
│           │ └─────────┘ └─────────┘ └───────┘│
│           │                                    │
│           │  🗺️ Map View (Coming Soon)        │
└──────────────┴──────────────────────────────────┘
```
**Features:**
- Search bar (UI only)
- Gym cards with ratings
- Distance & pricing
- Facilities tags
- Map placeholder
- Tips section

---

### 7. **Profile Page** (`/member/profile`)
```
┌─[Sidebar]─┬──────────────────────────────────┐
│           │ [Navbar]                          │
│           │                                    │
│           │  ═══════════════════════           │
│           │  ┌─────┐                           │
│           │  │  H  │  Haider Ali               │
│           │  └─────┘  haider@fitbuddy.com     │
│           │           +1 (250) 555-0123       │
│           │           Kelowna, BC             │
│           │                                    │
│           │  About:                            │
│           │  Fitness enthusiast...            │
│           │                                    │
│           │ ┌──────┐ ┌──────┐ ┌──────┐       │
│           │ │  28  │ │  7   │ │Jan 24│       │
│           │ │Works │ │Class │ │Member│       │
│           │ └──────┘ └──────┘ └──────┘       │
│           │                                    │
│           │  Preferences:                      │
│           │  📧 Email Notifications  [ON]     │
│           │  🔔 Push Notifications   [ON]     │
│           │  📊 Weekly Reports       [OFF]    │
└──────────────┴──────────────────────────────────┘
```
**Features:**
- Cover image
- Avatar with initial
- Edit profile modal
- Stats cards
- Notification toggles
- Bio section

---

## 🎨 Design Elements

### Sidebar (All Pages)
```
╔══════════════╗
║   FitBuddy   ║
║──────────────║
║ 📊 Dashboard ║ ← Active (gradient)
║ 💪 Workouts  ║ ← Hover effect
║ 🏃 Classes   ║
║ 📈 Progress  ║
║ 🏋️ Gyms      ║
║ 👤 Profile   ║
║              ║
║ 💡 Pro Tip   ║
║ Track daily! ║
╚══════════════╝
```
- Dark gradient background
- Emoji icons
- Active state: gradient + scale
- Hover: lighter bg + scale
- Pro tip at bottom

### Navbar (All Member Pages)
```
┌────────────────────────────────────────────┐
│ Welcome back! 👋                           │
│ Let's crush your goals    [🔔] [👤 Haider Ali] [Logout] │
└────────────────────────────────────────────┘
```
- Sticky top position
- User avatar with initial
- Notification indicator
- Logout button

### Color Palette
- **Primary**: Blue (500-600) → Purple (500-600)
- **Success**: Green (500) → Teal (500)
- **Warning**: Orange (500) → Red (600)
- **Neutral**: Gray (50-900)
- **Background**: Subtle color tints

### Typography Hierarchy
```
H1: text-3xl font-bold        (Page titles)
H2: text-2xl font-bold        (Section titles)
H3: text-xl font-bold         (Card titles)
Body: text-base font-medium   (Content)
Small: text-sm                (Labels, meta)
```

### Spacing System
```
Padding:  p-4, p-6, p-8
Gap:      gap-4, gap-6
Rounded:  rounded-xl, rounded-2xl
Shadow:   shadow-sm, shadow-lg
```

---

## 🎬 Animation Effects

### Hover Animations
- **Cards**: Scale up (1.05) + shadow increase
- **Buttons**: Scale up (1.05) + gradient shift
- **Links**: Background change + scale up

### Entry Animations
- **Modal**: Slide up + fade in
- **Pages**: Fade in
- **Logo**: Float animation (infinite)

### Progress Bars
- **Fill**: Width transition (1s)
- **Shimmer**: Moving gradient overlay

---

## 📐 Layout Grid

### Dashboard Stats (3 columns)
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│   28     │ │    7     │ │ 12,450   │
│ Workouts │ │ Classes  │ │ Calories │
└──────────┘ └──────────┘ └──────────┘
```

### Classes Grid (3 columns on desktop)
```
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Class 1 │ │ Class 2 │ │ Class 3 │
└─────────┘ └─────────┘ └─────────┘
```

### Gyms Grid (3 columns on desktop)
```
┌────────┐ ┌────────┐ ┌────────┐
│ Gym 1  │ │ Gym 2  │ │ Gym 3  │
└────────┘ └────────┘ └────────┘
```

---

## 🎯 Interactive Elements

### Buttons
- **Primary**: Gradient blue-purple
- **Secondary**: Gray background
- **Danger**: Red gradient

### Forms
- **Input**: Rounded-xl, focus ring
- **Textarea**: Same styling
- **Select**: Dropdown with arrow

### Toggles (Profile Preferences)
- **ON**: Blue background
- **OFF**: Gray background
- **Animated**: Smooth slide transition

---

## 📱 Responsive Breakpoints

```
Mobile:  < 768px  (1 column)
Tablet:  768px+   (2 columns)
Desktop: 1024px+  (3 columns)
```

### Mobile Adjustments
- Grid: 1 column
- Sidebar: Full width or hidden
- Navbar: Stacked elements
- Cards: Full width

---

## ✨ Special Effects

### Progress Bars
```
[████████░░] 80%
   ↑ Shimmer animation
```

### Achievement Badges
```
Unlocked: 🎯✓  (Gold gradient)
Locked:   💎   (Grayscale)
```

### Quick Links
```
┌───────────┐
│    💪     │ ← Icon scales on hover
│ Workouts  │
│ Go to →   │ ← Arrow slides right
└───────────┘
```

---

## 🎊 Final Notes

- All pages use consistent design language
- Smooth transitions throughout
- Accessible color contrast
- Touch-friendly button sizes
- Loading states for forms
- Empty states for lists
- Error handling in forms

**Everything is polished and production-ready!** 🚀
