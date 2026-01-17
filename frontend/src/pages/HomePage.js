import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{
        background: 'var(--gradient-hero)',
        minHeight: '80vh'
      }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" patternUnits="userSpaceOnUse" width="100" height="100"><circle cx="50" cy="50" r="0.5" fill="%23000" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>')`,
        }}></div>
        
        <div className="container relative z-10 flex flex-col items-center justify-center" style={{minHeight: '80vh', padding: '2rem 1rem'}}>
          <div className="text-center max-w-4xl animate-fade-in-up">
            <h1 className="mb-6" style={{color: 'var(--text-primary)'}}>
              🌿 Ayurvedic Herb Traceability Platform
            </h1>
            <p className="text-xl mb-8 leading-relaxed" style={{color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.25rem)'}}>
              Blockchain-powered transparency for Ayurvedic herbs from farm to pharmacy. 
              Track geo-tagged provenance, ensure quality, and build consumer trust with 
              immutable supply chain records.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/collect" className="btn btn-primary" data-testid="start-collection-btn">
                🌱 Start Collection
              </Link>
              <Link to="/dashboard" className="btn btn-secondary" data-testid="view-dashboard-btn">
                📊 View Dashboard
              </Link>
              <Link to="/analytics" className="btn btn-accent">
                📈 Analytics
              </Link>
              <Link to="/scanner" className="btn btn-accent" data-testid="scan-demo-btn">
                📱 QR Scanner
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="card text-center" data-testid="blockchain-feature-card">
              <div className="text-4xl mb-4">⛓️</div>
              <h3 className="mb-3" style={{color: 'var(--primary)'}}>Blockchain Verified</h3>
              <p>Immutable hash-chained records ensure tamper-proof provenance tracking from collection to consumer.</p>
            </div>
            
            <div className="card text-center" data-testid="gps-feature-card">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="mb-3" style={{color: 'var(--primary)'}}>GPS Geo-tagging</h3>
              <p>Precise location tracking for every collection event with weather and soil data integration.</p>
            </div>
            
            <div className="card text-center" data-testid="qr-feature-card">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="mb-3" style={{color: 'var(--primary)'}}>QR Code Access</h3>
              <p>Instant consumer access to complete herb journey, lab results, and compliance certificates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supply Chain Flow */}
      <section className="section-padding" style={{background: 'var(--surface-muted)'}}>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-4" style={{color: 'var(--primary)'}}>Complete Supply Chain Journey</h2>
            <p className="text-lg" style={{color: 'var(--text-secondary)'}}>
              Track every step from farm to consumer with blockchain verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="card text-center" data-testid="collection-step-card">
              <div className="text-3xl mb-4">🌱</div>
              <h4 className="mb-3" style={{color: 'var(--primary)'}}>Collection</h4>
              <p className="text-sm mb-4">GPS-tagged harvest with collector details</p>
              <Link to="/collect" className="btn btn-primary w-full text-sm" data-testid="collection-step-btn">
                Record
              </Link>
            </div>

            <div className="card text-center" data-testid="processing-step-card">
              <div className="text-3xl mb-4">⚙️</div>
              <h4 className="mb-3" style={{color: 'var(--primary)'}}>Processing</h4>
              <p className="text-sm mb-4">Drying, cleaning, and grinding tracking</p>
              <Link to="/process" className="btn btn-primary w-full text-sm" data-testid="processing-step-btn">
                Track
              </Link>
            </div>

            <div className="card text-center" data-testid="testing-step-card">
              <div className="text-3xl mb-4">🧪</div>
              <h4 className="mb-3" style={{color: 'var(--primary)'}}>Lab Testing</h4>
              <p className="text-sm mb-4">Quality and purity certification</p>
              <Link to="/test" className="btn btn-primary w-full text-sm" data-testid="testing-step-btn">
                Test
              </Link>
            </div>
            
            <div className="card text-center">
              <div className="text-3xl mb-4">📦</div>
              <h4 className="mb-3" style={{color: 'var(--primary)'}}>Packaging</h4>
              <p className="text-sm mb-4">Bottling, labeling, and sealing</p>
              <Link to="/package" className="btn btn-primary w-full text-sm">
                Package
              </Link>
            </div>
            
            <div className="card text-center">
              <div className="text-3xl mb-4">🚚</div>
              <h4 className="mb-3" style={{color: 'var(--primary)'}}>Distribution</h4>
              <p className="text-sm mb-4">Shipping and delivery tracking</p>
              <Link to="/distribute" className="btn btn-primary w-full text-sm">
                Ship
              </Link>
            </div>

            <div className="card text-center" data-testid="consumer-step-card">
              <div className="text-3xl mb-4">📱</div>
              <h4 className="mb-3" style={{color: 'var(--primary)'}}>Consumer</h4>
              <p className="text-sm mb-4">QR scan for complete journey</p>
              <Link to="/scanner" className="btn btn-primary w-full text-sm" data-testid="consumer-step-btn">
                Scan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="mb-6" style={{color: 'var(--primary)'}}>
                Why Blockchain Traceability Matters
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4" data-testid="trust-benefit">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="mb-2" style={{color: 'var(--primary)'}}>Consumer Trust</h4>
                    <p>Build confidence with transparent, verifiable herb origins and quality standards.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4" data-testid="compliance-benefit">
                  <div className="text-2xl">📋</div>
                  <div>
                    <h4 className="mb-2" style={{color: 'var(--primary)'}}>Regulatory Compliance</h4>
                    <p>Meet export requirements with complete audit trails and quality documentation.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4" data-testid="sustainability-benefit">
                  <div className="text-2xl">🌍</div>
                  <div>
                    <h4 className="mb-2" style={{color: 'var(--primary)'}}>Sustainable Harvesting</h4>
                    <p>Analytics on demand patterns support responsible wild collection practices.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4" data-testid="recall-benefit">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <h4 className="mb-2" style={{color: 'var(--primary)'}}>Rapid Recall</h4>
                    <p>Instantly trace contaminated batches and alert all stakeholders in the supply chain.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="card glass p-8">
                <h3 className="mb-4 text-center" style={{color: 'var(--primary)'}}>
                  Pilot Scenario: Ashwagandha Journey
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3" data-testid="pilot-step-1">
                    <div className="badge badge-success">1</div>
                    <span>Rural farm collection with GPS coordinates</span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="pilot-step-2">
                    <div className="badge badge-success">2</div>
                    <span>Traditional drying and cleaning process</span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="pilot-step-3">
                    <div className="badge badge-success">3</div>
                    <span>Lab testing for purity and potency</span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="pilot-step-4">
                    <div className="badge badge-success">4</div>
                    <span>Product packaging with QR codes</span>
                  </div>
                  <div className="flex items-center gap-3" data-testid="pilot-step-5">
                    <div className="badge badge-success">5</div>
                    <span>Consumer scan reveals full journey</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-padding" style={{background: 'var(--primary)', color: 'white'}}>
        <div className="container text-center">
          <h3 className="mb-4">Ready to Transform Herb Traceability?</h3>
          <p className="mb-6" style={{opacity: 0.9}}>
            Join the blockchain revolution in Ayurvedic medicine supply chains
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/collect" className="btn btn-accent" data-testid="footer-get-started-btn">
              Get Started Today
            </Link>
            <Link to="/dashboard" className="btn btn-secondary" data-testid="footer-learn-more-btn">
              Learn More
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;