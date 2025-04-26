import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PersonalDetailsPage from './pages/PersonalDetailsPage';
import CareerAssessmentPage from './pages/CareerAssessmentPage';
import CareerGuidancePage from './pages/CareerGuidancePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/personal-details" element={<PersonalDetailsPage />} />
        <Route path="/career-assess" element={<CareerAssessmentPage />} />
        <Route path="/career-guidance" element={<CareerGuidancePage />} />
      </Routes>
    </Router>
  );
}

export default App;
