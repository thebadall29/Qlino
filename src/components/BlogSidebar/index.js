import React from 'react';
import { Link } from 'react-router-dom'
import blogs from '../../api/blogs'
import Services from '../../api/service';


const BlogSidebar = (props) => {

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    return (
        <div className={`col col-lg-4 col-12 ${props.blLeft}`}>
            <div className="blog-sidebar">
                <div className="blog-right-info widget">
                    <h3>Cameron Williamson</h3>
                    <p>Proin efficitur, mauris vel condimentum pulvinar, velit orci consectetur
                        ligula, eget egestas magna mi ut arcu. Phasellus nec odio orci.</p>
                </div>
                <div className="recent-post widget">
                    <h3>Recent Posts</h3>
                    {blogs.slice(0, 3).map((blog, Bitem) => (
                        <div className="post" key={Bitem}>
                            <div className="post-img">
                                <img src={blog.screens} alt="" />
                            </div>
                            <div className="post-content">
                                <h4><Link onClick={ClickHandler} to={`/blog-single/${blog.id}`}>{blog.title}</Link></h4>
                                <span className="date">{blog.create_at}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="category-widget widget">
                    <h3>Category</h3>
                    <ul>
                        {Services.slice(0, 6).map((service, Sitem) => (
                            <li key={Sitem}><Link onClick={ClickHandler} to={`/service-single/${service.Id}`}>{service.title}</Link></li>
                        ))}
                    </ul>
                </div>
                <div className="tag-widget widget">
                    <h3>Tags</h3>
                    <ul>
                        <li><Link onClick={ClickHandler} to="/blog">Brand</Link></li>
                        <li><Link onClick={ClickHandler} to="/blog">Development</Link></li>
                        <li><Link onClick={ClickHandler} to="/blog">UX/ UI Design</Link></li>
                    </ul>
                </div>
            </div>
        </div>
    )

}

export default BlogSidebar;
