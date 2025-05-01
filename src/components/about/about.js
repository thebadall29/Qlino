import React from 'react';
import sign from '../../images/about/sign.png'
import shape from '../../images/about/flower.png'
import shape2 from '../../images/about/round.png'
import about from '../../images/about/about.png'
import CountUp from 'react-countup';


const About = (props) => {

    return (
        <section className="about-section section-padding">
            <div className="container">
                <div className="about-wrap">
                    <div className="about-content">
                        <div className="about-top">
                            <i><img src={shape} alt=""/></i>
                            <span>Introduction of Myself</span>
                        </div>
                        <p>I'm a Brand & Envato Designer, Currently residing in the lush Victoria Street London,
                            Matias operates globally and is ready to take on any design challenge.</p>
                        <div className="about-info">
                            <i><img src={sign} alt=""/></i>
                            <span>CEO Unded</span>
                        </div>
                    </div>
                </div>
                <div className="fun-fact-wrap">
                    <div className="info">
                        <h3><span><CountUp end={16} enableScrollSpy /></span></h3>
                        <p>Client Worldwide</p>
                    </div>
                    <div className="info">
                        <h3><span><CountUp end={135} enableScrollSpy /></span></h3>
                        <p>Project Complete</p>
                    </div>
                    <div className="info">
                        <h3><span><CountUp end={28} enableScrollSpy /></span></h3>
                        <p>Award <br/> Winning</p>
                    </div>
                </div>
            </div>
            <div className="round-shape">
                <img src={shape2} alt=""/>
            </div>
            <div className="left-image">
                <img src={about} alt=""/>
            </div>
        </section>
    )
}

export default About;