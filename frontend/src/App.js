import React, { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CollectionPage from "./pages/CollectionPage";
import ProcessingPage from "./pages/ProcessingPage";
import TestingPage from "./pages/TestingPage";
import ScanPage from "./pages/ScanPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collect" element={<CollectionPage />} />
          <Route path="/process" element={<ProcessingPage />} />
          <Route path="/test" element={<TestingPage />} />
          <Route path="/scan/:batchId" element={<ScanPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
