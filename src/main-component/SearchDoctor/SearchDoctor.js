import React from 'react';
import Header from '../../components/header/Header';
import SearchSection from '../../components/Doctor Search/SearchSection';
import Footer from '../../components/footer2/Footer2';
import CompoOneForSearchSection from '../../components/CompoForSearch/CompoOneForSearchSection';
import MedicineReminder from '../../components/CompoForSearch/MedicineRemeinder';
import MarqueeSection from '../../components/MarqueeSection/MarqueeSection';
import MedicalRecord from '../../components/CompoForSearch/MedicalRecord';
import QlinoApp from '../../components/CompoForSearch/QlinoApp';

const SearchDoctor = () => {
  return (
    <>
    <Header />
    <SearchSection />
    <CompoOneForSearchSection/>
    <MarqueeSection/>
    <MedicineReminder/>
    <MedicalRecord/>
    <QlinoApp/>
    <Footer />
    </>
  );
};

export default SearchDoctor;