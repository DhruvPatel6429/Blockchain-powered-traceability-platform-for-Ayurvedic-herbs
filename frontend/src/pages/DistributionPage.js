import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DistributionPage = () => {
  const [searchParams] = useSearchParams();
  const batchIdFromParams = searchParams.get('batch');
  
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [formData, setFormData] = useState({
    batch_id: batchIdFromParams || '',
    distributor_name: '',
    distributor_id: '',
    distribution_mode: 'truck',
    origin_latitude: '',
    origin_longitude: '',
    origin_address: '',
    dest_latitude: '',
    dest_longitude: '',
    dest_address: '',
    vehicle_number: '',
    driver_name: '',
    expected_delivery: '',
    temperature_controlled: false,
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
        batch_id: formData.batch_id,
        distributor_name: formData.distributor_name,
        distributor_id: formData.distributor_id || null,
        distribution_mode: formData.distribution_mode,
        vehicle_number: formData.vehicle_number || null,
        driver_name: formData.driver_name || null,
        expected_delivery: formData.expected_delivery || null,
        temperature_controlled: formData.temperature_controlled,
        notes: formData.notes || null
      };

      // Add origin location if provided
      if (formData.origin_latitude && formData.origin_longitude) {
        payload.origin_location = {
          latitude: parseFloat(formData.origin_latitude),
          longitude: parseFloat(formData.origin_longitude),
          address: formData.origin_address || null
        };
      }

      // Add destination location if provided
      if (formData.dest_latitude && formData.dest_longitude) {
        payload.destination_location = {
          latitude: parseFloat(formData.dest_latitude),
          longitude: parseFloat(formData.dest_longitude),
          address: formData.dest_address || null
        };
      }

      await axios.post(`${API}/distribution`, payload);
      setSuccess(true);
      
      // Reset form
      setFormData({
        batch_id: '',
        distributor_name: '',
        distributor_id: '',
        distribution_mode: 'truck',
        origin_latitude: '',
        origin_longitude: '',
        origin_address: '',
        dest_latitude: '',
        dest_longitude: '',
        dest_address: '',
        vehicle_number: '',
        driver_name: '',
        expected_delivery: '',
        temperature_controlled: false,
        notes: ''
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to add distribution event');
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
            <h1 className="mb-2" style={{color: 'var(--primary)'}}>🚚 Distribution Tracking</h1>
            <p style={{color: 'var(--text-secondary)'}}>
              Track shipping and distribution to blockchain
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
              ✅ Distribution event recorded successfully and added to blockchain!
            </p>
          </div>
        )}

        {error && (
          <div className="card mb-6" style={{background: 'var(--error-light)', borderColor: 'var(--error)'}}>
            <p style={{color: 'var(--error)'}}>❌ {error}</p>
          </div>
        )}

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <h3 className="mb-6" style={{color: 'var(--primary)'}}>Distribution Details</h3>
            
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

              {/* Distributor Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Distributor Name *</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={formData.distributor_name}
                    onChange={(e) => setFormData({...formData, distributor_name: e.target.value})}
                    placeholder="Distribution company name"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Distributor ID</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.distributor_id}
                    onChange={(e) => setFormData({...formData, distributor_id: e.target.value})}
                    placeholder="Company registration number"
                  />
                </div>
              </div>

              {/* Transport Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Distribution Mode *</label>
                  <select
                    required
                    className="input w-full"
                    value={formData.distribution_mode}
                    onChange={(e) => setFormData({...formData, distribution_mode: e.target.value})}
                  >
                    <option value="truck">Truck</option>
                    <option value="rail">Rail</option>
                    <option value="air">Air</option>
                    <option value="sea">Sea</option>
                    <option value="local">Local Delivery</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Vehicle Number</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                    placeholder="e.g., DL-01-AB-1234"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Driver Name</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.driver_name}
                    onChange={(e) => setFormData({...formData, driver_name: e.target.value})}
                    placeholder="Driver name"
                  />
                </div>
              </div>

              {/* Origin Location */}
              <div>
                <h4 className="mb-3" style={{color: 'var(--primary)'}}>📍 Origin Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-sm">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="input w-full"
                      value={formData.origin_latitude}
                      onChange={(e) => setFormData({...formData, origin_latitude: e.target.value})}
                      placeholder="e.g., 28.6139"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-sm">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="input w-full"
                      value={formData.origin_longitude}
                      onChange={(e) => setFormData({...formData, origin_longitude: e.target.value})}
                      placeholder="e.g., 77.2090"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-sm">Address</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={formData.origin_address}
                      onChange={(e) => setFormData({...formData, origin_address: e.target.value})}
                      placeholder="Warehouse address"
                    />
                  </div>
                </div>
              </div>

              {/* Destination Location */}
              <div>
                <h4 className="mb-3" style={{color: 'var(--primary)'}}>📍 Destination Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-sm">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="input w-full"
                      value={formData.dest_latitude}
                      onChange={(e) => setFormData({...formData, dest_latitude: e.target.value})}
                      placeholder="e.g., 19.0760"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-sm">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="input w-full"
                      value={formData.dest_longitude}
                      onChange={(e) => setFormData({...formData, dest_longitude: e.target.value})}
                      placeholder="e.g., 72.8777"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-sm">Address</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={formData.dest_address}
                      onChange={(e) => setFormData({...formData, dest_address: e.target.value})}
                      placeholder="Delivery address"
                    />
                  </div>
                </div>
              </div>

              {/* Expected Delivery & Temperature Control */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Expected Delivery Date</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={formData.expected_delivery}
                    onChange={(e) => setFormData({...formData, expected_delivery: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Temperature Control</label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      id="temp-control"
                      checked={formData.temperature_controlled}
                      onChange={(e) => setFormData({...formData, temperature_controlled: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <label htmlFor="temp-control" className="text-sm">
                      Temperature-controlled transport
                    </label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block mb-2 font-medium">Shipping Notes</label>
                <textarea
                  className="input w-full"
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Special handling instructions, delivery notes..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? '⏳ Recording...' : '🚚 Record Distribution Event'}
              </button>
            </form>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="card text-center">
            <div className="text-3xl mb-3">🚚</div>
            <h4 className="mb-2" style={{color: 'var(--primary)'}}>Multi-Modal</h4>
            <p className="text-sm">Support for truck, rail, air, and sea transport</p>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-3">📍</div>
            <h4 className="mb-2" style={{color: 'var(--primary)'}}>GPS Tracking</h4>
            <p className="text-sm">Track origin and destination coordinates</p>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-3">🌡️</div>
            <h4 className="mb-2" style={{color: 'var(--primary)'}}>Cold Chain</h4>
            <p className="text-sm">Monitor temperature-controlled shipments</p>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-3">⛓️</div>
            <h4 className="mb-2" style={{color: 'var(--primary)'}}>Blockchain</h4>
            <p className="text-sm">Immutable distribution records</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionPage;
