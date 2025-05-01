import React from 'react';
import { Link } from 'react-router-dom'
import Services from '../../api/service'
import blogs from '../../api/blogs'


const BlogSidebar = (props) => {
    
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    return (
        <div className="col-lg-4 col-md-8 col-12 order-lg-1 order-2">
            <div className="blog-sidebar" >
                <div style={{"background":"#322d29"}} className="service-category widget">
                    <h3 >Categories</h3>
                    <ul>
                        {Services.map((service, Pitem) => (
                            <li key={Pitem} style={{"background":"#4a3434"}}><Link  onClick={ClickHandler} to={`/service-single/${service.slug}`}>{service.title}</Link></li>
                        ))}
                    </ul>
                </div>
                <div className="recent-post widget">
                    <h3>Recent post</h3>
                    <div className="posts">
                        {blogs.slice(0, 3).map((blog, Bitem) => (
                            <div className="post" key={Bitem}>
                                <div className="post-img">
                                    <img src={blog.screens} alt="" />
                                </div>
                                <div className="post-content">
                                    <h4><Link onClick={ClickHandler} to={`/blog-single/${blog.slug}`}>{blog.title}</Link></h4>
                                    <span className="date">{blog.create_at}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* <div className="cta-widget widget">
                    <div className="cta-text">
                        <p>Have any questions? call us today!</p>
                        <span>+91 026 125 9870</span>
                    </div>
                </div> */}
            </div>
        </div>
    )

}

export default BlogSidebar;
