import React, { Fragment } from 'react';
import Header from '../../components/header/Header';
import PageTitle from '../../components/pagetitle/PageTitle'
import BlogList from '../../components/BlogList';
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import NewsLatter from '../../components/NewsLatter/NewsLatter';

const BlogFullPage = (props) => {

    return (
        <Fragment>
            <Header hclass={'header-style-3'} />
            <PageTitle pageTitle={'Blog'} pagesub={'blog'} />
            <BlogList blLeft={'d-none'} blRight={'col-lg-10 offset-lg-1'}/>
            <NewsLatter />
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default BlogFullPage;
