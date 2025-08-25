// components/Dashboard.js
'use client';
import { useEffect, useState } from 'react';
import VerificationList from './VerificationList';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

export default function Dashboard() {
  const [activeRides, setActiveRides] = useState([]);

  useEffect(() => {
    fetchActiveRides();
    socket.on('rideUpdate', (data) => setActiveRides(data.rides || []));
    socket.on('verificationUpdate', () => fetchVerifications());

    return () => {
      socket.off('rideUpdate');
      socket.off('verificationUpdate');
    };
  }, []);

  const fetchActiveRides = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/rides/active`);
      setActiveRides(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Driver Verifications</h2>
        <VerificationList />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Active Rides ({activeRides.length})</h2>
        <ul className="space-y-3">
          {activeRides.length === 0 ? (
            <li className="text-gray-500">No active rides</li>
          ) : (
            activeRides.map((ride) => (
              <li key={ride.id} className="p-3 border rounded-lg">
                <p><strong>{ride.rider}</strong> → {ride.to}</p>
                <p className="text-sm text-gray-500">Driver: {ride.driver || 'Unassigned'}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}  
