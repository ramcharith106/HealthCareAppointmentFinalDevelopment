import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Page Imports
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DoctorsList from './pages/Doctors/DoctorsList';
import DoctorProfile from './pages/Doctors/DoctorProfile';
import PatientDashboard from './pages/patients/PatientDashboard';
import DoctorDashboard from './pages/Doctors/DoctorDashboard';
import Specialties from './pages/Specialties';
import DoctorOnboarding from './pages/Doctors/DoctorOnboarding'; // <-- IMPORT NEW PAGE

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* General Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/specialties" element={<Specialties />} />
              
              {/* Auth Pages */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />

              {/* Doctor Pages */}
              <Route path="/doctors" element={<DoctorsList />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/onboarding" element={<DoctorOnboarding />} /> {/* <-- ADD ONBOARDING ROUTE */}

              {/* Patient Pages */}
              <Route path="/dashboard" element={<PatientDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;