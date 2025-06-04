import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer2/Footer2';
import DoctorList from '../../components/DoctorList/DoctorList';

const DoctorListComp = () => {
  return (
    <>
    <Header />
    <DoctorList/>
    <Footer />
    </>
  );
};

export default DoctorListComp;