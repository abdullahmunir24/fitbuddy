/**
 * MemberTrainer.jsx
 * Page for members to find and request trainers
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';

const MemberTrainer = () => {
  const [myTrainer, setMyTrainer] = useState(null);
  const [availableTrainers, setAvailableTrainers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      const [trainerRes, trainersRes, requestsRes] = await Promise.all([
        fetch(`${apiUrl}/api/trainer-clients/my-trainer`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/api/trainer-clients/trainers`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/api/trainer-clients/my-requests`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const trainerData = await trainerRes.json();
      const trainersData = await trainersRes.json();
      const requestsData = await requestsRes.json();

      if (trainerData.success) {
        setMyTrainer(trainerData.data);
      }

      if (trainersData.success) {
        setAvailableTrainers(trainersData.data);
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

  const handleRequestTrainer = (trainer) => {
    setSelectedTrainer(trainer);
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/trainer-clients/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          trainer_id: selectedTrainer.id,
          message: message,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Trainer request sent successfully!');
        setIsModalOpen(false);
        setMessage('');
        setSelectedTrainer(null);
        await fetchData();
      } else {
        alert(data.message || 'Failed to send request');
      }
    } catch (error) {
      alert('Failed to send request');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Trainer</h1>
          <p className="text-gray-600 mt-1">Find and connect with a personal trainer</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        ) : (
          <>
            {/* Current Trainer Section */}
            {myTrainer ? (
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold backdrop-blur">
                      {myTrainer.trainer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{myTrainer.trainer_name}</h2>
                      <p className="text-blue-100 mb-2">{myTrainer.trainer_email}</p>
                      {myTrainer.bio && (
                        <p className="text-blue-50 text-sm max-w-2xl">{myTrainer.bio}</p>
                      )}
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur">
                          {myTrainer.total_classes} Classes
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur">
                          Connected since {new Date(myTrainer.accepted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">🏋️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Trainer Yet</h3>
                <p className="text-gray-600 mb-4">
                  Request a trainer below to get personalized guidance and support
                </p>
                {pendingRequests.length > 0 && (
                  <p className="text-blue-600 font-medium">
                    You have {pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Pending Requests ({pendingRequests.length})
                </h3>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                          {request.trainer_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{request.trainer_name}</p>
                          <p className="text-sm text-gray-600">Request sent {new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Waiting for response
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Trainers */}
            {!myTrainer && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Available Trainers</h3>
                
                {availableTrainers.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No trainers available at the moment</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableTrainers.map((trainer) => {
                      const hasPendingRequest = pendingRequests.some(r => r.trainer_id === trainer.id);
                      
                      return (
                        <div
                          key={trainer.id}
                          className="border rounded-xl p-5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {trainer.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{trainer.full_name}</h4>
                              <p className="text-sm text-gray-600">{trainer.email}</p>
                            </div>
                          </div>

                          {trainer.bio && (
                            <p className="text-sm text-gray-700 mb-4 line-clamp-2">{trainer.bio}</p>
                          )}

                          <div className="flex gap-2 text-xs text-gray-600 mb-4">
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {trainer.total_classes} classes
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {trainer.total_clients} clients
                            </span>
                          </div>

                          <button
                            onClick={() => handleRequestTrainer(trainer)}
                            disabled={hasPendingRequest}
                            className={`w-full py-2 rounded-lg font-medium transition-colors ${
                              hasPendingRequest
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {hasPendingRequest ? 'Request Pending' : 'Request Trainer'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Request Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setMessage('');
            setSelectedTrainer(null);
          }}
          title="Request Trainer"
        >
          {selectedTrainer && (
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedTrainer.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedTrainer.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedTrainer.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Introduce yourself or mention your fitness goals..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setMessage('');
                    setSelectedTrainer(null);
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
                >
                  Send Request
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default MemberTrainer;
