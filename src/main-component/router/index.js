import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Homepage from '../HomePage/HomePage';
import AboutUsPage from '../AboutUsPage/AboutUsPage';
import TeamPage from '../TeamPage/TeamPage';
import ServiceSinglePage from '../ServiceSinglePage/ServiceSinglePage';
import ServicePage from '../ServicePage/ServicePage';
import PricingPage from '../PricingPage/PricingPage';
import BlogGridPage from '../BlogGridPage/BlogGridPage';
import BlogRightPage from '../BlogRightPage/BlogRightPage';
import BlogLeftPage from '../BlogLeftPage/BlogLeftPage';
import BlogFullPage from '../BlogFullPage/BlogFullPage';
import BlogDetails from '../BlogDetails/BlogDetails';
import ContactPage from '../ContactPage/ContactPage';

import BlogDetailsSidebar from '../BlogDetailsSidebar/BlogDetailsSidebar';
import SearchDoctor from '../SearchDoctor/SearchDoctor';
import PatientLogin from '../PatientLogin/PatientLogin';
import PatientDashboard from '../PatientDashboard/PatientDashboard';
import DoctorDashboard from '../DoctorDashboard/DoctorDashboard';
import Unauthorized from "../../components/ErrorPage/Unauthorized";
import DoctorLogin from '../../components/DoctorLogin/DoctorLogin';
import DoctorLoginComp from '../DoctorLogin/DoctorLogin';
import MedicalRecords from '../MedicalRecords/MedicalRecords';
import AppointmentHeaderTab from '../AppointmentHeaderTab/AppointmentHeaderTab';
import SymptomCheckerCompo from '../SymtomsChecker/SymptomChecker';
import DoctorSpecialtiesComp from '../DoctorSpecialties/DoctorSpecialties';
import DoctorListComp from '../DoctorList/DoctorList';
import TagsSearchCompo from '../TagsSearch/TagsSearch';
import TagDoctorListCompo from '../TagDoctorList/TagDoctorLIst';

// Protected route component for patient
const PatientProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!token || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/patient-login" replace />;
  }
  
  // Verify that user is a patient
  if (user.role !== 'patient') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Protected route component for doctor
const DoctorProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!token || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/doctor-login" replace />; // Create a doctor login page
  }
  
  // Verify that user is a doctor
  if (user.role !== 'doctor') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

const AllRoute = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="home" element={<Homepage />} />
          <Route path="about-us" element={<AboutUsPage />} />
          <Route path="services" element={<ServicePage />} />
          <Route path="service-single/:slug" element={<ServiceSinglePage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="blog-grid" element={<BlogGridPage />} />
          <Route path="blog-right-sidebar" element={<BlogRightPage />} />
          <Route path="blog-left-sidebar" element={<BlogLeftPage />} />
          <Route path="blog-fullwidth" element={<BlogFullPage />} />
          <Route path="blog-single/:slug" element={<BlogDetails />} />
          <Route path="blog-single-sidebar/:slug" element={<BlogDetailsSidebar />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="find-your-doctor" element={<SearchDoctor/>} />
          <Route path="patient-login" element={<PatientLogin/>} />
          <Route path="doctor-login" element={<DoctorLoginComp/>} /> {/* Create a doctor login component later */}
          <Route path="unauthorized" element={<Unauthorized />} />
          {/* <Route path="medical-records" element={<MedicalRecords />} /> */}
          {/* <Route path="appointments" element={<AppointmentHeaderTab />} /> */}
          <Route path="find-specialist" element={<SymptomCheckerCompo/>} />
          <Route path="specialties" element={<DoctorSpecialtiesComp/>} />
          <Route path="/:specialty/doctors" element={<DoctorListComp/>} />
          <Route path="/search-problem/:tag" element={<TagDoctorListCompo />} />
        <Route path="/search-problem" element={<TagsSearchCompo />} />
          
          {/* Protected routes */}
          <Route 
            path="patient-dashboard" 
            element={
              <PatientProtectedRoute>
                <PatientDashboard />
              </PatientProtectedRoute>
            } 
          />
          <Route 
            path="doctor-dashboard" 
            element={
              <DoctorProtectedRoute>
                <DoctorDashboard />
              </DoctorProtectedRoute>
            } 
          />
           <Route 
        path="/appointments" 
        element={
          <PatientProtectedRoute>
            <AppointmentHeaderTab />
          </PatientProtectedRoute>
        } 
      />
      <Route 
        path="/medical-records" 
        element={
          <PatientProtectedRoute>
            <MedicalRecords />
          </PatientProtectedRoute>
        } 
      />
          
          {/* 404 route */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default AllRoute;