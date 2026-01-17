import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A', '#81C784'];

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/overview`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const response = await axios.get(`${API}/export/batches/csv`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'herb_batches.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--surface-muted)'}}>
        <div className="text-center">
          <div className="loading mb-4" style={{width: '40px', height: '40px'}}></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--surface-muted)'}}>
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="mb-4" style={{color: 'var(--error)'}}>Analytics Unavailable</h2>
          <p className="mb-6" style={{color: 'var(--text-secondary)'}}>{error}</p>
          <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const herbData = Object.entries(analytics.herb_distribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const statusData = Object.entries(analytics.status_distribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
    value
  }));

  const eventsData = Object.entries(analytics.events_by_type).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: value
  }));

  const locationData = Object.entries(analytics.location_distribution).slice(0, 10).map(([name, value]) => ({
    name,
    batches: value
  }));

  return (
    <div className="min-h-screen" style={{background: 'var(--surface-muted)'}}>
      <div className="container section-padding">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="mb-2" style={{color: 'var(--primary)'}}>📊 Advanced Analytics</h1>
            <p style={{color: 'var(--text-secondary)'}}>
              Comprehensive insights into supply chain performance
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <button onClick={downloadCSV} className="btn btn-accent">
              📥 Export CSV
            </button>
            <Link to="/dashboard" className="btn btn-secondary">
              📊 Dashboard
            </Link>
            <Link to="/" className="btn btn-secondary">
              🏠 Home
            </Link>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-3xl mb-2">📦</div>
            <h3 className="text-3xl font-bold mb-1" style={{color: 'var(--primary)'}}>
              {analytics.overview.total_batches}
            </h3>
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Total Batches</p>
          </div>
          
          <div className="card text-center bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-3xl mb-2">⚖️</div>
            <h3 className="text-3xl font-bold mb-1" style={{color: 'var(--primary)'}}>
              {analytics.overview.total_quantity_kg}kg
            </h3>
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Total Herbs Tracked</p>
          </div>
          
          <div className="card text-center bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="text-3xl mb-2">⛓️</div>
            <h3 className="text-3xl font-bold mb-1" style={{color: 'var(--primary)'}}>
              {analytics.overview.total_blockchain_events}
            </h3>
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Blockchain Events</p>
          </div>
          
          <div className="card text-center bg-gradient-to-br from-amber-50 to-amber-100">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="text-3xl font-bold mb-1" style={{color: 'var(--primary)'}}>
              {analytics.overview.average_events_per_batch}
            </h3>
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Avg Events/Batch</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Herb Distribution Pie Chart */}
          <div className="card">
            <h3 className="mb-6" style={{color: 'var(--primary)'}}>Herb Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={herbData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {herbData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="card">
            <h3 className="mb-6" style={{color: 'var(--primary)'}}>Batch Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Events by Type Bar Chart */}
          <div className="card">
            <h3 className="mb-6" style={{color: 'var(--primary)'}}>Blockchain Events by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2E7D32" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Location Distribution */}
          <div className="card">
            <h3 className="mb-6" style={{color: 'var(--primary)'}}>Top Collection States</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="batches" fill="#43A047" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card mb-8">
          <h3 className="mb-6" style={{color: 'var(--primary)'}}>Monthly Batch Creation Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthly_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#2E7D32" 
                strokeWidth={2}
                name="Batches Created"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Statistics Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Herb Distribution Table */}
          <div className="card">
            <h4 className="mb-4" style={{color: 'var(--primary)'}}>Herb Distribution Details</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-2">Herb Type</th>
                    <th className="text-right py-2">Batches</th>
                    <th className="text-right py-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analytics.herb_distribution).map(([herb, count]) => (
                    <tr key={herb} className="border-b">
                      <td className="py-2 capitalize">{herb}</td>
                      <td className="text-right py-2">{count}</td>
                      <td className="text-right py-2">
                        {((count / analytics.overview.total_batches) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Events Statistics */}
          <div className="card">
            <h4 className="mb-4" style={{color: 'var(--primary)'}}>Supply Chain Events</h4>
            <div className="space-y-3">
              {Object.entries(analytics.events_by_type).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="capitalize font-medium">{type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold" style={{color: 'var(--primary)'}}>
                      {count}
                    </span>
                    <span className="text-sm text-gray-500">events</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="card mt-8">
          <h3 className="mb-6" style={{color: 'var(--primary)'}}>Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">✅</div>
              <h4 className="mb-2 font-bold">Supply Chain Transparency</h4>
              <p className="text-sm">
                100% of batches have blockchain-verified provenance with average {analytics.overview.average_events_per_batch} events per batch
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="mb-2 font-bold">Data Coverage</h4>
              <p className="text-sm">
                Tracking {analytics.overview.total_quantity_kg}kg of herbs across {Object.keys(analytics.location_distribution).length} different locations
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">⛓️</div>
              <h4 className="mb-2 font-bold">Blockchain Integrity</h4>
              <p className="text-sm">
                All {analytics.overview.total_blockchain_events} events verified with immutable hash-chaining
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
