import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProcessingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [formData, setFormData] = useState({
    batch_id: '',
    processing_type: 'drying',
    processor_name: '',
    processor_id: '',
    temperature: '',
    duration_hours: '',
    equipment_used: '',
    notes: ''
  });

  // Fetch available batches
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

  const handleBatchSelect = (batchId) => {
    const batch = batches.find(b => b.id === batchId);
    setSelectedBatch(batch);
    setFormData(prev => ({ ...prev, batch_id: batchId }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.batch_id || !formData.processor_name) {
      alert('Please select a batch and enter processor name.');
      return;
    }

    setLoading(true);
    
    try {
      const processingData = {
        ...formData,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : null
      };

      await axios.post(`${API}/processing`, processingData);
      
      alert('Processing event recorded successfully!');
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Processing error:', error);
      alert('Failed to record processing event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'var(--surface-muted)'}}>
      <div className="container section-padding">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-4" style={{color: 'var(--primary)'}}>⚙️ Record Processing Event</h1>
          <p className="text-lg" style={{color: 'var(--text-secondary)'}}>
            Add processing steps to the blockchain trail for herb batches
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Batch Selection */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="mb-4" style={{color: 'var(--primary)'}}>Select Batch</h3>
              
              {batches.length === 0 ? (
                <div className="text-center py-8" data-testid="no-batches-message">
                  <div className="text-4xl mb-4">📦</div>
                  <p style={{color: 'var(--text-secondary)'}}>No batches available</p>
                  <button 
                    onClick={() => navigate('/collect')}
                    className="btn btn-primary mt-4"
                    data-testid="create-batch-btn"
                  >
                    Create First Batch
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {batches.map(batch => (
                    <div
                      key={batch.id}
                      onClick={() => handleBatchSelect(batch.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedBatch?.id === batch.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      data-testid={`batch-card-${batch.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🌿</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm" style={{color: 'var(--primary)'}}>
                            {batch.batch_number}
                          </h4>
                          <p className="text-xs text-gray-600 capitalize">
                            {batch.herb_type} • {batch.total_quantity_kg}kg
                          </p>
                          <p className="text-xs text-gray-500">
                            Status: {batch.current_status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Batch Details */}
            {selectedBatch && (
              <div className="card mt-6" data-testid="selected-batch-details">
                <h4 className="mb-3" style={{color: 'var(--primary)'}}>Batch Details</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Herb:</span> {selectedBatch.herb_type}</div>
                  <div><span className="font-medium">Quantity:</span> {selectedBatch.total_quantity_kg}kg</div>
                  <div><span className="font-medium">Origin:</span> 
                    {selectedBatch.origin_location.district || 'Auto-detected'}
                  </div>
                  <div><span className="font-medium">Events:</span> {selectedBatch.blockchain_events.length}</div>
                </div>
              </div>
            )}
          </div>

          {/* Processing Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card">
              <h3 className="mb-6" style={{color: 'var(--primary)'}}>Processing Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Processing Type */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Processing Type *
                  </label>
                  <select 
                    name="processing_type"
                    value={formData.processing_type}
                    onChange={handleInputChange}
                    className="input"
                    data-testid="processing-type-select"
                    required
                  >
                    <option value="drying">Drying</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="grinding">Grinding</option>
                    <option value="extraction">Extraction</option>
                    <option value="quality_check">Quality Check</option>
                  </select>
                </div>

                {/* Processor Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Processor Name *
                  </label>
                  <input
                    type="text"
                    name="processor_name"
                    value={formData.processor_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Ayurveda Processing Unit"
                    className="input"
                    data-testid="processor-name-input"
                    required
                  />
                </div>

                {/* Processor ID */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Processor ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="processor_id"
                    value={formData.processor_id}
                    onChange={handleInputChange}
                    placeholder="e.g., PROC-001"
                    className="input"
                    data-testid="processor-id-input"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    placeholder="e.g., 60"
                    step="0.1"
                    className="input"
                    data-testid="temperature-input"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    name="duration_hours"
                    value={formData.duration_hours}
                    onChange={handleInputChange}
                    placeholder="e.g., 24"
                    step="0.5"
                    className="input"
                    data-testid="duration-input"
                  />
                </div>

                {/* Equipment Used */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Equipment Used
                  </label>
                  <input
                    type="text"
                    name="equipment_used"
                    value={formData.equipment_used}
                    onChange={handleInputChange}
                    placeholder="e.g., Solar Dryer Model XY-200"
                    className="input"
                    data-testid="equipment-input"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Processing Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any observations during processing..."
                    rows={3}
                    className="input"
                    data-testid="processing-notes-textarea"
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
                  disabled={loading || !selectedBatch}
                  className="btn btn-primary flex-1"
                  data-testid="record-processing-btn"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="loading"></div>
                      Recording...
                    </div>
                  ) : (
                    '🔗 Record Processing'
                  )}
                </button>
              </div>

              {/* Processing Types Info */}
              <div className="mt-6 p-4 rounded-lg" style={{background: 'var(--surface-muted)'}}>
                <h4 className="text-sm font-medium mb-2" style={{color: 'var(--primary)'}}>
                  ℹ️ Processing Types Guide
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" style={{color: 'var(--text-secondary)'}}>
                  <div>
                    <span className="font-medium">Drying:</span> Sun/Solar drying to remove moisture
                  </div>
                  <div>
                    <span className="font-medium">Cleaning:</span> Removing impurities and foreign matter
                  </div>
                  <div>
                    <span className="font-medium">Grinding:</span> Size reduction and powder formation
                  </div>
                  <div>
                    <span className="font-medium">Extraction:</span> Active compound extraction
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage;