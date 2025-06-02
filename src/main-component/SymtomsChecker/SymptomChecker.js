import React, { Fragment } from 'react';
import Header from '../../components/header/Header';

import Footer2 from '../../components/footer2/Footer2';
import SymptomChecker from '../../components/PatientDashboad/tabs/SymptomChecker';


const SymptomCheckerCompo = () => {

    return (
        <Fragment>
                <Header />
                <h1>this is the</h1>
                <SymptomChecker/>
                <Footer2 /> 
        </Fragment>
    )
};
export default SymptomCheckerCompo;