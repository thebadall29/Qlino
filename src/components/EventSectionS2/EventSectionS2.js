import React from 'react';
import event from '../../images/event/right-img.png'
import eImg1 from '../../images/event/icon1.png'
import eImg2 from '../../images/event/icon2.png'
import eImg3 from '../../images/event/icon3.png'
import eImg4 from '../../images/event/icon4.png'

const EventSectionS2 = (props) => {

    return (
        <section className="event-section">
            <h2 className="hidden">some</h2>
            <div className="container">
                <div className="row">
                    <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                        <div className="event-items">
                            <h3>Awards</h3>
                            <div className="event-item">
                                <div className="icon"><img src={eImg1} alt=""/></div>
                                <div className="text">
                                    <h4>awwards AWARD</h4>
                                    <span>June 2023</span>
                                </div>
                            </div>
                            <div className="event-item">
                                <div className="icon"><img src={eImg2} alt=""/></div>
                                <div className="text">
                                    <h4>Campaign AWARD</h4>
                                    <span>June 2013</span>
                                </div>
                            </div>
                            <div className="event-item">
                                <div className="icon"><img src={eImg3} alt=""/></div>
                                <div className="text">
                                    <h4>Animation AWARD</h4>
                                    <span>Aug 2010</span>
                                </div>
                            </div>
                            <div className="event-item">
                                <div className="icon"><img src={eImg4} alt=""/></div>
                                <div className="text">
                                    <h4>Peach Of the day</h4>
                                    <span>Aug 2000</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-6 col-12">
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
                    <div className="col-lg-6 col-md-12 col-12">
                        <div className="event-left-img">
                            <img src={event} alt=""/>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default EventSectionS2;