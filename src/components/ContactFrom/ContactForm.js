import React, { useState } from 'react'
import SimpleReactValidator from 'simple-react-validator';


const ContactForm = (props) => {

    const [forms, setForms] = useState({
        name: '',
        email: '',
        subject: '',
        phone: '',
        message: ''
    });
    const [validator] = useState(new SimpleReactValidator({
        className: 'errorMessage'
    }));
    const changeHandler = e => {
        setForms({ ...forms, [e.target.name]: e.target.value })
        if (validator.allValid()) {
            validator.hideMessages();
        } else {
            validator.showMessages();
        }
    };

    const submitHandler = e => {
        e.preventDefault();
        if (validator.allValid()) {
            validator.hideMessages();
            setForms({
                name: '',
                email: '',
                subject: '',
                phone: '',
                message: ''
            })
        } else {
            validator.showMessages();
        }
    };

    return (
        <div className="contact-form-area">
            <form method="post" className="contact-activation" onSubmit={(e) => submitHandler(e)}>
                <div className="row">
                    <div className="col-md-6 col-12">
                        <div className="form-field">
                            <input
                                value={forms.name}
                                type="text"
                                name="name"
                                className="form-control"
                                onBlur={(e) => changeHandler(e)}
                                onChange={(e) => changeHandler(e)}
                                placeholder="Your Name*" />
                            {validator.message('name', forms.name, 'required|alpha_space')}
                        </div>
                    </div>
                    <div className="col-md-6 col-12">
                        <div className="form-field">
                            <input
                                value={forms.email}
                                type="email"
                                name="email"
                                className="form-control"
                                onBlur={(e) => changeHandler(e)}
                                onChange={(e) => changeHandler(e)}
                                placeholder="Your Email*" />
                            {validator.message('email', forms.email, 'required|email')}
                        </div>
                    </div>
                    <div className="col-md-6 col-12">
                        <div className="form-field">
                            <input
                                value={forms.phone}
                                type="phone"
                                name="phone"
                                className="form-control"
                                onBlur={(e) => changeHandler(e)}
                                onChange={(e) => changeHandler(e)}
                                placeholder="Your Phone*" />
                            {validator.message('phone', forms.phone, 'required|phone')}
                        </div>
                    </div>
                    <div className="col-md-6 col-12">
                        <div className="form-field">
                            <select
                                onBlur={(e) => changeHandler(e)}
                                onChange={(e) => changeHandler(e)}
                                value={forms.subject}
                                type="text"
                                className="form-control"
                                name="subject">
                                <option>Choose a Service</option>
                                <option>Web Design</option>
                                <option>Web Development</option>
                                <option>Marketing</option>
                            </select>
                            {validator.message('subject', forms.subject, 'required')}
                        </div>
                    </div>
                    <div className="fullwidth">
                        <div className="form-field">
                            <textarea
                                onBlur={(e) => changeHandler(e)}
                                onChange={(e) => changeHandler(e)}
                                value={forms.message}
                                type="text"
                                name="message"
                                className="form-control"
                                placeholder="Message...">
                            </textarea>
                            {validator.message('message', forms.message, 'required')}
                        </div>
                    </div>
                </div>
                <div className="submit-area">
                    <button type="submit" className='btn-style-1'><span>Send</span></button>
                </div>
            </form>
        </div>
    )
}

export default ContactForm;