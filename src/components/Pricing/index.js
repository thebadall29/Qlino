import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, animate } from "framer-motion";

const Pricing = (props) => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }


    const pricing = [
        {
            fIcon: 'fi flaticon-medal',
            li1: 'Competitor Analysis',
            li2: 'Channel Setup',
            li3: 'Content Strategy',
            li4: 'Post Production',
            li5: 'Getting Leads from Content',
            title: 'Haven’t Started Yet',
            link: '/contact',
            price:'Process',
        },
        {
            fIcon: 'fi flaticon-stats',
            li1: 'Reoptimize youtube channel',
            li2: 'Refine Content Strategy',
            li3: 'Post Production',
            li4: 'Getting Traffic',
            li5: 'Getting ROI From Content',
            title: 'Struggling to Grow',
            link: '/contact',
            price:'Process',
        },
        {
            fIcon: 'fi flaticon-trophy',
            li1: 'Getting Decent View But Not getting Leads from it.',
            li2: 'Refine Content Strategy',
            li3: 'Post Production',
            li4: 'Start getting leads',
            title: 'No Leads/Clients',
            link: '/contact',
            price:'Process',
        },


    ]


    return (
        <section className="pricing-section section-padding">

<motion.span
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 1 }}
                                        
                                        className="branding-badge heading_line "
                                        style={{margin:"3rem auto",display:"block",width:"fit-content"}}
                                      >
                                        Who We Help
                                      </motion.span>
         {/* Background Shapes */}
      <div className="background__shapes">
        <div className="background-shape shape1"></div>
        <div className="background-shape shape2"></div>
        <div className="background-shape shape3"></div>
      </div>
            <div className="container">
           
                <div className="pricing-items" style={{width:"70vw",margin:"0 auto"}}>
                    <div className="row">
                    
                        {pricing.map((pricing, ptem) => (
                            <div className="process-box col-sm-6 col-lg-4 my-auto" key={ptem}>
                                <div className="pricing-item">
                                    <h2>{pricing.title}</h2>
                                    <div className="price-price">
                                        <h3><span>{pricing.price}</span></h3>
                                    </div>
                                    <ul>
                                        <li>{pricing.li1}</li>
                                        <li>{pricing.li2}</li>
                                        <li>{pricing.li3}</li>
                                        <li>{pricing.li4}</li>
                                        <li>{pricing.li5}</li>
                                    </ul>
                                    <Link className="btn-style-2" onClick={ClickHandler} to={pricing.link}>Choose Plan</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Pricing;