import React, { Fragment } from 'react';
import Header from '../../components/header/Header';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer2 from '../../components/footer2/Footer2';
import NewsLatter from '../../components/NewsLatter/NewsLatter';
import Pricing from '../../components/Pricing';

const PricingPage = (props) => {

    return (
        <Fragment>
            <Header />
            <PageTitle pageTitle={'Pricing Plan'} pagesub={'pricing'} />
            <Pricing/>
            <NewsLatter />
            <Footer2 />
            <Scrollbar />
        </Fragment>
    )
};
export default PricingPage;
