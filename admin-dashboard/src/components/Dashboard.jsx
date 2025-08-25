// src/components/Dashboard.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [verifications, setVerifications] = useState([]);

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/verification/pending`);
        setVerifications(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchVerifications();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Driver Verifications</h2>
      {verifications.length === 0 ? (
        <p>No pending verifications</p>
      ) : (
        verifications.map((v) => (
          <div key={v._id} className="border p-4 rounded-lg">
            <p><strong>{v.fullName}</strong> - {v.licenseNumber}</p>
            <img src={v.idFront?.trim()} alt="ID" className="w-full h-32 object-cover mt-2" />
          </div>
        ))
      )}
    </div>
  );
}