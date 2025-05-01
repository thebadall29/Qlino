import React from 'react'
import { Link } from 'react-router-dom'

const PageTitle = (props) => {
    return (
        <section className="page-title">
            <div className="container">
                <div className="row">
                    <div className="col col-xs-12">
                        <div className="breadcumb-wrap">
                            <h2>{props.pageTitle}</h2>
                            <ol>
                                <li><Link to="/">home</Link></li>
                                <li>{props.pagesub}</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PageTitle;