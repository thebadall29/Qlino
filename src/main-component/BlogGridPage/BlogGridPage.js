import React, { Fragment } from 'react';
import Header from '../../components/header/Header';
import PageTitle from '../../components/pagetitle/PageTitle'
import BlogSection from '../../components/BlogGrid/BlogGrid';
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import NewsLatter from '../../components/NewsLatter/NewsLatter';

const BlogGridPage = (props) => {

    return (
        <Fragment>
            <Header hclass={'header-style-3'} />
            <PageTitle pageTitle={'Blog Grid'} pagesub={'blog'} />
            <div className="blog-grid-page">
                <BlogSection />
            </div>
            <NewsLatter />
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default BlogGridPage;
