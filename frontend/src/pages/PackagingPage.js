import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PackagingPage = () => {
  const [searchParams] = useSearchParams();
  const batchIdFromParams = searchParams.get('batch');
  
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [formData, setFormData] = useState({
    batch_id: batchIdFromParams || '',
    packaging_type: 'bottling',
    packager_name: '',
    packager_id: '',
    package_size: '',
    package_count: '',
    batch_codes: '',
    expiry_date: '',
    notes: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get(`${API}/batches`);
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        package_count: formData.package_count ? parseInt(formData.package_count) : null,
        batch_codes: formData.batch_codes ? formData.batch_codes.split(',').map(c => c.trim()) : null,
        expiry_date: formData.expiry_date || null
      };

      await axios.post(`${API}/packaging`, payload);
      setSuccess(true);
      
      // Reset form
      setFormData({
        batch_id: '',
        packaging_type: 'bottling',
        packager_name: '',
        packager_id: '',
        package_size: '',
        package_count: '',
        batch_codes: '',
        expiry_date: '',
        notes: ''
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to add packaging event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'var(--surface-muted)'}}>
      <div className="container section-padding">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="mb-2" style={{color: 'var(--primary)'}}>📦 Package Herbs</h1>
            <p style={{color: 'var(--text-secondary)'}}>
              Record packaging process and add to blockchain
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link to="/dashboard" className="btn btn-secondary">
              📊 Dashboard
            </Link>
            <Link to="/" className="btn btn-secondary">
              🏠 Home
            </Link>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="card mb-6" style={{background: 'var(--success-light)', borderColor: 'var(--success)'}}>
            <p style={{color: 'var(--success)'}}>
              ✅ Packaging event recorded successfully and added to blockchain!
            </p>
          </div>
        )}

        {error && (
          <div className="card mb-6" style={{background: 'var(--error-light)', borderColor: 'var(--error)'}}>
            <p style={{color: 'var(--error)'}}>❌ {error}</p>
          </div>
        )}

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <div className="card">
            <h3 className="mb-6" style={{color: 'var(--primary)'}}>Packaging Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Batch Selection */}
              <div>
                <label className="block mb-2 font-medium">Select Batch *</label>
                <select
                  required
                  className="input w-full"
                  value={formData.batch_id}
                  onChange={(e) => setFormData({...formData, batch_id: e.target.value})}
                >
                  <option value="">Choose a batch...</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batch_number} - {batch.herb_type} ({batch.total_quantity_kg}kg)
                    </option>
                  ))}
                </select>
              </div>

              {/* Packaging Type */}
              <div>
                <label className="block mb-2 font-medium">Packaging Type *</label>
                <select
                  required
                  className="input w-full"
                  value={formData.packaging_type}
                  onChange={(e) => setFormData({...formData, packaging_type: e.target.value})}
                >
                  <option value="bottling">Bottling</option>
                  <option value="pouching">Pouching</option>
                  <option value="boxing">Boxing</option>
                  <option value="labeling">Labeling</option>
                  <option value="sealing">Sealing</option>
                </select>
              </div>

              {/* Packager Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Packager Name *</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={formData.packager_name}
                    onChange={(e) => setFormData({...formData, packager_name: e.target.value})}
                    placeholder="Name of packaging facility"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Packager ID</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.packager_id}
                    onChange={(e) => setFormData({...formData, packager_id: e.target.value})}
                    placeholder="Facility registration number"
                  />
                </div>
              </div>

              {/* Package Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Package Size</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.package_size}
                    onChange={(e) => setFormData({...formData, package_size: e.target.value})}
                    placeholder="e.g., 100g, 500ml"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Package Count</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={formData.package_count}
                    onChange={(e) => setFormData({...formData, package_count: e.target.value})}
                    placeholder="Number of packages"
                  />
                </div>
              </div>

              {/* Batch Codes */}
              <div>
                <label className="block mb-2 font-medium">Batch Codes (comma-separated)</label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.batch_codes}
                  onChange={(e) => setFormData({...formData, batch_codes: e.target.value})}
                  placeholder="e.g., PKG-001, PKG-002, PKG-003"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block mb-2 font-medium">Expiry Date</label>
                <input
                  type="date"
                  className="input w-full"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block mb-2 font-medium">Additional Notes</label>
                <textarea
                  className="input w-full"
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional packaging details..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? '⏳ Recording...' : '📦 Record Packaging Event'}
              </button>
            </form>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="card text-center">
            <div className="text-3xl mb-3">📦</div>
            <h4 className="mb-2" style={{color: 'var(--primary)'}}>Package Types</h4>
            <p className="text-sm">Support for bottles, pouches, boxes and custom packaging</p>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-3">🏷️</div>
            <h4 className="mb-2" style={{color: 'var(--primary)'}}>Labeling</h4>
            <p className="text-sm">Track labels, batch codes and expiry dates</p>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-3">⛓️</div>
            <h4 className="mb-2" style={{color: 'var(--primary)'}}>Blockchain</h4>
            <p className="text-sm">All packaging data immutably recorded on chain</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagingPage;
