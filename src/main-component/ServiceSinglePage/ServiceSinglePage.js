import React, { Fragment } from 'react';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import { useParams } from 'react-router-dom'
import Services from '../../api/service'
import sImg1 from '../../images/service/img-1.jpg'
import sImg2 from '../../images/service/img-2.jpg'
import BlogSidebar from './sidebar';
import NewsLatter from '../../components/NewsLatter/NewsLatter';
import eImg1 from '../../images/event/icon1.png'
import eImg2 from '../../images/event/icon2.png'
import eImg3 from '../../images/event/icon3.png'
import eImg4 from '../../images/event/icon4.png'
import eImg from '../../images/event/right-img.png'
import Header from '../../components/header/Header'
import Footer2 from '../../components/footer2/Footer2'

const ServiceSinglePage = (props) => {
    const { slug } = useParams()

    const ServiceDetails = Services.find(item => item.slug === slug)

    return (
        <Fragment>
            <div className="dark-page">
            <Header/>
            <PageTitle pageTitle={ServiceDetails.title} pagesub={'Project'} />
            <section className="service-single-page section-padding pb-0">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 order-lg-2 order-1">
                            <div className="service-single-wrap" >
                                <h2 style={{"color":"#FF4A3B"}}>{ServiceDetails.title}</h2>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam a nisi et libero
                                    sodales dictum sit amet eu neque. Donec luctus, arcu eget viverra varius, nisi
                                    mi imperdiet nisl, quis porta lorem arcu a mi. Fusce pellentesque vehicula erat,
                                    nec blandit odio accumsan eget. Nam sem massa, venenatis ut nibh nec, tincidunt
                                    posuere metus. Sed rhoncus ut massa id ultrices. Praesent lacus enim, vulputate
                                    eget mi in, tincidunt solli citudin erat. Nullam bibendum cons ectetur odio nec
                                    blandit. In varius non lectus vitae interdum. Etiam quam erat, semper sit amet
                                    volutpat a, vestibulum ac odio. Quisque sit amet augue vel augue cursus commodo
                                    et eu eros. Praesent eget libero tincidunt, suscipit tellus quis, mollis lacus.
                                    Suspe ndisse ullamcorper nisl et mattis vestibulum. Nulla vel sodales lorem, id
                                    tristique felis. Sed eu pharetra orci, eu placerat risus. Duis congue enim
                                    molestie, tempor augue id, rhoncus odio vehicula.
                                    Nunc nec diam at diam tincidunt vehicula eget nec enim. Sed ultrices viverra
                                    augue, quis fermentum magna semper ac.</p>
                                <div className="inner-img">
                                    <div className="row">
                                        <div className="col-sm-6 col-12">
                                            <img src={sImg1} alt="" />
                                        </div>
                                        <div className="col-sm-6 col-12">
                                            <img src={sImg2} alt="" />
                                        </div>
                                    </div>
                                </div>
                                <p> Duis suscipit enim nec mauris dictum, eget finibus eros tincidunt. Quisque
                                    consectetur ven enatis metus, sagittis tincidunt sem volutpat sit amet.
                                    Pellentesque nibh velit, fermentum non elit eu, volutpat sagittis dui. Quisque
                                    sagittis augue nunc, in interdum elit volutpat suscipit. Vesti bulum quis
                                    facilisis magna. Nam accumsan, ipsum et vehicula sodales, nibh risus ultrices
                                    risus, pellentesque sodales nibh eros vitae nisl.</p>
                            </div>
                            {/* <div className="event-section">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-lg-5 col-md-6 col-sm-6 col-12">
                                            <div className="event-items">
                                                <h3>Awards</h3>
                                                <div className="event-item">
                                                    <div className="icon"><img src={eImg1} alt="" /></div>
                                                    <div className="text">
                                                        <h4>awwards AWARD</h4>
                                                        <span>June 2023</span>
                                                    </div>
                                                </div>
                                                <div className="event-item">
                                                    <div className="icon"><img src={eImg2} alt="" /></div>
                                                    <div className="text">
                                                        <h4>Campaign AWARD</h4>
                                                        <span>June 2013</span>
                                                    </div>
                                                </div>
                                                <div className="event-item">
                                                    <div className="icon"><img src={eImg3} alt="" /></div>
                                                    <div className="text">
                                                        <h4>Animation AWARD</h4>
                                                        <span>Aug 2010</span>
                                                    </div>
                                                </div>
                                                <div className="event-item">
                                                    <div className="icon"><img src={eImg4} alt="" /></div>
                                                    <div className="text">
                                                        <h4>Peach Of the day</h4>
                                                        <span>Aug 2000</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-5 col-md-6 col-sm-6 col-12">
                                            <div className="event-items">
                                                <h3>Events</h3>
                                                <div className="event-item">
                                                    <div className="text">
                                                        <h4>CES 2021</h4>
                                                        <span>February 2023</span>
                                                    </div>
                                                </div>
                                                <div className="event-item">
                                                    <div className="text">
                                                        <h4>Campaign ARTS</h4>
                                                        <span>June 2013</span>
                                                    </div>
                                                </div>
                                                <div className="event-item">
                                                    <div className="text">
                                                        <h4>Tokiko Art</h4>
                                                        <span>Aug 2010</span>
                                                    </div>
                                                </div>
                                                <div className="event-item">
                                                    <div className="text">
                                                        <h4>Best Design Award</h4>
                                                        <span>Aug 2000</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-12 col-12">
                                            <div className="event-left-img">
                                                <img src={eImg} alt=""/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> */}

                        </div>
                        <BlogSidebar />
                    </div>
                </div>
            </section>
            <NewsLatter />
            <Footer2 />
            <Scrollbar />
            </div>
        </Fragment>
    )
};
export default ServiceSinglePage;
