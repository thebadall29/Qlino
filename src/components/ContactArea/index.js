import React from 'react'
import ContactForm from '../ContactFrom/ContactForm'


const ContactArea = (props) => {
    return (
        <div className="contact-page-wrap">
            <section className="map-section" >
                <h2 className="hidden">Contact map</h2>
                <div className="map">
                    {/* <iframe title='map'
                        src="https://maps.google.com/maps?q=university%20of%20san%20francisco&amp;t=&amp;z=13&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
                        allowFullScreen></iframe> */}

<iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3667.3627552266244!2d77.34077957344604!3d23.193447009933458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c5cfb371a56eb%3A0xe6896c000a9fc21c!2sNeelbad%20Chauraha%2C%20Neelbad%2C%20Bhopal%2C%20Madhya%20Pradesh%20462044!5e0!3m2!1sen!2sin!4v1716717093390!5m2!1sen!2sin"
        width="600"
        height="200"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="map"
      ></iframe>
                </div>
            </section >
            <section className="contact-page section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-9">
                            <div className="section-title-s3">
                                <span style={{"color":"white"}}>News Letter</span>
                                <h2  style={{"color":"white"}}>Subscribe to our newsletter for updates</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col-lg-6">
                            <div className="office-info">
                                <h3>Malmo office</h3>
                                <div className="row">
                                    <div className="col col-xl-6 col-lg-6 col-md-6 col-12">
                                        <div className="office-info-item">
                                            <div className="office-info-text">
                                                <ul>
                                                    <li><i className="fi flaticon-phone-call"></i>+91 9174152696
                                                    </li>
                                                    <li><i className="fi flaticon-email"></i> contact@cloudspax.com
                                                    </li>
                                                    <li><i className="fi flaticon-placeholder"></i> Neelbad Road, 462044 Bhopal</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="col col-xl-6 col-lg-6 col-md-6 col-12">
                                        <div className="office-info-item">
                                            <div className="office-info-text">
                                                <ul>
                                                    <li><i className="fi flaticon-phone-call"></i> (406) 555-0120</li>
                                                    <li><i className="fi flaticon-email"></i> nathan.rober@example.com
                                                    </li>
                                                    <li><i className="fi flaticon-placeholder"></i> 3517 W. Gray St.
                                                        Utica, Pennsylvania 57867</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="contact-form-area">
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ContactArea;