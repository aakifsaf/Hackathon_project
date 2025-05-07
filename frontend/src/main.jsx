import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import CareerAssessmentPage from './pages/CareerAssessmentPage';
import CareerGuidancePage from './pages/CareerGuidancePage';
import LoginPage from './pages/LoginPage';
import PersonalDetailsPage from './pages/PersonalDetailsPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/career-assess" element={<CareerAssessmentPage />} />
        <Route path="/career-guidance" element={<CareerGuidancePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/personal-details" element={<PersonalDetailsPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
