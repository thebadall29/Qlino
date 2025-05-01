import React from 'react';

const SubmitHandler = (e) => {
    e.preventDefault();
};

const NewsLatter = () => {
    return (
        <section className="newsletter-section">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-9 col-md-12">
                        <div className="section-title-s3 text-center">
                            <span>News Letter</span>
                            <h2>Subscribe to our newsletter for updates</h2>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="newsletter-form">
                            <form onSubmit={SubmitHandler}>
                                <div className="form-field">
                                    <input 
                                        type="email" 
                                        placeholder="Your e-mail address" 
                                        id="semail"
                                        required
                                    />
                                    <button type="submit">
                                        <i className="fa-solid fa-paper-plane"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsLatter;
