import React, { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CollectionPage from "./pages/CollectionPage";
import ProcessingPage from "./pages/ProcessingPage";
import TestingPage from "./pages/TestingPage";
import PackagingPage from "./pages/PackagingPage";
import DistributionPage from "./pages/DistributionPage";
import ScanPage from "./pages/ScanPage";
import QRScannerPage from "./pages/QRScannerPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collect" element={<CollectionPage />} />
          <Route path="/process" element={<ProcessingPage />} />
          <Route path="/test" element={<TestingPage />} />
          <Route path="/package" element={<PackagingPage />} />
          <Route path="/distribute" element={<DistributionPage />} />
          <Route path="/scan/:batchId" element={<ScanPage />} />
          <Route path="/scanner" element={<QRScannerPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
