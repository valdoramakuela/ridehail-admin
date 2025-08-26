'use client';

import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch in Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchVerifications();
    }
  }, [mounted]);

  const fetchVerifications = async () => {
    if (!mounted) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://ridehail-backend.onrender.com/api/verification/all', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Extract verifications array safely
      let verificationsArray = [];
      
      if (data && data.success && Array.isArray(data.verifications)) {
        verificationsArray = data.verifications;
      } else if (Array.isArray(data)) {
        verificationsArray = data;
      }
      
      console.log('Processed verifications:', verificationsArray);
      setVerifications(verificationsArray);
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    if (!id || !mounted) return;
    
    try {
      const response = await fetch('https://ridehail-backend.onrender.com/api/verification/action', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result && result.success) {
        await fetchVerifications();
        alert(`Verification ${status} successfully!`);
      } else {
        throw new Error(result?.error || 'Action failed');
      }
      
    } catch (err) {
      console.error('Action error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // Don't render until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-gray-500">Initializing...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center border border-red-200">
          <div className="text-red-600 mb-4">
            <div className="w-12 h-12 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠</span>
            </div>
            <h3 className="text-lg font-semibold">Connection Error</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchVerifications}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            type="button"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Safe counting functions
  const totalCount = Array.isArray(verifications) ? verifications.length : 0;
  const pendingCount = Array.isArray(verifications) ? verifications.filter(v => v?.status === 'pending').length : 0;
  const approvedCount = Array.isArray(verifications) ? verifications.filter(v => v?.status === 'approved').length : 0;
  const rejectedCount = Array.isArray(verifications) ? verifications.filter(v => v?.status === 'rejected').length : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Verifications</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-lg">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-lg">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-lg">❌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Driver Verifications</h2>
        <button 
          onClick={fetchVerifications}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          type="button"
        >
          Refresh Data
        </button>
      </div>

      {/* Verifications List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          {!Array.isArray(verifications) ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">
                <span className="text-4xl">⚠</span>
                <h3 className="text-lg font-semibold mt-2">Data Format Error</h3>
                <p className="text-sm">Expected array, received: {typeof verifications}</p>
              </div>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 text-left max-w-md mx-auto overflow-auto">
                {JSON.stringify(verifications, null, 2)}
              </pre>
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Verifications</h3>
              <p className="text-gray-500">No driver verifications have been submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((verification, index) => {
                if (!verification || typeof verification !== 'object') {
                  return (
                    <div key={`invalid-${index}`} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <p className="text-red-600 text-sm">Invalid verification data at position {index}</p>
                    </div>
                  );
                }

                const verificationId = verification._id || verification.id || `temp-${index}`;

                return (
                  <div key={verificationId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                      {/* Driver Info */}
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500">👤</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {verification.fullName || 'Unknown Driver'}
                            </h3>
                            <div className="mt-1 space-y-1 text-sm text-gray-600">
                              {verification.userId && (
                                <p><span className="font-medium">Driver ID:</span> {verification.userId}</p>
                              )}
                              {verification.licenseNumber && (
                                <p><span className="font-medium">License:</span> {verification.licenseNumber}</p>
                              )}
                              {verification.vehicleModel && (
                                <p><span className="font-medium">Vehicle:</span> {verification.vehicleModel}</p>
                              )}
                              {verification.plateNumber && (
                                <p><span className="font-medium">Plate:</span> {verification.plateNumber}</p>
                              )}
                              {verification.createdAt && (
                                <p><span className="font-medium">Submitted:</span> {new Date(verification.createdAt).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          verification.status === 'approved' ? 'bg-green-100 text-green-800' :
                          verification.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          verification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {(verification.status || 'unknown').toUpperCase()}
                        </span>
                        
                        {verification.status === 'pending' && verification._id && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction(verification._id, 'rejected')}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                              type="button"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleAction(verification._id, 'approved')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                              type="button"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document Preview */}
                    {verification.idFront && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">ID Document:</p>
                        <img
                          src={verification.idFront}
                          alt="Driver ID Document"
                          className="h-20 w-auto rounded border border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'text-gray-500 text-sm italic';
                            errorDiv.textContent = 'Image failed to load';
                            e.target.parentNode.appendChild(errorDiv);
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Debug Section (only show if there are issues) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="bg-gray-100 rounded-lg p-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            🔧 Debug Information (Development Only)
          </summary>
          <div className="mt-2 text-xs space-y-1">
            <p><strong>Verifications Type:</strong> {Array.isArray(verifications) ? 'Array' : typeof verifications}</p>
            <p><strong>Verifications Length:</strong> {Array.isArray(verifications) ? verifications.length : 'N/A'}</p>
            <p><strong>Mounted State:</strong> {mounted ? 'true' : 'false'}</p>
            <p><strong>Loading State:</strong> {loading ? 'true' : 'false'}</p>
            <p><strong>Error State:</strong> {error || 'none'}</p>
            <div className="mt-2">
              <p><strong>Sample Data:</strong></p>
              <pre className="bg-white p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(verifications.slice(0, 1), null, 2)}
              </pre>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}

export default Dashboard;
