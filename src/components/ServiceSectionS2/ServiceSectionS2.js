import React from 'react';
import Services from '../../api/service'
import { Link } from "react-router-dom";
import { Slide } from "react-awesome-reveal";


const ServiceSectionS2 = (props) => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    return (

        <section className={`service-section-s2 section-padding ${props.pClass}`} id='about'>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-9">
                        <div className="section-title-s3 text-center">
                            <span>Accusamus Et Iust</span>
                            <h2>The way we do things in our line of work.</h2>
                        </div>
                    </div>
                    <div className="col-lg-12">
                        <div className="service-wrap">
                            <div className="row">
                                {Services.slice(0, 6).map((service, srv) => (
                                    <div className="col col-lg-4 col-md-6 col-12" key={srv}>
                                        <Slide direction='up' triggerOnce={'false'}>
                                            <div className="service-item">
                                                <i><img src={service.sIcon} alt="" /></i>
                                                <h2><Link onClick={ClickHandler} to={`/service-single/${service.slug}`}>{service.title}</Link></h2>
                                                <p>{service.des2}</p>
                                            </div>
                                        </Slide>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ServiceSectionS2;