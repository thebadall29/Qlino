import React, { Fragment } from 'react';
import Header from '../../components/header/Header';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import { Link } from 'react-router-dom'
import Services from '../../api/service'
import VideoSectionS2 from '../../components/VideoSectionS2/VideoSectionS2';
import ExprienceService from '../../components/ExprienceService/ExprienceService';
import NewsLatter from '../../components/NewsLatter/NewsLatter';
import Footer2 from '../../components/footer2/Footer2'

const ClickHandler = () => {
    window.scrollTo(10, 0);
}


const ServicePage = (props) => {

    return (
        <Fragment>
            <div className="dark-page">

            <Header/>
            <PageTitle pageTitle={'our-services'} pagesub={'service'} />
            <section className="service-page section-padding pb-0">
                <div className="service-section-s2 section-padding pt-0">
                    <div className="container">
                        <div className="service-wrap">
                            <div className="row">
                                {Services.slice(1, 5).map((service, srv) => (
                                    <div className="col col-lg-3 col-md-6 col-12" key={srv}>
                                        <div className="service-item">
                                            <i><img src={service.sIcon} alt="" /></i>
                                            <h2><Link onClick={ClickHandler} to={`/service-single/${service.slug}`}>{service.title}</Link></h2>
                                            <p>{service.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <VideoSectionS2 />
                <ExprienceService sTitle={'section-title-s3 text-center'}/>
            </section>
            <NewsLatter />
            <Footer2 />
            <Scrollbar />
            </div>
        </Fragment>
    )
};
export default ServicePage;
