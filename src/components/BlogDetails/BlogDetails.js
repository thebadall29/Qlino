import React from 'react';
import blog1 from '../../images/blog-single/img-2.jpg'
import blog2 from '../../images/blog-single/img-3.jpg'
import blog3 from '../../images/blog-single/img-4.jpg'
import author from '../../images/blog-single/author.jpg'
import blogs from '../../api/blogs';
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom'
import BlogSidebar from '../BlogSidebar';

const BlogSingle = (props) => {

    const { slug } = useParams()

    const BlogDetails = blogs.find(item => item.slug === slug)

    const submitHandler = (e) => {
        e.preventDefault()
    }

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    return (
        <section className={`blog-single-area section-padding ${props.sidebarClass}`}>
            <div className="container">
                <div className="row">
                    <div className={`col col-lg-8 col-md-12 col-12 ${props.blRight}`}>
                        <div className="blog-single-wrap">
                            <img src={BlogDetails.bSingle} alt="" />
                            <div className="blog-single-text">
                                <div className="blog-single-text-top">
                                    <span>in Design {BlogDetails.create_at}</span>
                                    <h2>{BlogDetails.title}</h2>
                                </div>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam a nisi et
                                    libero sodales dictum sit amet eu neque. Donec luctus, arcu eget viverra
                                    varius, nisi mi imperdiet nisl, quis porta lorem arcu a mi. Fusce
                                    pellentesque vehicula erat, nec blandit odio accumsan eget. Nam sem massa,
                                    venenatis ut nibh nec, tincidunt posuere metus. Sed rhoncus ut massa id
                                    ultrices. Praesent lacus enim, vulputate eget mi in, tincidunt solli citudin
                                    erat. Nullam bibendum cons ectetur odio nec blandit. In varius non lectus
                                    vitae interdum. Etiam quam erat, semper sit amet volutpat a, vestibulum ac
                                    odio. Quisque sit amet augue vel augue cursus commodo et eu eros. Praesent
                                    eget libero tincidunt, suscipit tellus quis, mollis lacus. Suspe ndisse
                                    ullamcorper nisl et mattis vestibulum. Nulla vel sodales lorem, id tristique
                                    felis. Sed eu pharetra orci, eu placerat risus. Duis congue enim molestie,
                                    tempor augue id, rhoncus odio vehicula.</p>
                                <p>Nunc nec diam at diam tincidunt vehicula eget nec enim. Sed ultrices viverra
                                    augue, quis fermentum magna semper ac. Duis suscipit enim nec mauris dictum,
                                    eget finibus eros tincidunt. Quisque consectetur ven enatis metus, sagittis
                                    tincidunt sem volutpat sit amet. Pellentesque nibh velit, fermentum non elit
                                    eu, volutpat sagittis dui. Quisque sagittis augue nunc, in interdum elit
                                    volutpat suscipit. Vesti bulum quis facilisis magna. Nam accumsan, ipsum et
                                    vehicula sodales, nibh risus ultrices risus, pellentesque sodales nibh eros
                                    vitae nisl.</p>
                                <blockquote>“ We collaborate with innovative young talents as a digital agency ”
                                </blockquote>
                                <p>Nullam bibendum cons ectetur odio nec blandit. In varius non lectus vitae
                                    interdum. Etiam quam erat, semper sit amet volutpat a, vestibulum ac odio.
                                    Quisque sit amet augue vel augue cursus commodo et eu eros. Praesent eget
                                    libero tincidunt, suscipit tellus quis, mollis lacus. Suspe ndisse
                                    ullamcorper nisl et mattis vestibulum. Nulla vel sodales lorem, id tristique
                                    felis. Sed eu pharetra orci, eu placerat risus. Duis congue enim molestie,
                                </p>
                                <p>Tempor augue id, rhoncus odio vehicula.
                                    Nunc nec diam at diam tincidunt vehicula eget nec enim. Sed ultrices viverra
                                    augue, quis fermentum magna semper ac. Duis suscipit enim nec mauris dictum,
                                    eget finibus eros tincidunt. Quisque consectetur ven enatis metus, sagittis
                                    tincidunt sem volutpat sit amet. Pellentesque nibh velit, fermentum non elit
                                    eu, volutpat sagittis dui. Quisque sagittis augue nunc, in interdum elit
                                    volutpat suscipit. Vesti bulum quis facilisis magna. Nam accumsan, ipsum et
                                    vehicula sodales, nibh risus ultrices risus, pellentesque sodales nibh eros
                                    vitae nisl.</p>
                            </div>
                            <div className="blog-single-alternative">
                                <h2>Alternative forms of design thinking</h2>
                                <p>Nunc nec diam at diam tincidunt vehicula eget nec enim. Sed ultrices viverra
                                    augue, quis fermentum magna semper ac. Duis suscipit enim nec mauris dictum,
                                    eget finibus eros tincidunt. Quisque consectetur ven enatis metus, sagittis
                                    tincidunt sem volutpat sit amet. Pellentesque nibh velit, fermentum non elit
                                    eu, volutpat sagittis dui. Quisque sagittis augue nunc, in interdum elit
                                    volutpat suscipit. Vesti bulum quis facilisis magna. Nam accumsan, ipsum et
                                    vehicula sodales, nibh risus ultrices risus, pellentesque sodales nibh eros
                                    vitae nisl.</p>
                                <div className="row">
                                    <div className="col-lg-4 col-ld-6 col-12">
                                        <div className="blog-alternative-img">
                                            <img src={blog1} alt=""/>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-ld-6 col-12">
                                        <div className="blog-alternative-img">
                                            <img src={blog2} alt=""/>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-ld-6 col-12">
                                        <div className="blog-alternative-img">
                                            <img src={blog3} alt=""/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p>Sagittis tincidunt sem volutpat sit amet. Pellentesque nibh velit, fermentum non
                                elit eu, volutpat sagittis dui. Quisque sagittis augue nunc, in interdum elit
                                volutpat suscipit. Vesti bulum quis facilisis magna. Nam accumsan, ipsum et
                                vehicula sodales, nibh risus ultrices risus, pellentesque sodales nibh eros
                                vitae nisl.</p>

                            <div className="tag-share-wrap">
                                <div className="row">
                                    <div className="col-lg-7 col-md-12 col-12">
                                        <div className="tag-share">
                                            <h3>Tags :</h3>
                                            <ul>
                                                <li><Link onClick={ClickHandler} to="/blog">Brand</Link></li>
                                                <li><Link onClick={ClickHandler} to="/blog">Development</Link></li>
                                                <li><Link onClick={ClickHandler} to="/blog">UX/ UI Design</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-lg-5 col-md-12 col-12">
                                        <div className="tag-share">
                                            <h3>Tags :</h3>
                                            <ul>
                                                <li><Link onClick={ClickHandler} to="/blog">fb</Link></li>
                                                <li><Link onClick={ClickHandler} to="/blog">x</Link></li>
                                                <li><Link onClick={ClickHandler} to="/blog">in</Link></li>
                                                <li><Link onClick={ClickHandler} to="/blog">t</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="author-box">
                                <div className="author-avatar"><img src={author} alt=""/></div>
                                <div className="author-content">
                                    <Link className="author-name" to="/blog">Cameron Williamson</Link>
                                    <p>Sagittis tincidunt sem volutpat sit amet. Pellentesque nibh velit, fermentum non elit eu, volutpat sagittis dui. Quisque sagittis augue nunc, in interdum elit volutpat suscipit. Vesti bulum quis facilisis magna.</p>
                                    <div className="socials">
                                        <ul className="social-link">
                                            <li><Link onClick={ClickHandler} to="/blog">fb</Link></li>
                                            <li><Link onClick={ClickHandler} to="/blog">x</Link></li>
                                            <li><Link onClick={ClickHandler} to="/blog">in</Link></li>
                                            <li><Link onClick={ClickHandler} to="/blog">t</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="comment-respond">
                                <h3 className="comment-reply-title">Leave a Reply</h3>
                                <p>Your email address will not be published. Required fields are marked *</p>
                                <form className="comment-form" onSubmit={submitHandler}>
                                    <div className="form-textarea">
                                        <label>Your Comment*</label>
                                        <textarea id="comment"></textarea>
                                    </div>
                                    <div className="form-inputs">
                                        <div className="form-field">
                                            <label>Your Name*</label>
                                            <input type="text"/>
                                        </div>
                                        <div className="form-field">
                                            <label>Your Email*</label>
                                            <input type="email"/>
                                        </div>
                                        <div className="form-field">
                                            <label>Website</label>
                                            <input type="url"/>
                                        </div>
                                    </div>
                                    <div className="form-submit">
                                        <input id="submit" value="Post Comment" type="submit"/>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <BlogSidebar blLeft={props.blLeft} />
                </div>
            </div>
        </section>
    )

}

export default BlogSingle;
