import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ScanPage = () => {
  const { batchId } = useParams();
  const [loading, setLoading] = useState(true);
  const [provenance, setProvenance] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (batchId === 'demo') {
      // Load demo data for QR scan demonstration
      setProvenance({
        batch: {
          id: 'demo-batch-001',
          batch_number: 'BATCH-20240315-ASHWA001',
          herb_type: 'ashwagandha',
          total_quantity_kg: 25.5,
          origin_location: {
            latitude: 15.3173,
            longitude: 75.7139,
            district: 'Ballari',
            state: 'Karnataka'
          },
          current_status: 'tested',
          created_date: '2024-03-15T08:30:00Z'
        },
        provenance_chain: [
          {
            id: '1',
            event_type: 'collection',
            timestamp: '2024-03-15T08:30:00Z',
            block_number: 1,
            hash: 'a1b2c3d4e5f6789',
            event_data: {
              collector_name: 'Ramesh Kumar',
              weather_conditions: 'sunny',
              soil_type: 'loamy',
              harvesting_method: 'hand-picked'
            }
          },
          {
            id: '2',
            event_type: 'processing',
            timestamp: '2024-03-16T10:15:00Z',
            block_number: 2,
            hash: 'b2c3d4e5f6789a1',
            event_data: {
              processing_type: 'drying',
              processor_name: 'Ayurveda Processing Unit',
              temperature: 60,
              duration_hours: 24
            }
          },
          {
            id: '3',
            event_type: 'testing',
            timestamp: '2024-03-18T14:20:00Z',
            block_number: 3,
            hash: 'c3d4e5f6789a1b2',
            event_data: {
              lab_name: 'Ayurveda Quality Control Lab',
              overall_grade: 'A',
              test_results: [
                { test_type: 'Moisture Content', result_value: '8.2', unit: '%', pass_status: true },
                { test_type: 'Heavy Metals (Lead)', result_value: '2.1', unit: 'ppm', pass_status: true },
                { test_type: 'Active Compound', result_value: '2.8', unit: '%', pass_status: true }
              ]
            }
          }
        ],
        chain_verified: true,
        total_events: 3
      });
      setLoading(false);
    } else {
      fetchProvenance();
    }
  }, [batchId]);

  const fetchProvenance = async () => {
    try {
      const response = await axios.get(`${API}/batch/${batchId}/provenance`);
      setProvenance(response.data);
    } catch (error) {
      console.error('Error fetching provenance:', error);
      setError('Batch not found or invalid QR code');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventIcon = (eventType) => {
    const icons = {
      collection: '🌱',
      processing: '⚙️',
      testing: '🧪',
      packaging: '📦',
      distribution: '🚚'
    };
    return icons[eventType] || '📋';
  };

  const getStatusColor = (status) => {
    return status ? 'badge-success' : 'badge-error';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--surface-muted)'}}>
        <div className="text-center">
          <div className="loading mb-4" style={{width: '40px', height: '40px'}}></div>
          <p>Loading provenance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--surface-muted)'}}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="mb-4" style={{color: 'var(--error)'}}>Invalid QR Code</h2>
          <p className="mb-6" style={{color: 'var(--text-secondary)'}}>{error}</p>
          <Link to="/" className="btn btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--surface-muted)'}}>
      <div className="container section-padding">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="mb-4" style={{color: 'var(--primary)'}}>Herb Provenance Verified</h1>
          <p className="text-lg mb-6" style={{color: 'var(--text-secondary)'}}>
            Complete blockchain-verified journey from farm to your hands
          </p>
          {provenance.chain_verified && (
            <div className="badge badge-success text-lg px-4 py-2" data-testid="verification-badge">
              🔒 Blockchain Verified • {provenance.total_events} Events
            </div>
          )}
        </div>

        {/* Batch Overview */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="mb-4" style={{color: 'var(--primary)'}}>Batch Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3" data-testid="batch-number">
                    <span className="font-medium">Batch Number:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {provenance.batch.batch_number}
                    </span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="herb-type">
                    <span className="font-medium">Herb:</span>
                    <span className="capitalize">{provenance.batch.herb_type}</span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="quantity">
                    <span className="font-medium">Quantity:</span>
                    <span>{provenance.batch.total_quantity_kg} kg</span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="collection-date">
                    <span className="font-medium">Collection Date:</span>
                    <span>{formatDate(provenance.batch.created_date)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="mb-4" style={{color: 'var(--primary)'}}>Origin Location</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2" data-testid="location-coords">
                    <span className="text-sm">📍</span>
                    <span className="text-sm">
                      {provenance.batch.origin_location.latitude.toFixed(6)}, {provenance.batch.origin_location.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="text-sm" data-testid="location-address">
                    {provenance.batch.origin_location.district}, {provenance.batch.origin_location.state}
                  </div>
                </div>
                
                {/* Interactive Map Placeholder */}
                <div className="mt-4 p-6 rounded-lg bg-gray-100 text-center" data-testid="map-placeholder">
                  <div className="text-2xl mb-2">🗺️</div>
                  <p className="text-sm text-gray-600">Interactive Map</p>
                  <p className="text-xs text-gray-500">GPS: {provenance.batch.origin_location.latitude.toFixed(4)}°N, {provenance.batch.origin_location.longitude.toFixed(4)}°E</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto">
          <div className="flex border-b border-gray-200 mb-8">
            {[
              { id: 'overview', label: 'Journey Overview', icon: '🛤️' },
              { id: 'tests', label: 'Quality Tests', icon: '🧪' },
              { id: 'blockchain', label: 'Blockchain Trail', icon: '⛓️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-green-500 text-green-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Journey Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6" data-testid="journey-overview">
              {provenance.provenance_chain.map((event, index) => (
                <div key={event.id} className="card">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                        {getEventIcon(event.event_type)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium capitalize" style={{color: 'var(--primary)'}}>
                          {event.event_type} Event
                        </h4>
                        <div className="badge badge-success">Block #{event.block_number}</div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3" data-testid={`event-timestamp-${index}`}>
                        {formatDate(event.timestamp)}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {Object.entries(event.event_data).map(([key, value]) => {
                          if (key === 'test_results') return null;
                          return (
                            <div key={key} className="flex gap-2">
                              <span className="font-medium capitalize">
                                {key.replace(/_/g, ' ')}:
                              </span>
                              <span>{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className="text-xs text-gray-400 font-mono" data-testid={`event-hash-${index}`}>
                        #{event.hash.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quality Tests Tab */}
          {activeTab === 'tests' && (
            <div className="space-y-6" data-testid="quality-tests">
              {provenance.provenance_chain
                .filter(event => event.event_type === 'testing')
                .map((event, eventIndex) => (
                  <div key={event.id} className="card">
                    <h4 className="mb-4" style={{color: 'var(--primary)'}}>
                      Lab Test Results - {event.event_data.lab_name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <span className="font-medium">Overall Grade:</span>
                        <span className={`ml-2 badge ${event.event_data.overall_grade === 'A' ? 'badge-success' : 'badge-warning'}`}>
                          Grade {event.event_data.overall_grade}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Test Date:</span>
                        <span className="ml-2">{formatDate(event.timestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" data-testid={`test-results-table-${eventIndex}`}>
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2">Test Parameter</th>
                            <th className="text-left py-2">Result</th>
                            <th className="text-left py-2">Unit</th>
                            <th className="text-left py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {event.event_data.test_results?.map((test, testIndex) => (
                            <tr key={testIndex} className="border-b border-gray-100">
                              <td className="py-2">{test.test_type}</td>
                              <td className="py-2 font-mono">{test.result_value}</td>
                              <td className="py-2">{test.unit}</td>
                              <td className="py-2">
                                <span className={`badge ${getStatusColor(test.pass_status)}`}>
                                  {test.pass_status ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                
              {provenance.provenance_chain.filter(event => event.event_type === 'testing').length === 0 && (
                <div className="card text-center py-8">
                  <div className="text-4xl mb-4">🧪</div>
                  <p style={{color: 'var(--text-secondary)'}}>No test results recorded yet</p>
                </div>
              )}
            </div>
          )}

          {/* Blockchain Trail Tab */}
          {activeTab === 'blockchain' && (
            <div className="space-y-6" data-testid="blockchain-trail">
              <div className="card">
                <h4 className="mb-4" style={{color: 'var(--primary)'}}>Blockchain Hash Chain</h4>
                <div className="space-y-4">
                  {provenance.provenance_chain.map((event, index) => (
                    <div key={event.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Block #:</span>
                          <span className="ml-2">{event.block_number}</span>
                        </div>
                        <div>
                          <span className="font-medium">Event Type:</span>
                          <span className="ml-2 capitalize">{event.event_type}</span>
                        </div>
                        <div>
                          <span className="font-medium">Timestamp:</span>
                          <span className="ml-2">{formatDate(event.timestamp)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="text-xs">
                          <span className="font-medium">Current Hash:</span>
                          <code className="ml-2 bg-gray-100 px-2 py-1 rounded" data-testid={`current-hash-${index}`}>
                            {event.hash}
                          </code>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Previous Hash:</span>
                          <code className="ml-2 bg-gray-100 px-2 py-1 rounded" data-testid={`previous-hash-${index}`}>
                            {event.previous_hash}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card">
                <h4 className="mb-4" style={{color: 'var(--primary)'}}>Chain Verification</h4>
                <div className="flex items-center gap-3">
                  <div className={`badge ${provenance.chain_verified ? 'badge-success' : 'badge-error'}`}>
                    {provenance.chain_verified ? '✅ Verified' : '❌ Compromised'}
                  </div>
                  <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
                    {provenance.chain_verified 
                      ? 'All hash links verified. Chain integrity intact.'
                      : 'Hash chain broken. Possible tampering detected.'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard" className="btn btn-primary" data-testid="view-more-batches-btn">
            📊 View More Batches
          </Link>
          <Link to="/" className="btn btn-secondary" data-testid="return-home-btn">
            🏠 Return Home
          </Link>
          {batchId === 'demo' && (
            <Link to="/collect" className="btn btn-accent" data-testid="try-collection-btn">
              🌱 Try Collection
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanPage;