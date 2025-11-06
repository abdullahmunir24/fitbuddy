# Testing Trainer Pages - Quick Guide

## How to Test Trainer Pages

Since the trainer pages are now complete, here's how to test them:

### Method 1: Temporary Role Change (Quickest)

1. Open `fitbuddy/frontend/src/context/RoleContext.jsx`
2. Find line 22: `const [role, setRole] = useState('member');`
3. Change it to: `const [role, setRole] = useState('trainer');`
4. Save the file
5. Navigate to `http://localhost:3000/trainer/dashboard`

The sidebar will now show trainer navigation and all trainer pages will be accessible.

### Method 2: Database User with Trainer Role

1. Create or update a user in the database with role='trainer'
2. Login with that user's credentials
3. The system will automatically redirect to `/trainer/dashboard`

Example SQL to update existing user:
```sql
UPDATE users SET role = 'trainer' WHERE email = 'raad.sask@gmail.com';
```

### Method 3: Direct URL Navigation

After logging in (with any role), you can manually navigate to:
- `http://localhost:3000/trainer/dashboard`
- `http://localhost:3000/trainer/classes`
- `http://localhost:3000/trainer/clients`
- `http://localhost:3000/trainer/schedule`
- `http://localhost:3000/trainer/profile`

Note: The sidebar won't update unless role is set properly.

---

## Trainer Pages to Test

### 1. Dashboard (`/trainer/dashboard`)
Check:
- [ ] Stats cards show correct numbers
- [ ] Quick links navigate properly
- [ ] Upcoming classes display correctly
- [ ] Recent activity feed is visible
- [ ] Performance banner shows

### 2. My Classes (`/trainer/classes`)
Check:
- [ ] Stats overview displays
- [ ] Classes table shows all classes
- [ ] "Create New Class" button opens modal
- [ ] Form fields work properly
- [ ] Can submit new class (adds to list)
- [ ] Progress bars display enrollment
- [ ] Status badges show correct colors

### 3. Clients (`/trainer/clients`)
Check:
- [ ] Client statistics display
- [ ] Filter tabs work (All/Active)
- [ ] Client cards show all information
- [ ] Progress bars display correctly
- [ ] Action buttons are clickable
- [ ] Hover effects work

### 4. Schedule (`/trainer/schedule`)
Check:
- [ ] Weekly stats display
- [ ] Day selector tabs work
- [ ] Clicking day updates schedule view
- [ ] Class details show properly
- [ ] Empty days show "No Classes" message
- [ ] View Roster button is visible

### 5. Profile (`/trainer/profile`)
Check:
- [ ] Profile header displays
- [ ] Contact information shows
- [ ] Specializations badges display
- [ ] Certifications show
- [ ] Stats grid displays correctly
- [ ] Client reviews section shows
- [ ] "Edit Profile" button opens modal
- [ ] Form in modal works

---

## Visual Testing Checklist

Check that all pages have:
- [ ] No emojis anywhere
- [ ] Consistent gradient colors (blue to purple)
- [ ] Smooth hover effects on cards
- [ ] Responsive layout (test on different screen sizes)
- [ ] Professional appearance
- [ ] Clean typography
- [ ] Proper spacing between elements
- [ ] Shadow effects on cards
- [ ] Rounded corners on all components

---

## Navigation Testing

1. Click on FitBuddy logo → Should go to trainer dashboard
2. Click each sidebar item → Should navigate to correct page
3. Click "Logout" → Should logout and return to login page
4. Check that active page is highlighted in sidebar
5. Verify quick links on dashboard work
6. Test back button behavior

---

## Switching Between Roles

To switch from Trainer to Member:
1. In `RoleContext.jsx`, change role back to `'member'`
2. Navigate to `http://localhost:3000/member/dashboard`
3. Sidebar will show member navigation

To switch from Member to Trainer:
1. In `RoleContext.jsx`, change role to `'trainer'`
2. Navigate to `http://localhost:3000/trainer/dashboard`
3. Sidebar will show trainer navigation

---

## Known Behaviors (Expected)

- Data is mock/sample data (not from backend)
- Forms don't persist to database (front-end only)
- Action buttons (Edit, View Details, etc.) don't do anything yet
- All pages use DashboardLayout with role-based sidebar
- Navbar shows role as "Trainer" when role is set
- Progress bars and stats are hardcoded sample data

---

## Browser Console

No errors should appear in the console. If you see errors, check:
- All imports are correct
- File paths are valid
- Components are properly exported

---

## Quick Test Script

1. Set role to 'trainer' in RoleContext
2. Visit each page in order:
   - Dashboard
   - My Classes
   - Clients
   - Schedule
   - Profile
3. Try opening modals (Create Class, Edit Profile)
4. Click various buttons and links
5. Test sidebar navigation
6. Switch role to 'member'
7. Verify member pages still work
8. Switch back to 'trainer'

---

## What Success Looks Like

- All 5 trainer pages load without errors
- Navigation works smoothly
- Sidebar shows trainer-specific items
- All data displays correctly
- No emojis anywhere
- Professional, clean appearance
- Modals open and close properly
- Forms are functional (even if not saving)
- Hover effects and transitions work
- Responsive on mobile/tablet/desktop

---

## Reporting Issues

If you find issues:
1. Note which page has the issue
2. Describe what you expected vs what happened
3. Check browser console for errors
4. Verify you're using the trainer role
5. Make sure you're on the correct URL

