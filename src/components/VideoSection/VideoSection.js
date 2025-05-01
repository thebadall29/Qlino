import React, { useState } from 'react'
import ModalVideo from 'react-modal-video'
import vImg1 from '../../images/video/video.jpg'
import btn from '../../images/video/btn.png'
import shape1 from '../../images/video/star.png'
import shape2 from '../../images/video/arrow.png'


const VideoSection = (props) => {
    const [isOpen, setOpen] = useState(false)
    return (
        <section className="video-section section-padding pt-0">
            <div className="container">
                <div className="video-wrap">
                    <img className="imageParallax" src={vImg1} alt=""/>
                    <button className="video-btn" onClick={() => setOpen(true)}><i><img src={btn} alt=""/></i></button>
                </div>
            </div>
            <div className="star-shape">
                <img src={shape1} alt=""/>
            </div>
            <div className="arrow-shape">
                <img src={shape2} alt=""/>
            </div>
            <ModalVideo channel='youtube' autoplay isOpen={isOpen} videoId="-2Nyl5ctKJQ" onClose={() => setOpen(false)} />
        </section>
    )
}

export default VideoSection;