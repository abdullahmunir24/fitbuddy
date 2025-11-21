/**
 * TrainerCredits.jsx
 * Credits page showing team members and their contributions
 */

import DashboardLayout from '../../layouts/DashboardLayout';

const TrainerCredits = () => {
  const teamMembers = [
    {
      name: 'Raad Sarker',
      roles: [
        'Video Narrator',
        'Front End UI for Trainer Pages',
        'Docker Engineer'
      ]
    },
    {
      name: 'Haider Ali',
      roles: [
        'Front End UI for Member Pages',
        'Video Editor'
      ]
    },
    {
      name: 'Abdullah Munir',
      roles: [
        'Video Coordinator',
        'Backend Engineer',
        'Database Engineer'
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Credits</h1>
          <p className="text-gray-600 mt-2">Meet the team behind FitBuddy</p>
        </div>

        {/* Main Credits Section */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 text-white shadow-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">FitBuddy Development Team</h2>
            <p className="text-blue-100 text-lg">Built with passion and dedication</p>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                {/* Avatar Circle */}
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 border-4 border-white/30">
                  {member.name.charAt(0)}
                </div>

                {/* Name */}
                <h3 className="text-2xl font-bold text-center mb-4">{member.name}</h3>

                {/* Roles */}
                <div className="space-y-2">
                  {member.roles.map((role, roleIndex) => (
                    <div
                      key={roleIndex}
                      className="bg-white/10 rounded-lg px-4 py-2 text-center text-sm font-medium"
                    >
                      {role}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You</h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              This project represents the collaborative effort of our entire team. 
              Each member contributed their expertise to create a comprehensive fitness 
              management platform that serves both members and trainers.
            </p>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <h4 className="text-xl font-bold mb-2">Frontend</h4>
            <p className="text-blue-100">React + Vite</p>
            <p className="text-blue-100">Tailwind CSS</p>
            <p className="text-blue-100">React Router</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <h4 className="text-xl font-bold mb-2">Backend</h4>
            <p className="text-purple-100">Node.js + Express</p>
            <p className="text-purple-100">JWT Authentication</p>
            <p className="text-purple-100">RESTful API</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <h4 className="text-xl font-bold mb-2">Database</h4>
            <p className="text-green-100">PostgreSQL</p>
            <p className="text-green-100">Docker</p>
            <p className="text-green-100">Database Migrations</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-gray-500 text-sm">
          <p>© 2025 FitBuddy. All rights reserved.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerCredits;

