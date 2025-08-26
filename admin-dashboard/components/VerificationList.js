'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function VerificationList() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [imageModal, setImageModal] = useState({ show: false, src: '', title: '' });

  // Make sure your .env.local has: NEXT_PUBLIC_API_URL=https://ridehail-backend.onrender.com
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ridehail-backend.onrender.com';

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      // Updated to match your backend route structure
      const res = await axios.get(`${API_BASE}/api/verification/all`);
      
      // Handle different response structures
      const data = res.data.verifications || res.data || [];
      setVerifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      // Use the backend route structure
      await axios.post(`${API_BASE}/api/verification/action`, { 
        id, 
        status 
      });
      
      // Refresh the list
      await fetchVerifications();
      
      // Close modal if open
      setSelectedVerification(null);
    } catch (err) {
      console.error('Action error:', err);
      alert('Error updating verification status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImageUrl = (filename) => {
    if (!filename) return null;
    // Handle both relative and full URLs
    if (filename.startsWith('http')) return filename;
    return `${API_BASE}/uploads/${filename}`;
  };

  const openImageModal = (filename, title) => {
    const imageUrl = getImageUrl(filename);
    if (imageUrl) {
      setImageModal({ show: true, src: imageUrl, title });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading verifications...</span>
      </div>
    );
  }

  if (verifications.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-400 mb-2">📄</div>
        <p className="text-gray-500">No verifications found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total</h3>
          <p className="text-2xl font-bold text-gray-900">{verifications.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {verifications.filter(v => v.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Approved</h3>
          <p className="text-2xl font-bold text-green-600">
            {verifications.filter(v => v.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
          <p className="text-2xl font-bold text-red-600">
            {verifications.filter(v => v.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Verifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {verifications.map((verification) => (
          <div key={verification._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{verification.fullName}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(verification.status)}`}>
                  {verification.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">ID: {verification.userId}</p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600">License: {verification.licenseNumber}</p>
                <p className="text-sm text-gray-600">Vehicle: {verification.vehicleModel}</p>
                <p className="text-sm text-gray-600">Plate: {verification.plateNumber}</p>
              </div>

              {/* Preview Image */}
              {verification.profileImage && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(verification.profileImage)}
                    alt="Profile"
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                    onClick={() => openImageModal(verification.profileImage, 'Profile Image')}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iMTIiIHk9IjEyIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  onClick={() => setSelectedVerification(verification)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </button>
                
                {verification.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(verification._id, 'rejected')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(verification._id, 'approved')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Verification Details</h2>
              <button
                onClick={() => setSelectedVerification(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Driver Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900">{selectedVerification.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="text-gray-900">{selectedVerification.userId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <p className="text-gray-900">{selectedVerification.licenseNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Model</label>
                  <p className="text-gray-900">{selectedVerification.vehicleModel}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plate Number</label>
                  <p className="text-gray-900">{selectedVerification.plateNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedVerification.status)}`}>
                    {selectedVerification.status}
                  </span>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: 'idFront', label: 'ID Front' },
                    { key: 'licenseFront', label: 'License Front' },
                    { key: 'licenseBack', label: 'License Back' },
                    { key: 'vehicleRegistration', label: 'Vehicle Registration' },
                    { key: 'profileImage', label: 'Profile Image' }
                  ].map(({ key, label }) => {
                    const filename = selectedVerification[key];
                    return (
                      <div key={key} className="text-center">
                        {filename ? (
                          <div
                            onClick={() => openImageModal(filename, label)}
                            className="cursor-pointer group"
                          >
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                              <img
                                src={getImageUrl(filename)}
                                alt={label}
                                className="w-full h-full object-cover group-hover:opacity-80"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iMTIiIHk9IjEyIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RXJyb3I8L3RleHQ+PC9zdmc+';
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 group-hover:text-gray-800">{label}</span>
                          </div>
                        ) : (
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              {selectedVerification.status === 'pending' && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleAction(selectedVerification._id, 'rejected')}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(selectedVerification._id, 'approved')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModal.show && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" 
          onClick={() => setImageModal({ show: false, src: '', title: '' })}
        >
          <div className="max-w-4xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{imageModal.title}</h3>
                <button 
                  onClick={() => setImageModal({ show: false, src: '', title: '' })}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <img 
                src={imageModal.src} 
                alt={imageModal.title}
                className="max-w-full max-h-96 object-contain mx-auto rounded"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iMTIiIHk9IjEyIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
