import React from 'react'
import blogs from '../../api/blogs'
import { Link } from 'react-router-dom'

const BlogSection = (props) => {

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    return (
        <section className="blog-section section-padding">
            <div className="container">
                <div className="row">
                    <div className="section-title">
                        <span>Blog Post</span>
                        <h2>My Latest Articles</h2>
                    </div>
                </div>
                <div className="blog-items">
                    <div className="row">
                        {blogs.slice(0, 3).map((blog, Bitem) => (
                            <div className="col col-lg-4 col-md-6 col-12" key={Bitem}>
                                <div className="blog-item">
                                    <div className="blog-content">
                                        <span>in Design {blog.create_at}</span>
                                        <h2><Link onClick={ClickHandler} to={`/blog-single/${blog.slug}`}>{blog.title}</Link></h2>
                                        <p>{blog.description}</p>
                                        <Link onClick={ClickHandler} to={`/blog-single/${blog.slug}`} className="more">Read More</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default BlogSection;