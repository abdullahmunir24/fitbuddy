/**
 * TrainerClients.jsx
 * Page for trainers to view and manage their clients
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const TrainerClients = () => {
  const [clients, setClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clients');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      const [clientsRes, requestsRes] = await Promise.all([
        fetch(`${apiUrl}/api/trainer-clients/clients`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/api/trainer-clients/requests`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const clientsData = await clientsRes.json();
      const requestsData = await requestsRes.json();

      if (clientsData.success) {
        setClients(clientsData.data);
      }

      if (requestsData.success) {
        setPendingRequests(requestsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/trainer-clients/accept/${requestId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();
      if (data.success) {
        alert('Client request accepted!');
        await fetchData();
      } else {
        alert(data.message || 'Failed to accept request');
      }
    } catch (error) {
      alert('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!confirm('Reject this client request?')) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/trainer-clients/reject/${requestId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();
      if (data.success) {
        alert('Request rejected');
        await fetchData();
      } else {
        alert(data.message || 'Failed to reject request');
      }
    } catch (error) {
      alert('Failed to reject request');
    }
  };

  const handleRemoveClient = async (relationshipId) => {
    if (!confirm('Remove this client? They will need to send a new request to become your client again.')) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/trainer-clients/${relationshipId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();
      if (data.success) {
        alert('Client removed');
        await fetchData();
      } else {
        alert(data.message || 'Failed to remove client');
      }
    } catch (error) {
      alert('Failed to remove client');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const totalClients = clients.length;
  const totalBookings = clients.reduce((sum, c) => sum + parseInt(c.total_bookings || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Clients</h1>
          <p className="text-gray-600 mt-1">Track and manage your client relationships</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{totalClients}</div>
            <div className="text-blue-100">Total Clients</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{totalBookings}</div>
            <div className="text-green-100">Total Bookings</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{pendingRequests.length}</div>
            <div className="text-purple-100">Pending Requests</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'clients'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Clients ({totalClients})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'requests'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending Requests ({pendingRequests.length})
              {pendingRequests.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading...</div>
            ) : activeTab === 'clients' ? (
              clients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                  <p className="text-gray-600">
                    When members request you as their trainer and you accept, they'll appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <div
                      key={client.member_id}
                      className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {client.member_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{client.member_name}</h3>
                            <p className="text-sm text-gray-500">{client.member_email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Client Since:</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(client.accepted_at)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Bookings:</span>
                          <span className="font-medium text-gray-900">{client.total_bookings || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Recent (30d):</span>
                          <span className="font-medium text-gray-900">{client.recent_bookings || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Booking:</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(client.last_booking_date)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveClient(client.relationship_id)}
                        className="w-full py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Remove Client
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">📬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-600">You'll see new client requests here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {request.member_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{request.member_name}</h3>
                          <p className="text-sm text-gray-600">{request.member_email}</p>
                          {request.message && (
                            <p className="text-sm text-gray-700 mt-2 italic">"{request.message}"</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Requested {formatDate(request.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerClients;
