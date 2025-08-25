// app/page.js
import Dashboard from '../components/Dashboard';

export default function Home() {
  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">RideHail Admin</h1>
      <Dashboard />
    </main>
  );
}  
