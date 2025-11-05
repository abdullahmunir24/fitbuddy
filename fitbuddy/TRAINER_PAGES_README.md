# Trainer Pages Documentation

## Overview

The FitBuddy application now includes a complete set of trainer-specific pages with professional UI components. Trainers have their own dashboard and management tools separate from member pages.

## Trainer Pages

### 1. Trainer Dashboard (`/trainer/dashboard`)
**Purpose**: Main overview page for trainers

**Features**:
- Welcome banner with daily class count
- Statistics cards (Active Clients, Classes This Week, Average Rating, Upcoming Classes)
- Quick links to main sections
- Upcoming classes list with participant count and capacity
- Recent activity feed
- Performance summary

**Key Data Displayed**:
- Active client count: 42
- Classes this week: 18
- Average rating: 4.8/5.0
- Upcoming classes with time slots and participant numbers

---

### 2. My Classes (`/trainer/classes`)
**Purpose**: Manage fitness classes and schedules

**Features**:
- Create new class modal with full form
- Statistics overview (Total Classes, Active Classes, Total Enrolled, Total Capacity)
- Comprehensive classes table with:
  - Class name and type
  - Schedule information
  - Duration
  - Enrollment progress bar
  - Status badges (Full/Available)
  - Action buttons (View, Edit)
- Class type options: Yoga, HIIT, Cycling, Strength, Pilates, Boxing, Dance

**Key Functionality**:
- Add new classes
- View enrollment status
- Manage class capacity
- Edit class details

---

### 3. Clients (`/trainer/clients`)
**Purpose**: View and manage assigned clients

**Features**:
- Client statistics (Total Clients, Active Clients, Total Sessions, Average Progress)
- Filter tabs (All Clients / Active)
- Client cards with:
  - Client name and email
  - Fitness goal badge
  - Sessions completed
  - Last session timestamp
  - Progress bar
  - Member since date
  - Action buttons (View Details, Message)

**Sample Clients**:
- Sarah Johnson - Weight Loss (24 sessions, 75% progress)
- Mike Chen - Muscle Gain (18 sessions, 60% progress)
- Emma Davis - General Fitness (45 sessions, 90% progress)
- James Wilson - Strength Training (12 sessions, 45% progress)
- Lisa Anderson - Endurance (32 sessions, 80% progress)

---

### 4. Schedule (`/trainer/schedule`)
**Purpose**: View and manage teaching schedule

**Features**:
- Weekly overview statistics
- Day selector with class counts
- Detailed schedule view for selected day
- Each class session shows:
  - Time slot
  - Class name
  - Duration
  - Number of participants
  - Room location
  - View Roster button

**Schedule Information**:
- 15 classes scheduled across the week
- Busiest day indicator
- Total teaching hours
- Average attendance rate (92%)

**Day-by-Day Breakdown**:
- Monday: 2 classes
- Tuesday: 2 classes
- Wednesday: 3 classes
- Thursday: 2 classes
- Friday: 3 classes
- Saturday: 2 classes
- Sunday: 1 class

---

### 5. Trainer Profile (`/trainer/profile`)
**Purpose**: Professional trainer profile management

**Features**:
- Profile header with avatar and cover image
- Contact information (Email, Phone, Location, Hourly Rate)
- Professional bio section
- Specializations badges (HIIT, Strength Training, Yoga, Nutrition)
- Certifications display (NASM-CPT, ACE Group Fitness, Yoga Alliance RYT-200)
- Career statistics grid:
  - Active Clients: 42
  - Classes Taught: 156
  - Years Experience: 8
  - Average Rating: 4.8
- Client reviews section with star ratings
- Edit profile modal

**Professional Details**:
- Hourly Rate: $75/hour
- Years of Experience: 8
- Certifications: Multiple professional certifications
- Client Reviews: 5-star ratings with detailed feedback

---

## Role-Based Navigation

### Sidebar Navigation
The sidebar automatically adapts based on user role:

**Member Navigation**:
- Dashboard
- Workouts
- Classes
- Progress
- Gyms
- Profile

**Trainer Navigation**:
- Dashboard
- My Classes
- Clients
- Schedule
- Profile

### Login Flow
- Users log in with email and password
- Backend returns user role (member/trainer)
- System redirects to appropriate dashboard:
  - Members → `/member/dashboard`
  - Trainers → `/trainer/dashboard`

---

## Design Philosophy

All trainer pages follow these principles:
1. **No Emojis**: Professional, clean interface
2. **Consistent Styling**: Gradient cards, rounded corners, hover effects
3. **Information Hierarchy**: Important data prominently displayed
4. **Responsive Design**: Works on all screen sizes
5. **Interactive Elements**: Smooth transitions and hover states
6. **Clear Data Visualization**: Progress bars, status badges, color coding

---

## Technical Implementation

### File Structure
```
frontend/src/pages/trainer/
├── TrainerDashboard.jsx
├── TrainerClasses.jsx
├── TrainerClients.jsx
├── TrainerSchedule.jsx
└── TrainerProfile.jsx
```

### Routes
All trainer routes are prefixed with `/trainer/`:
- `/trainer/dashboard`
- `/trainer/classes`
- `/trainer/clients`
- `/trainer/schedule`
- `/trainer/profile`

### Context Integration
- Uses `RoleContext` for role management
- Sidebar adapts navigation based on role
- Navbar displays user role
- Login redirects based on role

---

## Testing the Trainer Pages

### To Access Trainer Pages:
1. The user's role in the database should be set to 'trainer'
2. Login with trainer credentials
3. System will automatically redirect to trainer dashboard
4. All navigation will show trainer-specific pages

### Manual Testing:
You can temporarily test by manually changing the role in `RoleContext.jsx`:
```javascript
const [role, setRole] = useState('trainer'); // Change from 'member' to 'trainer'
```

Or navigate directly to trainer routes after setting role.

---

## Future Enhancements

Potential additions for trainer pages:
1. Connect to backend API for real data
2. Add calendar integration for schedule
3. Implement messaging system with clients
4. Add class session notes and feedback
5. Client progress tracking with charts
6. Revenue/earnings dashboard
7. Availability management
8. Automated class reminders
9. Client attendance tracking
10. Performance analytics and reports

---

## Notes

- All pages are currently front-end only (no backend integration)
- Data is mock/sample data for demonstration
- Forms are functional but don't persist data
- Ready for backend API integration
- All components use existing shared components (Modal, Card, DashboardLayout)

