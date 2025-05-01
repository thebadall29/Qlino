import React from 'react';
import event from '../../images/event/left-img.png'
import eImg1 from '../../images/event/icon1.png'
import eImg2 from '../../images/event/icon2.png'
import eImg3 from '../../images/event/icon3.png'
import eImg4 from '../../images/event/icon4.png'

const EventSection = (props) => {

    return (
        <section className="event-section">
            <h2 className="hidden">some</h2>
            <div className="container">
                <div className="row">
                    <div className="col-lg-6 col-md-12 col-12">
                        <div className="event-left-img">
                            <img src={event} alt=""/>
                                <div className="inner-shape">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 472" fill="none">
                                        <path fillRule="evenodd" clipRule="evenodd"
                                            d="M541.754 265.184C529.399 281.456 513.38 294.521 499.426 309.445C481.258 328.873 466.573 351.549 456.274 376.074C445.618 401.451 438.942 429.86 419.326 449.166C391.105 476.941 344.494 476.364 307.932 461.164C250.86 437.439 210.464 385.595 179.537 332.083C173.326 321.335 167.026 310.032 156.765 303.046C138.11 290.347 113.269 295.748 90.8015 297.864C74.8318 299.369 58.1997 298.827 43.535 292.328C21.5726 282.594 6.85862 260.256 2.09768 236.71C-2.66325 213.164 1.45623 188.584 9.15743 165.829C30.2762 103.429 78.9178 51.4092 138.749 23.8431C198.581 -3.72299 268.688 -7.08931 331.684 12.1765C359.284 20.6172 386.408 33.849 405.031 55.8981C421.458 75.3465 430.388 100.572 448.424 118.539C465.692 135.742 489.383 144.445 510.88 155.936C532.377 167.426 553.673 184.299 558.568 208.177C562.671 228.192 554.109 248.912 541.754 265.184Z"
                                            fill="" />
                                    </svg>
                                </div>
                        </div>
                    </div>
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
                </div>
            </div>
        </section>
    );
}

export default EventSection;