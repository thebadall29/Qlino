import React, { useState, useEffect } from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer2/Footer2';
import MedicalRecordsCompo from '../../components/MedicalRecords/MedicalRecords';

const MedicalRecords = () => {
 
  return (
    <div>
      {/* Header stays in its normal position */}
      <Header />
      
      {/* Animate the main content first */}
     <MedicalRecordsCompo/>
      
      {/* Footer slides up after content animation */}
        <Footer />
    </div>
  );
};

export default MedicalRecords;