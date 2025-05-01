import React, { Fragment } from 'react';
import Header from '../../components/header/Header';
import PageTitle from '../../components/pagetitle/PageTitle'
import BlogList from '../../components/BlogList';
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import NewsLatter from '../../components/NewsLatter/NewsLatter';
import Footer2 from '../../components/footer2/Footer2';

const BlogRightPage = (props) => {

    return (
        <Fragment>
            <div className='dark-page'>
            <Header/>
            <PageTitle pageTitle={'Blog'} pagesub={'blog'} />
            <BlogList />
            <NewsLatter />
            <Footer2 />
            <Scrollbar />
            </div>
        </Fragment>
    )
};
export default BlogRightPage;
