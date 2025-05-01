import React from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../images/icon/icon.png'
import shape from '../../images/animated-shape/shape-2.png'

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const Expriences = [
    {
        title: 'Video editing',
        des: 'We are helping client to edit thier video.',
        li1: 'Long Form Content',
        li2: 'Short Form Content',
        li3: 'Podcast',
    },
    {
        title: 'Thombnail design',
        des: 'We are helping client to create youtube thombnail.',
        li1: 'Youtube',
        li2: 'Insta reels poster',
        li3: 'Story',
    },


]

const ExprienceService = (props) => {
    return (
        <section className={`exprience-service section-padding ${props.eClass}`}>
            <div className="container">
                <div className="exprience-service-wrap">
                    <div  className={`section-title-s2 ${props.sTitle}`}>
                        <span style={{"color":"#fff"}}>MY Expereince resume</span>
                        <h2 style={{"color":"#fff"}}>My services area</h2>
                    </div>

                    {
                        Expriences.map((exprience, exp) => (
                            <div className="exprience-service-item" key={exp}>
                                <ul>
                                    <li>
                                        <i>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="47" height="47" viewBox="0 0 47 47" fill="none">
                                                <path d="M29.664 32.6749L29.5184 32.7358L29.4342 32.8694L22.0957 44.505L23.0696 32.7553L23.1368 31.9448L22.3833 32.2507L8.69045 37.8098L18.194 29.1448L19.2063 28.2218L17.8374 28.2757L3.14378 28.8544L14.3155 24.7429L15.1811 24.4244L14.4418 23.8729L1.93762 14.5449L15.4912 16.7489L16.0714 16.8432V16.2554V3.27986L20.9599 16.4296L21.3205 17.3996L21.8563 16.5142L28.8323 4.98773L26.3663 17.7076L26.0596 19.2899L27.208 18.159L36.4345 9.07359L29.4338 20.2094L28.6277 21.4916L30.0387 20.9413L41.2144 16.583L29.552 25.5656L28.3885 26.4617H29.8571H44.5101L29.664 32.6749Z"></path>
                                            </svg>
                                        </i>
                                        <b>{exprience.title}</b>
                                    </li>
                                    <li>
                                        <p>{exprience.des}</p>
                                    </li>
                                    <li>
                                        <span style={{"color":"#828282"}}><i><img src={Icon} alt=""/></i>{exprience.li1}</span>
                                        <span style={{"color":"#828282"}}><i><img src={Icon} alt=""/></i>{exprience.li2}</span>
                                        <span style={{"color":"#828282"}}><i><img src={Icon} alt=""/></i>{exprience.li3}</span>
                                    </li>
                                    <li><Link onClick={ClickHandler} to="/services" className="arrow-btn"><i className="ti-arrow-top-right"></i></Link></li>
                                </ul>
                            </div>
                        ))
                    }

                </div>
                <div className="flower-shape">
                    <img src={shape} alt=""/>
                </div>
            </div>
        </section>
    )
}

export default ExprienceService;