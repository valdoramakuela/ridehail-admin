import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

function App() {
  const [verifications, setVerifications] = useState([]);
  const [rides, setRides] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io('https://ridehail-backend.onrender.com');
    setSocket(s);

    s.on('verificationUpdate', (data) => {
      alert(`Driver ${data.userId} verification ${data.status}`);
    });

    fetchVerifications();
    fetchRides();
  }, []);

  const fetchVerifications = async () => {
    const res = await axios.get('http://https://ridehail-backend.onrender.com/api/verification/pending');
    setVerifications(res.data);
  };

  const approve = async (id) => {
    await axios.post('http://https://ridehail-backend.onrender.com/api/verification/action', { id, status: 'approved' });
    fetchVerifications();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      <h2>Driver Verifications</h2>
      {verifications.map(v => (
        <div key={v._id} style={card}>
          <p><strong>{v.fullName}</strong> - {v.licenseNumber}</p>
          <img src={v.idFront} height="100" alt="ID" />
          <div>
            <button onClick={() => approve(v._id)}>Approve</button>
            <button onClick={() => approve(v._id, 'rejected')}>Reject</button>
          </div>
        </div>
      ))}

      <h2>Live Rides</h2>
      <p>Active Rides: {rides.length}</p>
    </div>
  );
}

const card = { border: '1px solid #ccc', margin: '10px 0', padding: 10, borderRadius: 8 };

export default App;