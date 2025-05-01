import React from 'react';
import { Slide } from "react-awesome-reveal";
import Teams from '../../api/team'
import { Link } from "react-router-dom";
import shape from '../../images/animated-shape/shape-2.png'

const TeamSection = (props) => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    return (

        <section className="team-section section-padding pt-0">
            <div className="container">
                <div className="team-wrap">
                    <div className="row">
                        {Teams.slice(0, 3).map((team, tm) => (
                            <div className="col col-lg-4 col-md-6 col-sm-6 col-12" key={tm}>
                                <Slide direction='up' triggerOnce={'false'}>
                                    <div className="team-item">
                                        <div className="team-img">
                                            <img className="imageParallax" src={team.tImg} alt="" />
                                        </div>
                                        <div className="team-text">
                                            <h3><Link onClick={ClickHandler} to={`/team-single/${team.slug}`}>{team.name}</Link></h3>
                                            <span>{team.title}</span>
                                        </div>
                                    </div>
                                </Slide>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flower-shape">
                <img src={shape} alt="" />
            </div>
        </section>
    );
}

export default TeamSection;