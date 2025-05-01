import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer2/Footer2';
import PatientDashboardCompo from '../../components/PatientDashboad/PatientDashboard';


const PatientDashboad = () => {
  return (
    <>
    <Header />
    <PatientDashboardCompo/>
    <Footer />
    </>
  );
};

export default PatientDashboad;