'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function VerificationList() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/verification/pending`);
      
      // Ensure we always have an array
      if (Array.isArray(res.data)) {
        setVerifications(res.data);
      } else {
        console.error('Expected array, got:', res.data);
        setVerifications([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/verification/action`, { id, status });
      fetchVerifications(); // Refresh
    } catch (err) {
      console.error('Action error:', err);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div className="space-y-4">
      {verifications.length === 0 ? (
        <p className="text-gray-500">No pending verifications</p>
      ) : (
        verifications.map((v) => (
          <div key={v._id} className="border p-4 rounded-lg bg-gray-50">
            <h3 className="font-medium">{v.fullName || 'Unknown'}</h3>
            <p className="text-sm text-gray-600">License: {v.licenseNumber || 'N/A'}</p>

            {/* Safe Image Rendering */}
            {v.idFront ? (
              <img
                src={v.idFront}
                alt="ID Document"
                className="w-full h-32 object-cover mt-2 rounded"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Failed';
                  e.onerror = null;
                }}
              />
            ) : (
              <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded mt-2">
                <span className="text-gray-500 text-sm">No ID image uploaded</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleAction(v._id, 'approved')}
                className="px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                disabled={!v._id}
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(v._id, 'rejected')}
                className="px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                disabled={!v._id}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
