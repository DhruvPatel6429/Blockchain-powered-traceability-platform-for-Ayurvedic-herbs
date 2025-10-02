import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CollectionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [formData, setFormData] = useState({
    herb_type: 'ashwagandha',
    quantity_kg: '',
    collector_name: '',
    collector_id: '',
    weather_conditions: '',
    soil_type: '',
    harvesting_method: '',
    notes: ''
  });

  // Get user's GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          setLocationError('GPS access denied. Please enable location services.');
          console.error('GPS Error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLocationError('GPS not supported on this device.');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
      alert('GPS location is required for collection recording.');
      return;
    }

    if (!formData.herb_type || !formData.quantity_kg || !formData.collector_name) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    
    try {
      const collectionData = {
        ...formData,
        quantity_kg: parseFloat(formData.quantity_kg),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`,
          district: 'Auto-detected',
          state: 'Auto-detected'
        }
      };

      const response = await axios.post(`${API}/collection`, collectionData);
      
      alert(`Collection recorded successfully!\\nBatch ID: ${response.data.id}\\nBatch Number: ${response.data.batch_number}`);
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Collection error:', error);
      alert('Failed to record collection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'var(--surface-muted)'}}>
      <div className="container section-padding">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-4" style={{color: 'var(--primary)'}}>🌱 Record Herb Collection</h1>
          <p className="text-lg" style={{color: 'var(--text-secondary)'}}>
            Start the blockchain journey by recording your herb collection with GPS verification
          </p>
        </div>

        {/* GPS Status */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className={`card ${location ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`} data-testid="gps-status-card">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{location ? '📍' : '⏳'}</div>
              <div>
                <h4 className={location ? 'text-green-800' : 'text-orange-800'}>
                  GPS Status: {location ? 'Location Acquired' : 'Acquiring Location...'}
                </h4>
                {location && (
                  <p className="text-sm text-green-700" data-testid="gps-coordinates">
                    Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)} 
                    (±{Math.round(location.accuracy)}m accuracy)
                  </p>
                )}
                {locationError && (
                  <p className="text-sm text-red-700" data-testid="gps-error">{locationError}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Collection Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Herb Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Herb Type *
                </label>
                <select 
                  name="herb_type"
                  value={formData.herb_type}
                  onChange={handleInputChange}
                  className="input"
                  data-testid="herb-type-select"
                  required
                >
                  <option value="ashwagandha">Ashwagandha (Withania somnifera)</option>
                  <option value="turmeric">Turmeric (Curcuma longa)</option>
                  <option value="brahmi">Brahmi (Bacopa monnieri)</option>
                  <option value="neem">Neem (Azadirachta indica)</option>
                  <option value="tulsi">Tulsi (Ocimum sanctum)</option>
                  <option value="ginger">Ginger (Zingiber officinale)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Quantity (kg) *
                </label>
                <input
                  type="number"
                  name="quantity_kg"
                  value={formData.quantity_kg}
                  onChange={handleInputChange}
                  placeholder="e.g., 25.5"
                  step="0.1"
                  min="0"
                  className="input"
                  data-testid="quantity-input"
                  required
                />
              </div>

              {/* Collector Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Collector Name *
                </label>
                <input
                  type="text"
                  name="collector_name"
                  value={formData.collector_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Ramesh Kumar"
                  className="input"
                  data-testid="collector-name-input"
                  required
                />
              </div>

              {/* Collector ID */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Collector ID (Optional)
                </label>
                <input
                  type="text"
                  name="collector_id"
                  value={formData.collector_id}
                  onChange={handleInputChange}
                  placeholder="e.g., COLL-001"
                  className="input"
                  data-testid="collector-id-input"
                />
              </div>

              {/* Weather Conditions */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Weather Conditions
                </label>
                <select
                  name="weather_conditions"
                  value={formData.weather_conditions}
                  onChange={handleInputChange}
                  className="input"
                  data-testid="weather-select"
                >
                  <option value="">Select weather...</option>
                  <option value="sunny">Sunny</option>
                  <option value="cloudy">Cloudy</option>
                  <option value="rainy">Rainy</option>
                  <option value="dry">Dry</option>
                  <option value="humid">Humid</option>
                </select>
              </div>

              {/* Soil Type */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Soil Type
                </label>
                <select
                  name="soil_type"
                  value={formData.soil_type}
                  onChange={handleInputChange}
                  className="input"
                  data-testid="soil-type-select"
                >
                  <option value="">Select soil type...</option>
                  <option value="clay">Clay</option>
                  <option value="sandy">Sandy</option>
                  <option value="loamy">Loamy</option>
                  <option value="silt">Silt</option>
                  <option value="rocky">Rocky</option>
                </select>
              </div>

              {/* Harvesting Method */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Harvesting Method
                </label>
                <select
                  name="harvesting_method"
                  value={formData.harvesting_method}
                  onChange={handleInputChange}
                  className="input"
                  data-testid="harvesting-method-select"
                >
                  <option value="">Select method...</option>
                  <option value="hand-picked">Hand Picked</option>
                  <option value="machine-harvested">Machine Harvested</option>
                  <option value="wild-collection">Wild Collection</option>
                  <option value="sustainable-harvest">Sustainable Harvest</option>
                </select>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional observations about the collection..."
                  rows={3}
                  className="input"
                  data-testid="notes-textarea"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary flex-1"
                data-testid="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !location}
                className="btn btn-primary flex-1"
                data-testid="record-collection-btn"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="loading"></div>
                    Recording...
                  </div>
                ) : (
                  '🔗 Record Collection'
                )}
              </button>
            </div>

            {/* Form Info */}
            <div className="mt-6 p-4 rounded-lg" style={{background: 'var(--surface-muted)'}}>
              <h4 className="text-sm font-medium mb-2" style={{color: 'var(--primary)'}}>
                🔒 Blockchain Security
              </h4>
              <p className="text-xs" style={{color: 'var(--text-secondary)'}}>
                This collection event will be recorded on our simulated blockchain with:
              </p>
              <ul className="text-xs mt-2 space-y-1" style={{color: 'var(--text-secondary)'}}>
                <li>• Immutable hash-chained record</li>
                <li>• GPS coordinates verification</li>
                <li>• Timestamp with collection date</li>
                <li>• Unique batch ID generation</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;