import React from 'react'
import { Link } from 'react-router-dom'
import erimg from '../../images/404.svg'


const Error = (props) => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    return (
        <section className="opps-404-section section-padding">
            <div className="container">
                <div className="row">
                    <div className="col col-xs-12">
                        <div className="content clearfix">
                            <div className="error">
                                <img src={erimg} alt=""/>
                            </div>
                            <div className="opps-message">
                                <h3>Oops! Page Not Found!</h3>
                                <p>The requested URL was not found on this server. This might be
                                    because you have typed the web address incorrectly.</p>
                                <Link onClick={ClickHandler} to="/home" className="btn-style-2">Back to home</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Error;