import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer2/Footer2';
import './AppointmentHeaderTab.scss';
import AppointmentHeaderTabCompo from '../../components/AppointmentHeaderTab/AppointmentHeaderTab';

const AppointmentHeaderTab = () => {
  return (
    <div className="page-wrapper">
      <Header />
      <div className="content-wrapper">
        <AppointmentHeaderTabCompo/>
      </div>
      <Footer />
    </div>
  );
};

export default AppointmentHeaderTab;