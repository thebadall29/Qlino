import React from 'react'
import ContactForm from '../ContactFrom/ContactForm'
import shape from '../../images/animated-shape/clover.png'


const ContactSection = (props) => {
    return (
        <section className="contact-area section-padding">
            <div className="container">
                <div className="contact-area-wrapper">
                    <div className="row">
                        <div className="col col-xl-5 col-lg-6">
                            <div className="contact-info-wrap">
                                <div className="contact-info-title">
                                    <h3>Contact Info</h3>
                                    <p>Use high-quality images and videos to create a visually</p>
                                </div>
                                <div className="contact-info-item">
                                    <div className="contact-info-icon">
                                        <i className="fi flaticon-phone-call"></i>
                                    </div>
                                    <div className="contact-info-text">
                                        <span>Have Any Question?</span>
                                        <h4>Phone</h4>
                                    </div>
                                </div>
                                <div className="contact-info-item">
                                    <div className="contact-info-icon">
                                        <i className="fi flaticon-email"></i>
                                    </div>
                                    <div className="contact-info-text">
                                        <span>Send Email</span>
                                        <h4>wkrebs@verizon.net</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col col-xl-7 col-lg-6 col-md-12 col-12">
                            <ContactForm />
                        </div>
                    </div>
                </div>
                <div className="clover-shape"><img src={shape} alt=""/></div>
            </div>
        </section>
    )
}

export default ContactSection;