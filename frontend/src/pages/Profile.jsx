import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, fetchWithAuth } from '../config/api';

export default function Profile() {
  const { user } = useAuth();
  const [scanCount, setScanCount] = useState(0);
  const [lastScanDate, setLastScanDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScanHistory = async () => {
      try {
        const data = await fetchWithAuth(API_ENDPOINTS.SCAN_HISTORY);
        setScanCount(data.length);
        if (data.length > 0) {
          // Assuming scans are sorted by createdAt descending
          setLastScanDate(new Date(data[0].createdAt));
        }
      } catch (err) {
        setError('Failed to load scan history');
      } finally {
        setLoading(false);
      }
    };
    fetchScanHistory();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-cyan-400 text-xl">Loading profile...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-400 text-xl">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0B14] flex flex-col items-center pt-20 px-4">
      <div className="bg-[#1A1D24] rounded-xl shadow-lg p-8 flex flex-col items-center w-full max-w-md">
        <img
          src={user?.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.user?.email || user?.email || 'User') + '&background=0D8ABC&color=fff&size=128'}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-cyan-400 mb-4"
        />
        <h1 className="text-3xl font-bold text-white mb-2">{user?.user?.name || user?.name || 'User'}</h1>
        <p className="text-lg text-cyan-400 mb-4">{user?.user?.email || user?.email}</p>
        <div className="w-full flex flex-row items-center justify-center gap-6 mt-4">
          <div className="flex flex-col items-center bg-[#23263a] rounded-lg px-8 py-4 shadow">
            <span className="text-xl text-gray-300">Total Scans</span>
            <span className="text-4xl font-extrabold text-cyan-400 mt-1">{scanCount}</span>
          </div>
          <div className="flex flex-col items-center bg-[#23263a] rounded-lg px-8 py-4 shadow">
            <span className="text-xl text-gray-300">Last Scan</span>
            <span className="text-2xl font-bold text-cyan-400 mt-1">{lastScanDate ? lastScanDate.toLocaleString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 