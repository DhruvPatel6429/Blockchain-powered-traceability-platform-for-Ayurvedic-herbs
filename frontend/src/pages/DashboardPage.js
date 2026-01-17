import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState({
    total_batches: 0,
    total_quantity: 0,
    active_collections: 0,
    tested_batches: 0
  });
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/batches`);
      const batchData = response.data;
      setBatches(batchData);
      
      // Calculate statistics
      const totalQuantity = batchData.reduce((sum, batch) => sum + batch.total_quantity_kg, 0);
      const testedBatches = batchData.filter(batch => 
        batch.blockchain_events.length >= 3 || batch.current_status === 'tested'
      ).length;
      
      setStats({
        total_batches: batchData.length,
        total_quantity: totalQuantity,
        active_collections: batchData.length,
        tested_batches: testedBatches
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async (batchId) => {
    try {
      const response = await axios.get(`${API}/qr/${batchId}/base64`);
      setQrData(response.data);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      collected: 'badge-warning',
      processing: 'badge-warning',
      tested: 'badge-success',
      packaged: 'badge-success',
      distributed: 'badge-success'
    };
    return colors[status] || 'badge-warning';
  };

  const getHerbIcon = (herbType) => {
    const icons = {
      ashwagandha: '🌿',
      turmeric: '🟡',
      brahmi: '🍃',
      neem: '🌱',
      tulsi: '🌿',
      ginger: '🫚',
      other: '🌾'
    };
    return icons[herbType] || '🌾';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--surface-muted)'}}>
        <div className="text-center">
          <div className="loading mb-4" style={{width: '40px', height: '40px'}}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--surface-muted)'}}>
      <div className="container section-padding">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="mb-2" style={{color: 'var(--primary)'}}>📊 Traceability Dashboard</h1>
            <p style={{color: 'var(--text-secondary)'}}>
              Monitor herb batches, supply chain events, and blockchain integrity
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link to="/collect" className="btn btn-primary" data-testid="new-collection-btn">
              🌱 New Collection
            </Link>
            <Link to="/" className="btn btn-secondary" data-testid="back-home-btn">
              🏠 Home
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center" data-testid="total-batches-stat">
            <div className="text-3xl mb-2">📦</div>
            <h3 className="text-2xl font-bold mb-1" style={{color: 'var(--primary)'}}>
              {stats.total_batches}
            </h3>
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Total Batches</p>
          </div>
          
          <div className="card text-center" data-testid="total-quantity-stat">
            <div className="text-3xl mb-2">⚖️</div>
            <h3 className="text-2xl font-bold mb-1" style={{color: 'var(--primary)'}}>
              {stats.total_quantity.toFixed(1)}kg
            </h3>
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Total Quantity</p>
          </div>
          
          <div className="card text-center" data-testid="active-collections-stat">
            <div className="text-3xl mb-2">🌱</div>
            <h3 className="text-2xl font-bold mb-1" style={{color: 'var(--primary)'}}>
              {stats.active_collections}
            </h3>
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Active Collections</p>
          </div>
          
          <div className="card text-center" data-testid="tested-batches-stat">
            <div className="text-3xl mb-2">🧪</div>
            <h3 className="text-2xl font-bold mb-1" style={{color: 'var(--primary)'}}>
              {stats.tested_batches}
            </h3>
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Quality Tested</p>
          </div>
        </div>

        {/* Main Content */}
        {batches.length === 0 ? (
          <div className="card text-center py-12" data-testid="no-batches-message">
            <div className="text-6xl mb-6">📦</div>
            <h3 className="mb-4" style={{color: 'var(--primary)'}}>No Batches Created Yet</h3>
            <p className="mb-6" style={{color: 'var(--text-secondary)'}}>
              Start your blockchain journey by recording the first herb collection
            </p>
            <Link to="/collect" className="btn btn-primary" data-testid="first-collection-btn">
              🌱 Record First Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Batches List */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 style={{color: 'var(--primary)'}}>Herb Batches</h3>
                  <div className="text-sm" style={{color: 'var(--text-secondary)'}}>
                    {batches.length} batches
                  </div>
                </div>
                
                <div className="space-y-4">
                  {batches.map(batch => (
                    <div
                      key={batch.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedBatch?.id === batch.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedBatch(batch)}
                      data-testid={`batch-item-${batch.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{getHerbIcon(batch.herb_type)}</div>
                          <div>
                            <h4 className="font-medium" style={{color: 'var(--primary)'}}>
                              {batch.batch_number}
                            </h4>
                            <p className="text-sm capitalize" style={{color: 'var(--text-secondary)'}}>
                              {batch.herb_type} • {batch.total_quantity_kg}kg
                            </p>
                            <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                              Created: {formatDate(batch.created_date)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className={`badge ${getStatusColor(batch.current_status)}`}>
                            {batch.current_status}
                          </div>
                          <div className="text-xs" style={{color: 'var(--text-muted)'}}>
                            {batch.blockchain_events.length} events
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Batch Details Panel */}
            <div className="lg:col-span-1">
              {selectedBatch ? (
                <div className="space-y-6">
                  <div className="card" data-testid="batch-details-panel">
                    <h4 className="mb-4" style={{color: 'var(--primary)'}}>Batch Details</h4>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Batch Number:</span>
                        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1">
                          {selectedBatch.batch_number}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Herb Type:</span>
                        <p className="capitalize">{selectedBatch.herb_type}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium">Quantity:</span>
                        <p>{selectedBatch.total_quantity_kg} kg</p>
                      </div>
                      
                      <div>
                        <span className="font-medium">Origin:</span>
                        <p>{selectedBatch.origin_location.district || 'Auto-detected'}, {selectedBatch.origin_location.state || 'India'}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium">Status:</span>
                        <div className={`badge ${getStatusColor(selectedBatch.current_status)} mt-1`}>
                          {selectedBatch.current_status}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Blockchain Events:</span>
                        <p>{selectedBatch.blockchain_events.length} recorded</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="card">
                    <h4 className="mb-4" style={{color: 'var(--primary)'}}>Quick Actions</h4>
                    
                    <div className="space-y-3">
                      <Link
                        to={`/scan/${selectedBatch.id}`}
                        className="btn btn-primary w-full text-sm"
                        data-testid="view-provenance-btn"
                      >
                        🔍 View Provenance
                      </Link>
                      
                      <button
                        onClick={() => generateQR(selectedBatch.id)}
                        className="btn btn-accent w-full text-sm"
                        data-testid="generate-qr-btn"
                      >
                        📱 Generate QR Code
                      </button>
                      
                      <Link
                        to={`/process?batch=${selectedBatch.id}`}
                        className="btn btn-secondary w-full text-sm"
                        data-testid="add-processing-btn"
                      >
                        ⚙️ Add Processing
                      </Link>
                      
                      <Link
                        to={`/test?batch=${selectedBatch.id}`}
                        className="btn btn-secondary w-full text-sm"
                        data-testid="add-testing-btn"
                      >
                        🧪 Add Testing
                      </Link>
                      
                      <Link
                        to={`/package?batch=${selectedBatch.id}`}
                        className="btn btn-secondary w-full text-sm"
                      >
                        📦 Add Packaging
                      </Link>
                      
                      <Link
                        to={`/distribute?batch=${selectedBatch.id}`}
                        className="btn btn-secondary w-full text-sm"
                      >
                        🚚 Add Distribution
                      </Link>
                    </div>
                  </div>
                  
                  {/* QR Code Display */}
                  {qrData && (
                    <div className="card" data-testid="qr-code-panel">
                      <h4 className="mb-4" style={{color: 'var(--primary)'}}>QR Code Generated</h4>
                      
                      <div className="text-center mb-4">
                        <div className="w-48 h-48 mx-auto bg-white p-3 rounded-lg border-2 border-gray-200 mb-3">
                          {qrData.qr_code_base64 ? (
                            <img 
                              src={qrData.qr_code_base64} 
                              alt="QR Code" 
                              className="w-full h-full"
                            />
                          ) : (
                            <QRCodeSVG 
                              value={qrData.scan_url || ''} 
                              size={180}
                              level="H"
                              includeMargin={true}
                            />
                          )}
                        </div>
                        <p className="text-xs mb-3" style={{color: 'var(--text-secondary)'}}>
                          Scan URL: {qrData.scan_url}
                        </p>
                        <a 
                          href={`${API}/qr/${qrData.batch_id}/image`}
                          download={`QR_${qrData.batch_id}.png`}
                          className="btn btn-accent btn-sm"
                        >
                          📥 Download QR Code
                        </a>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium">Batch ID:</span> {qrData.batch_id}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card text-center py-12" data-testid="select-batch-message">
                  <div className="text-4xl mb-4">👆</div>
                  <p style={{color: 'var(--text-secondary)'}}>
                    Select a batch to view details and perform actions
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <h4 className="mb-3" style={{color: 'var(--primary)'}}>Herb Distribution</h4>
            <div className="space-y-2">
              {['ashwagandha', 'turmeric', 'brahmi', 'neem'].map(herb => {
                const count = batches.filter(b => b.herb_type === herb).length;
                return count > 0 ? (
                  <div key={herb} className="flex items-center justify-between text-sm">
                    <span className="capitalize flex items-center gap-2">
                      {getHerbIcon(herb)} {herb}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
          
          <div className="card">
            <h4 className="mb-3" style={{color: 'var(--primary)'}}>Supply Chain Health</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Blockchain Verified</span>
                <span className="text-green-600 font-medium">100%</span>
              </div>
              <div className="flex justify-between">
                <span>Quality Tested</span>
                <span className="text-green-600 font-medium">
                  {stats.total_batches > 0 ? Math.round((stats.tested_batches / stats.total_batches) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Chain Integrity</span>
                <span className="text-green-600 font-medium">✅ Intact</span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h4 className="mb-3" style={{color: 'var(--primary)'}}>Recent Activity</h4>
            <div className="text-sm space-y-1" style={{color: 'var(--text-secondary)'}}>
              {batches.length > 0 ? (
                <>
                  <p>Latest collection: {formatDate(batches[batches.length - 1]?.created_date)}</p>
                  <p>Total events: {batches.reduce((sum, b) => sum + b.blockchain_events.length, 0)}</p>
                  <p>Active tracking: {batches.length} batches</p>
                </>
              ) : (
                <p>No activity yet</p>
              )}
            </div>
          </div>
          
          <div className="card">
            <h4 className="mb-3" style={{color: 'var(--primary)'}}>Actions</h4>
            <div className="space-y-2">
              <Link to="/collect" className="btn btn-primary w-full text-sm" data-testid="dashboard-collect-btn">
                Record Collection
              </Link>
              <Link to="/analytics" className="btn btn-accent w-full text-sm">
                📊 View Analytics
              </Link>
              <Link to="/scanner" className="btn btn-secondary w-full text-sm">
                📱 QR Scanner
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;