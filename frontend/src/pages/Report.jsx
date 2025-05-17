import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';

const mockData = [
  { attack: 'Port Scanner', SuccessRate: 70 },
  { attack: 'Clickjacking Detection', SuccessRate: 40 },
  { attack: 'SQL Injection', SuccessRate: 85 },
  { attack: 'XSS Attack', SuccessRate: 65 },
  { attack: 'Malicious URL', SuccessRate: 50 },
  { attack: 'Vulnerability Lookup', SuccessRate: 75 },
];

const damageDescriptions = {
  'Port Scanner': 'Can reveal open ports and services, making the system vulnerable to targeted attacks.',
  'Clickjacking Detection': 'Tricks users into clicking something different from what they perceive.',
  'SQL Injection': 'Can access, modify, or delete database contents.',
  'XSS Attack': 'Injects malicious scripts into webpages viewed by other users.',
  'Malicious URL': 'Redirects users to phishing/malware websites.',
  'Vulnerability Lookup': 'Reveals known CVEs associated with your stack or software.',
};

export default function Report() {
  return (
    <div className="min-h-screen">
<div className="fixed top-0 left-0 w-full min-h-screen bg-gradient-to-tr from-cyan-600/20 via-teal-600/10 to-purple-700/20 animate-pulse blur-3xl pointer-events-none z-0" />

      <Header/>

      <div className="h-full w-full flex flex-col py-10 px-10 bg-[#0B0B14]">
      <h1 className="text-4xl text-white font-bold mb-6">🛡 Vulnerability Report</h1>

      <div className="bg-[#1A1D24] p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-2xl text-white font-semibold mb-4">📊 Attack Success Rate</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData}>
            <XAxis dataKey="attack" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Bar dataKey="SuccessRate" fill="#00BFFF" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl text-white font-semibold">📝 Attack Breakdown</h2>
        {mockData.map((entry) => (
          <div key={entry.attack} className="bg-[#1a1d24] p-4 rounded-lg shadow-md">
            <h3 className="text-2xl text-white font-bold">
              {entry.attack} - <span className="text-cyan-400">{entry.SuccessRate}%</span>
            </h3>
            <p className="text-xl text-gray-300 mt-1">{damageDescriptions[entry.attack]}</p>
          </div>
        ))}
      </div>
    </div>
    <Footer/>
    </div>
  );
}
