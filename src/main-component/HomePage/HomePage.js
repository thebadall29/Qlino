import React, { Fragment } from 'react';
import Hero from '../../components/hero/hero';
import Header from '../../components/header/Header';
import ServiceSection from '../../components/ServiceSection/ServiceSection';
import MarqueeSection from '../../components/MarqueeSection/MarqueeSection';
import Footer2 from '../../components/footer2/Footer2';
import CompoOneForSearchSection from '../../components/CompoForSearch/CompoOneForSearchSection';
import MedicineReminder from '../../components/CompoForSearch/MedicineRemeinder';
import MedicalRecord from '../../components/CompoForSearch/MedicalRecord';
import QlinoApp from '../../components/CompoForSearch/QlinoApp';

const HomePage = () => {

    return (
        <Fragment>
            <div className="dark-page">
                <Header />
                <Hero />
                <CompoOneForSearchSection/>
                <MarqueeSection />
                <MedicineReminder/>
                <ServiceSection />
              <MedicalRecord/>
              <QlinoApp/>
            
                <Footer2 /> 
            </div>
        </Fragment>
    )
};
export default HomePage;