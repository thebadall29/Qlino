import React from 'react';
import MedicalRecords from '../../MedicalRecords/MedicalRecords';

const MedicalRecordsTab = () => {
  return (
    <div className="medical-records-tab">
      <div className="tab-header">
        <h2>Medical Records</h2>
      </div>
      <div className="tab-content">
        <MedicalRecords />
      </div>
    </div>
  );
};

export default MedicalRecordsTab;