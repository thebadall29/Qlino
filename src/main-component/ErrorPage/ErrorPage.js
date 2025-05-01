import React, { Fragment } from 'react';
import Header from '../../components/header/Header';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import NewsLatter from '../../components/NewsLatter/NewsLatter';
import Error from '../../components/404';

const ErrorPage = (props) => {

    return (
        <Fragment>
            <Header hclass={'header-style-3'} />
            <PageTitle pageTitle={'Error 404'} pagesub={'404'} />
            <Error/>
            <NewsLatter />
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default ErrorPage;
