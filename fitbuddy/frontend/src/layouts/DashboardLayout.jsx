/**
 * DashboardLayout.jsx
 * Shared layout wrapper for all member dashboard pages
 */

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Navbar />
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
