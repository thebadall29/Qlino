import React, { useState } from "react";
import { Link } from "react-router-dom";
import pImg1 from '../../images/project/sound.jpg'
import pImg2 from '../../images/project/color-grading.jpg'
import pImg3 from '../../images/project/typo.png'
import pImg4 from '../../images/project/cut.jpg'
import shape from '../../images/animated-shape/shape-1.png'


const CreativeService = (props) => {

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    const [hoveredImagePosition, setHoveredImagePosition] = useState({
        x: 0,
        y: 0,
    });

    const handleItemHover = (e) => {
        const boundingRect = e.target.getBoundingClientRect();
        setHoveredImagePosition({
            x: e.clientX - boundingRect.left,
            y: e.clientY - boundingRect.top,
        });
    };

    return (
        <section className="features-section section-padding">
            <h2 className="hidden">some</h2>
            <div className="container">
                <div className="features-wrap">
                    <div className="features-items" onMouseMove={handleItemHover}>
                        <Link onClick={ClickHandler} to="/services" className="features-item">Sound design
                            <span className="features-masking" style={{
                                transform: `translate(${hoveredImagePosition.x}px, ${hoveredImagePosition.y}px)`,
                            }}>
                                <img className="features-hoverImg" src={pImg1} alt="fimg" />
                            </span>
                        </Link>
                    </div>
                    <div className="features-items" onMouseMove={handleItemHover}>
                        <Link onClick={ClickHandler} to="/services" className="features-item" >Color Grading
                            <span className="features-masking" style={{
                                transform: `translate(${hoveredImagePosition.x}px, ${hoveredImagePosition.y}px)`,
                            }}>
                                <img className="features-hoverImg" src={pImg2} alt="fimg" />
                            </span>
                        </Link>
                    </div>
                    <div className="features-items" onMouseMove={handleItemHover}>
                        <Link onClick={ClickHandler} to="/services" className="features-item">Typography
                            <span className="features-masking" style={{
                                transform: `translate(${hoveredImagePosition.x}px, ${hoveredImagePosition.y}px)`,
                            }}>
                                <img className="features-hoverImg" src={pImg3} alt="fimg" />
                            </span>
                        </Link>
                    </div>
                    <div className="features-items" onMouseMove={handleItemHover}>
                        <Link onClick={ClickHandler} to="/services" className="features-item"> Smoth cuts
                            <span className="features-masking" style={{
                                transform: `translate(${hoveredImagePosition.x}px, ${hoveredImagePosition.y}px)`,
                            }}>
                                <img className="features-hoverImg" src={pImg4} alt="fimg" />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="round-shape">
                <img src={shape} alt="" />
            </div>
        </section>
    )
}

export default CreativeService;