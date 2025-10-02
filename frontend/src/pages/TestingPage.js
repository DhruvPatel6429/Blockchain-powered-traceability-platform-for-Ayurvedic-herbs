import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TestingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [testResults, setTestResults] = useState([
    {
      test_type: 'Moisture Content',
      result_value: '',
      unit: '%',
      pass_status: true,
      certificate_number: ''
    }
  ]);
  const [formData, setFormData] = useState({
    batch_id: '',
    lab_name: '',
    lab_id: '',
    overall_grade: 'A',
    compliance_status: true,
    notes: ''
  });

  // Common test types for Ayurvedic herbs
  const commonTests = [
    { name: 'Moisture Content', unit: '%', max_limit: 12 },
    { name: 'Total Ash', unit: '%', max_limit: 10 },
    { name: 'Acid Insoluble Ash', unit: '%', max_limit: 5 },
    { name: 'Heavy Metals (Lead)', unit: 'ppm', max_limit: 10 },
    { name: 'Heavy Metals (Cadmium)', unit: 'ppm', max_limit: 0.3 },
    { name: 'Pesticide Residue', unit: 'ppm', max_limit: 0.05 },
    { name: 'Aflatoxin', unit: 'ppb', max_limit: 10 },
    { name: 'Total Plate Count', unit: 'CFU/g', max_limit: 100000 },
    { name: 'Yeast & Mold', unit: 'CFU/g', max_limit: 1000 },
    { name: 'Active Compound', unit: '%', min_limit: 0.5 }
  ];

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
      [name]: name === 'compliance_status' ? value === 'true' : value
    }));
  };

  const handleTestResultChange = (index, field, value) => {
    const updatedResults = [...testResults];
    updatedResults[index] = {
      ...updatedResults[index],
      [field]: field === 'pass_status' ? value === 'true' : value
    };
    setTestResults(updatedResults);
  };

  const addTestResult = () => {
    setTestResults([
      ...testResults,
      {
        test_type: '',
        result_value: '',
        unit: '',
        pass_status: true,
        certificate_number: ''
      }
    ]);
  };

  const removeTestResult = (index) => {
    setTestResults(testResults.filter((_, i) => i !== index));
  };

  const addCommonTest = (testName) => {
    const test = commonTests.find(t => t.name === testName);
    setTestResults([
      ...testResults,
      {
        test_type: test.name,
        result_value: '',
        unit: test.unit,
        pass_status: true,
        certificate_number: ''
      }
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.batch_id || !formData.lab_name || testResults.length === 0) {
      alert('Please select a batch, enter lab name, and add at least one test result.');
      return;
    }

    // Validate test results
    const validResults = testResults.filter(result => 
      result.test_type && result.result_value
    );

    if (validResults.length === 0) {
      alert('Please add at least one complete test result.');
      return;
    }

    setLoading(true);
    
    try {
      const testingData = {
        ...formData,
        test_results: validResults.map(result => ({
          ...result,
          lab_name: formData.lab_name,
          test_date: new Date().toISOString()
        }))
      };

      await axios.post(`${API}/testing`, testingData);
      
      alert('Testing results recorded successfully!');
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Testing error:', error);
      alert('Failed to record testing results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'var(--surface-muted)'}}>
      <div className="container section-padding">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-4" style={{color: 'var(--primary)'}}>🧪 Record Lab Testing Results</h1>
          <p className="text-lg" style={{color: 'var(--text-secondary)'}}>
            Add quality test results and compliance data to the blockchain
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Batch Selection */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="mb-4" style={{color: 'var(--primary)'}}>Select Batch</h3>
              
              {batches.length === 0 ? (
                <div className="text-center py-8" data-testid="no-batches-message">
                  <div className="text-4xl mb-4">📦</div>
                  <p style={{color: 'var(--text-secondary)'}}>No batches available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {batches.map(batch => (
                    <div
                      key={batch.id}
                      onClick={() => handleBatchSelect(batch.id)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedBatch?.id === batch.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      data-testid={`batch-card-${batch.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-xl">🌿</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-xs" style={{color: 'var(--primary)'}}>
                            {batch.batch_number}
                          </h4>
                          <p className="text-xs text-gray-600 capitalize">
                            {batch.herb_type}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Common Tests Quick Add */}
            <div className="card mt-6">
              <h4 className="mb-3" style={{color: 'var(--primary)'}}>Quick Add Tests</h4>
              <div className="space-y-2">
                {commonTests.slice(0, 5).map(test => (
                  <button
                    key={test.name}
                    onClick={() => addCommonTest(test.name)}
                    className="w-full text-left text-xs p-2 rounded hover:bg-gray-100 transition-colors"
                    data-testid={`add-test-${test.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    + {test.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Testing Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Lab Information */}
              <div className="card">
                <h3 className="mb-6" style={{color: 'var(--primary)'}}>Lab Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                      Laboratory Name *
                    </label>
                    <input
                      type="text"
                      name="lab_name"
                      value={formData.lab_name}
                      onChange={handleInputChange}
                      placeholder="e.g., Ayurveda Quality Control Lab"
                      className="input"
                      data-testid="lab-name-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                      Lab ID / Accreditation
                    </label>
                    <input
                      type="text"
                      name="lab_id"
                      value={formData.lab_id}
                      onChange={handleInputChange}
                      placeholder="e.g., NABL-LAB-001"
                      className="input"
                      data-testid="lab-id-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                      Overall Grade
                    </label>
                    <select
                      name="overall_grade"
                      value={formData.overall_grade}
                      onChange={handleInputChange}
                      className="input"
                      data-testid="overall-grade-select"
                    >
                      <option value="A">Grade A (Premium)</option>
                      <option value="B">Grade B (Standard)</option>
                      <option value="C">Grade C (Basic)</option>
                      <option value="Reject">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                      Compliance Status
                    </label>
                    <select
                      name="compliance_status"
                      value={formData.compliance_status.toString()}
                      onChange={handleInputChange}
                      className="input"
                      data-testid="compliance-status-select"
                    >
                      <option value="true">Compliant</option>
                      <option value="false">Non-Compliant</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Test Results */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 style={{color: 'var(--primary)'}}>Test Results</h3>
                  <button
                    type="button"
                    onClick={addTestResult}
                    className="btn btn-accent text-sm"
                    data-testid="add-test-result-btn"
                  >
                    + Add Test
                  </button>
                </div>

                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg" data-testid={`test-result-${index}`}>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1">Test Type *</label>
                          <input
                            type="text"
                            value={result.test_type}
                            onChange={(e) => handleTestResultChange(index, 'test_type', e.target.value)}
                            placeholder="e.g., Moisture Content"
                            className="input text-sm"
                            data-testid={`test-type-${index}`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium mb-1">Result Value *</label>
                          <input
                            type="text"
                            value={result.result_value}
                            onChange={(e) => handleTestResultChange(index, 'result_value', e.target.value)}
                            placeholder="e.g., 8.5"
                            className="input text-sm"
                            data-testid={`test-value-${index}`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium mb-1">Unit</label>
                          <input
                            type="text"
                            value={result.unit}
                            onChange={(e) => handleTestResultChange(index, 'unit', e.target.value)}
                            placeholder="e.g., %"
                            className="input text-sm"
                            data-testid={`test-unit-${index}`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium mb-1">Status</label>
                          <select
                            value={result.pass_status.toString()}
                            onChange={(e) => handleTestResultChange(index, 'pass_status', e.target.value)}
                            className="input text-sm"
                            data-testid={`test-status-${index}`}
                          >
                            <option value="true">Pass</option>
                            <option value="false">Fail</option>
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeTestResult(index)}
                            className="btn btn-secondary text-xs w-full"
                            data-testid={`remove-test-${index}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-xs font-medium mb-1">Certificate Number</label>
                        <input
                          type="text"
                          value={result.certificate_number}
                          onChange={(e) => handleTestResultChange(index, 'certificate_number', e.target.value)}
                          placeholder="e.g., CERT-2024-001"
                          className="input text-sm"
                          data-testid={`certificate-number-${index}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="card">
                <h4 className="mb-4" style={{color: 'var(--primary)'}}>Additional Notes</h4>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional observations or recommendations..."
                  rows={4}
                  className="input"
                  data-testid="testing-notes-textarea"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
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
                  disabled={loading || !selectedBatch || testResults.length === 0}
                  className="btn btn-primary flex-1"
                  data-testid="record-testing-btn"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="loading"></div>
                      Recording...
                    </div>
                  ) : (
                    '🔗 Record Test Results'
                  )}
                </button>
              </div>

              {/* Testing Standards Info */}
              <div className="card">
                <h4 className="text-sm font-medium mb-2" style={{color: 'var(--primary)'}}>
                  📋 Ayurvedic Quality Standards
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" style={{color: 'var(--text-secondary)'}}>
                  <div>
                    <span className="font-medium">Moisture Content:</span> Max 12% (prevents microbial growth)
                  </div>
                  <div>
                    <span className="font-medium">Heavy Metals:</span> Lead &lt;10ppm, Cadmium &lt;0.3ppm
                  </div>
                  <div>
                    <span className="font-medium">Pesticide Residue:</span> Max 0.05ppm (organic standards)
                  </div>
                  <div>
                    <span className="font-medium">Microbial Limits:</span> TPC &lt;10⁵ CFU/g, Y&M &lt;10³ CFU/g
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

export default TestingPage;