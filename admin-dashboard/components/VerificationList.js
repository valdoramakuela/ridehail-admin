// components/VerificationList.js
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function VerificationList() {
  const [verifications, setVerifications] = useState([]);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/verification/pending`);
      setVerifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id, status) => {
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/verification/action`, { id, status });
    fetchVerifications();
  };

  return (
    <div className="space-y-4">
      {verifications.length === 0 ? (
        <p className="text-gray-500">No pending verifications</p>
      ) : (
        verifications.map((v) => (
          <div key={v._id} className="border p-4 rounded-lg bg-gray-50">
            <h3 className="font-medium">{v.fullName}</h3>
            <p className="text-sm text-gray-600">License: {v.licenseNumber}</p>
            <img src={v.idFront?.trim()} alt="ID" className="w-full h-32 object-cover mt-2 rounded" />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleAction(v._id, 'approved')}
                className="px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(v._id, 'rejected')}
                className="px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
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
