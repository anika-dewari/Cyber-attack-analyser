import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import Footer from '../components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, fetchWithAuth } from '../config/api';

const COLORS = ['#00BFFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

const damageDescriptions = {
  'Port Scanner': 'Can reveal open ports and services, making the system vulnerable to targeted attacks.',
  'Clickjacking Detection': 'Tricks users into clicking something different from what they perceive.',
  'SQL Injection': 'Can access, modify, or delete database contents.',
  'XSS Attack': 'Injects malicious scripts into webpages viewed by other users.',
  'Malicious URL': 'Redirects users to phishing/malware websites.',
  'Vulnerability Lookup': 'Reveals known CVEs associated with your stack or software.',
};

// Helper function to normalize scan type names
const normalizeScanType = (type) => {
  const t = type.toLowerCase();
  if (t.includes('clickjacking')) return 'Clickjacking';
  if (t.includes('xss')) return 'XSS';
  if (t.includes('sql')) return 'SQL Injection';
  if (t.includes('port')) return 'Port Scanner';
  if (t.includes('malicious')) return 'Malicious URL';
  if (t.includes('cve')) return 'Vulnerability Lookup';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Helper function to calculate vulnerability rate based on scan type and results
const calculateVulnerabilityRate = (scanType, results) => {
  if (!results) return 0;
  const type = normalizeScanType(scanType);
  switch (type) {
    case 'Port Scanner':
      const openPorts = results.openPorts || [];
      return openPorts.length > 0 ? Math.min((openPorts.length / 10) * 100, 100) : 0;
    case 'Clickjacking':
      return results.vulnerable ? 75 : 0;
    case 'SQL Injection':
      return results.vulnerable ? 100 : 0;
    case 'XSS':
      return results.vulnerable ? 100 : 0;
    case 'Malicious URL':
      return results.is_malicious ? 100 : 0;
    case 'Vulnerability Lookup':
      return results.vulnerabilities?.length > 0 ? Math.min((results.vulnerabilities.length / 5) * 100, 100) : 0;
    default:
      return 0;
  }
};

// Helper function to format scan results for display
const formatScanResults = (scanType, results) => {
  if (!results) return 'No results available';
  const type = normalizeScanType(scanType);
  switch (type) {
    case 'Port Scanner':
      const openPorts = results.openPorts || [];
      return openPorts.length > 0 
        ? `Open ports found: ${openPorts.join(', ')}`
        : 'No open ports found';
    case 'Clickjacking':
      return results.vulnerable 
        ? 'Clickjacking vulnerability detected'
        : 'No clickjacking vulnerability detected';
    case 'SQL Injection':
      return results.vulnerable 
        ? 'SQL injection vulnerability detected'
        : 'No SQL injection vulnerability detected';
    case 'XSS':
      return results.vulnerable 
        ? 'XSS vulnerability detected'
        : 'No XSS vulnerability detected';
    case 'Malicious URL':
      return results.is_malicious 
        ? 'Malicious URL detected'
        : 'URL appears to be safe';
    case 'Vulnerability Lookup':
      return results.vulnerabilities?.length > 0 
        ? `Found ${results.vulnerabilities.length} vulnerabilities`
        : 'No vulnerabilities found';
    default:
      return JSON.stringify(results, null, 2);
  }
};

// Custom label for PieChart to avoid overlapping 0% labels
const renderPieLabel = ({ name, percent, value }) => {
  if (value === 0) return '';
  return `${name} (${(percent * 100).toFixed(0)}%)`;
};

// Helper: Filter radar data to only non-zero scan types
const getFilteredRadarData = (scanData) => {
  return scanData.filter(item => item.SuccessRate > 0).map(item => ({
    subject: item.attack,
    A: item.SuccessRate,
    fullMark: 100
  }));
};

export default function Report() {
  const [scanData, setScanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchScanData = async () => {
      try {
        const data = await fetchWithAuth(API_ENDPOINTS.SCAN_HISTORY);
        console.log('Fetched scan history:', data);
        
        // Group scans by type and get the latest one for each type
        const latestScans = data.reduce((acc, scan) => {
          const existingScan = acc.find(s => s.type === scan.type);
          if (!existingScan || new Date(scan.createdAt) > new Date(existingScan.createdAt)) {
            // Remove existing scan of same type if it exists
            acc = acc.filter(s => s.type !== scan.type);
            // Add the newer scan
            acc.push(scan);
          }
          return acc;
        }, []);

        // Transform the data for the charts
        const transformedData = latestScans.map(scan => ({
          attack: normalizeScanType(scan.type),
          SuccessRate: calculateVulnerabilityRate(scan.type, scan.result),
          details: scan.result || {},
          timestamp: new Date(scan.createdAt).toLocaleDateString(),
          severity: scan.result?.severity || 'Medium',
          target: scan.target,
          formattedResults: formatScanResults(scan.type, scan.result)
        }));
        setScanData(transformedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScanData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading scan results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  if (scanData.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="text-cyan-400 text-xl">No scan results available. Please perform a scan first.</div>
      </div>
    );
  }

  // Prepare data for pie chart
  const pieData = scanData.map(item => ({
    name: item.attack,
    value: item.SuccessRate
  }));

  // Prepare data for radar chart (filtered)
  const filteredRadarData = getFilteredRadarData(scanData);

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 w-full min-h-screen bg-gradient-to-tr from-cyan-600/20 via-teal-600/10 to-purple-700/20 animate-pulse blur-3xl pointer-events-none z-0" />

      <div className="h-full w-full flex flex-col py-10 px-10 bg-[#0B0B14]">
        <h1 className="text-4xl text-white font-bold mb-6">🛡 Vulnerability Report</h1>

        {/* Bar Chart */}
        <div className="bg-[#1A1D24] p-6 rounded-xl shadow-lg mb-10">
          <h2 className="text-2xl text-white font-semibold mb-4">📊 Attack Success Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scanData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="attack" stroke="#ccc" />
              <YAxis stroke="#ccc" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1D24',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => [`${value}%`, 'Vulnerability Rate']}
              />
              <Legend />
              <Bar dataKey="SuccessRate" fill="#00BFFF" name="Vulnerability Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-[#1A1D24] p-6 rounded-xl shadow-lg mb-10">
          <h2 className="text-2xl text-white font-semibold mb-4">🥧 Vulnerability Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderPieLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1D24',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => [`${value}%`, 'Vulnerability Rate']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="bg-[#1A1D24] p-6 rounded-xl shadow-lg mb-10">
          <h2 className="text-2xl text-white font-semibold mb-4">🎯 Attack Pattern Analysis</h2>
          {filteredRadarData.length < 3 ? (
            <div className="text-cyan-400 text-xl text-center py-16">
              Not enough data for pattern analysis. Run more types of scans to see attack patterns.
              {filteredRadarData.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg text-white mb-2">Summary:</h3>
                  {filteredRadarData.map((item, idx) => (
                    <div key={item.subject} className="text-cyan-300 text-lg">
                      {item.subject}: <span className="font-bold">{item.A}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={filteredRadarData}>
                <PolarGrid stroke="#444" />
                <PolarAngleAxis dataKey="subject" stroke="#ccc" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#ccc" />
                <Radar
                  name="Vulnerability Rate"
                  dataKey="A"
                  stroke="#00BFFF"
                  fill="#00BFFF"
                  fillOpacity={0.3}
                  label={({ cx, cy, payload, value }) => {
                    if (!payload || typeof payload.angleRad !== 'number') return null;
                    return (
                      <text x={cx + (Math.cos(payload.angleRad) * 120)} y={cy + (Math.sin(payload.angleRad) * 120)} fill="#00BFFF" fontSize={14} textAnchor="middle">{value}%</text>
                    );
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1D24',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`${value}%`, 'Vulnerability Rate']}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Detailed Results */}
        <div className="space-y-6">
          <h2 className="text-3xl text-white font-semibold">📝 Attack Breakdown</h2>
          {scanData.map((entry, idx) => (
            <div key={`${entry.attack}-${idx}`} className="bg-[#1a1d24] p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl text-white font-bold">
                    {entry.attack} - <span className="text-cyan-400">{entry.SuccessRate}%</span>
                  </h3>
                  <p className="text-gray-400 mt-1">Target: {entry.target}</p>
                  <p className="text-xl text-gray-300 mt-1">{damageDescriptions[entry.attack]}</p>
                </div>
                <span className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  entry.SuccessRate > 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                }`}>
                  {entry.SuccessRate > 0 ? 'Vulnerable' : 'Secure'}
                </span>
              </div>
              <div className="mt-4 bg-[#0f121a] p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Results:</h4>
                <p className="text-gray-300">{entry.formattedResults}</p>
                <h4 className="text-lg font-semibold text-cyan-400 mt-4 mb-2">Raw Data:</h4>
                <pre className="text-gray-300 overflow-auto">
                  {JSON.stringify(entry.details, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
}
