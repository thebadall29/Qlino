import React, { Fragment } from 'react';
import Header from '../../components/header/Header';
import PageTitle from '../../components/pagetitle/PageTitle'
import BlogList from '../../components/BlogList';
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import NewsLatter from '../../components/NewsLatter/NewsLatter';

const BlogLeftPage = (props) => {

    return (
        <Fragment>
            <Header hclass={'header-style-3'} />
            <PageTitle pageTitle={'Blog'} pagesub={'blog'} />
            <BlogList blLeft={'order-lg-1'} blRight={'order-lg-2'}/>
            <NewsLatter />
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default BlogLeftPage;
