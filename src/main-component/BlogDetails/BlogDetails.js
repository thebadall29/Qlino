import React, { Fragment } from 'react';
import Header from '../../components/header/Header';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import BlogSingle from '../../components/BlogDetails/BlogDetails';
import Footer from '../../components/footer/Footer';


const BlogDetails = () => {

    return (
        <Fragment>
            <Header hclass={'header-style-3'}/>
            <PageTitle pageTitle={'Blog Details'} pagesub={'Blog'} />
            <BlogSingle blLeft={'d-none'} blRight={'col-lg-12'}/>
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default BlogDetails;
