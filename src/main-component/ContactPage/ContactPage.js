import React, { Fragment } from 'react';
import Header from '../../components/header/Header';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import ContactArea from '../../components/ContactArea';
import NewsLatter from '../../components/NewsLatter/NewsLatter';
import Footer2 from '../../components/footer2/Footer2';

const ContactPage = (props) => {

    return (
        <Fragment>
            <div className='dark-page'>
            <Header  />
            <PageTitle pageTitle={'Contact Us'} pagesub={'contact'} />
            <ContactArea/>
            <NewsLatter />
            <Footer2 />
            <Scrollbar />
            </div>
        </Fragment>
    )
};
export default ContactPage;
