import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

const QRScannerPage = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualBatchId, setManualBatchId] = useState('');
  const [html5QrCode, setHtml5QrCode] = useState(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [html5QrCode]);

  const startScanning = async () => {
    try {
      setError('');
      const qrCodeScanner = new Html5Qrcode("qr-reader");
      setHtml5QrCode(qrCodeScanner);
      
      await qrCodeScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // QR Code detected
          console.log('QR Code detected:', decodedText);
          
          // Extract batch ID from URL or direct text
          let batchId = decodedText;
          if (decodedText.includes('/scan/')) {
            const parts = decodedText.split('/scan/');
            batchId = parts[parts.length - 1];
          }
          
          // Stop scanning
          qrCodeScanner.stop().then(() => {
            navigate(`/scan/${batchId}`);
          });
        }
      );
      
      setScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Unable to access camera. Please check permissions or use manual entry.');
    }
  };

  const stopScanning = () => {
    if (html5QrCode) {
      html5QrCode.stop().then(() => {
        setScanning(false);
        setHtml5QrCode(null);
      }).catch(err => {
        console.error('Error stopping scanner:', err);
      });
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBatchId.trim()) {
      navigate(`/scan/${manualBatchId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'var(--surface-muted)'}}>
      <div className="container section-padding">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="mb-2" style={{color: 'var(--primary)'}}>📱 QR Code Scanner</h1>
            <p style={{color: 'var(--text-secondary)'}}>
              Scan QR codes to view herb provenance
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

        {/* Error Message */}
        {error && (
          <div className="card mb-6" style={{background: 'var(--error-light)', borderColor: 'var(--error)'}}>
            <p style={{color: 'var(--error)'}}>❌ {error}</p>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          
          {/* QR Scanner */}
          <div className="card mb-8">
            <h3 className="mb-6 text-center" style={{color: 'var(--primary)'}}>
              Scan QR Code with Camera
            </h3>
            
            <div id="qr-reader" className="mb-6 mx-auto" style={{maxWidth: '400px'}}></div>
            
            <div className="text-center">
              {!scanning ? (
                <button
                  onClick={startScanning}
                  className="btn btn-primary"
                >
                  📸 Start Camera Scanner
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="btn btn-secondary"
                >
                  🛑 Stop Scanning
                </button>
              )}
            </div>
          </div>

          {/* Manual Entry */}
          <div className="card">
            <h3 className="mb-6 text-center" style={{color: 'var(--primary)'}}>
              Or Enter Batch ID Manually
            </h3>
            
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Batch ID</label>
                <input
                  type="text"
                  className="input w-full"
                  value={manualBatchId}
                  onChange={(e) => setManualBatchId(e.target.value)}
                  placeholder="Enter batch ID or number..."
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary w-full">
                🔍 View Provenance
              </button>
            </form>
          </div>

          {/* Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="card text-center">
              <div className="text-3xl mb-3">📸</div>
              <h4 className="mb-2" style={{color: 'var(--primary)'}}>Camera Scan</h4>
              <p className="text-sm">Point your camera at the QR code on the product</p>
            </div>
            
            <div className="card text-center">
              <div className="text-3xl mb-3">✍️</div>
              <h4 className="mb-2" style={{color: 'var(--primary)'}}>Manual Entry</h4>
              <p className="text-sm">Type the batch ID if QR code is not scannable</p>
            </div>
            
            <div className="card text-center">
              <div className="text-3xl mb-3">✅</div>
              <h4 className="mb-2" style={{color: 'var(--primary)'}}>Verify</h4>
              <p className="text-sm">View complete blockchain-verified journey</p>
            </div>
          </div>

          {/* Demo Link */}
          <div className="card mt-8 text-center bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-4xl mb-4">🌿</div>
            <h3 className="mb-3" style={{color: 'var(--primary)'}}>Try Demo Scan</h3>
            <p className="mb-4" style={{color: 'var(--text-secondary)'}}>
              See how the system works with our demo data
            </p>
            <Link to="/scan/demo" className="btn btn-accent">
              📱 View Demo Provenance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;
