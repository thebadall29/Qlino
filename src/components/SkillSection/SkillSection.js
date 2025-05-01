import React from 'react'
import { Slide } from "react-awesome-reveal";
import Icon from '../../images/skill/left.png'
import sicon1 from '../../images/skill/1.png'
import sicon2 from '../../images/skill/2.png'
import sicon3 from '../../images/skill/3.png'
import sicon4 from '../../images/skill/4.png'
import sicon5 from '../../images/skill/5.png'


const Skills = [
    {
        sIcon: sicon1,
        title: 'Figma',
        progress: '95',
    },
    {
        sIcon: sicon2,
        title: 'WprdPress',
        progress: '86',
    },
    {
        sIcon: sicon3,
        title: 'Framer',
        progress: '95',
    },
    {
        sIcon: sicon4,
        title: 'Python',
        progress: '90',
    },
    {
        sIcon: sicon5,
        title: 'Webflow',
        progress: '80',
    },

]

const SkillSection = (props) => {
    return (
        <section className={`skill-service section-padding  ${props.sClass}`} id='skill'>
            <div className="container">
                <div className={`section-title-s2  ${props.tClass}`}>
                    <span>My Skill</span>
                    <h2>Professional Skill</h2>
                </div>
                <div className="col-lg-10 offset-lg-2">
                    <div className="skill-wrap">
                        <div className="row">
                            {
                                Skills.map((skill, skl) => (
                                    <div className="col col-lg-4 col-md-6 col-12" key={skl}>
                                        <Slide direction='up' triggerOnce={'false'} duration={1200}>
                                            <div className="skill-item">
                                                <div className="icon">
                                                    <i><img src={skill.sIcon} alt="" /></i>
                                                </div>
                                                <div className="skill-text">
                                                    <h3>{skill.title}</h3>
                                                    <span>{skill.progress}%</span>
                                                </div>
                                            </div>
                                        </Slide>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="left-image">
                <img src={Icon} alt="" />
            </div>
        </section>
    )
}

export default SkillSection;