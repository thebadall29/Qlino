import React, { Fragment, useState } from 'react';
import List from "@mui/material/List";
import ListItem from "@mui/material/List";
import Collapse from "@mui/material/Collapse";
import { Link } from "react-router-dom";
import './style.css';

const menus = [
    {
        id: 1,
        title: '_home',
        link: '/home',
        // submenu: [
        //     {
        //         id: 11,
        //         title: 'Home style 1',
        //         link: '/home'
        //     },
        //     {
        //         id: 12,
        //         title: 'Home style 2',
        //         link: '/home-2'
        //     },
        //     {
        //         id: 13,
        //         title: 'Home style 3',
        //         link: '/home-3'
        //     },
        //     {
        //         id: 13,
        //         title: 'Home style 4',
        //         link: '/home-4'
        //     }
        // ]
    },

    {
        id: 3,
        title: '_about',
        link: '/about-us',
        // submenu: [
        //     {
        //         id: 31,
        //         title: 'About Me',
        //         link: '/about-me'
        //     },
        //     {
        //         id: 3222,
        //         title: 'About Us',
        //         link: '/about-us'
        //     },
        //     {
        //         id: 322,
        //         title: 'Services',
        //         link: '/services'
        //     },
        //     {
        //         id: 33,
        //         title: 'Service Single',
        //         link: '/service-single/Creative-Design'
        //     },
        //     {
        //         id: 34,
        //         title: 'Team Page',
        //         link: '/team'
        //     },
        //     {
        //         id: 3454,
        //         title: 'Team Single',
        //         link: '/team-single/Thomas'
        //     },
        //     {
        //         id: 35,
        //         title: 'Pricing',
        //         link: '/pricing'
        //     },
        //     {
        //         id: 36,
        //         title: '404',
        //         link: '/404'
        //     }
        // ]
    },
    {
        id: 7,
        title: '_portfolio',
        link: '/portfolio',
        // submenu: [
        //     {
        //         id: 71,
        //         title: 'Portfolio Grid',
        //         link: '/portfolio'
        //     },
        //     {
        //         id: 72,
        //         title: 'Portfolio Grid S2',
        //         link: '/portfolio-s2'
        //     },
        //     {
        //         id: 74,
        //         title: 'Portfolio Grid S3',
        //         link: '/portfolio-s3'
        //     },
        //     {
        //         id: 75,
        //         title: 'Portfolio Single',
        //         link: '/project-single/Business'
        //     },
        // ]
    },

    {
        id: 5,
        title: '_blog',
        link: '/blog-right-sidebar',
        // submenu: [
        //     {
        //         id: 51,
        //         title: 'Blog Grid Style',
        //         link: '/blog-grid'
        //     },
        //     {
        //         id: 52,
        //         title: 'Blog right sidebar',
        //         link: '/blog-right-sidebar'
        //     },
        //     {
        //         id: 57,
        //         title: 'Blog left sidebar',
        //         link: '/blog-left-sidebar'
        //     },
        //     {
        //         id: 53,
        //         title: 'Blog fullwidth',
        //         link: '/blog-fullwidth'
        //     },
        //     {
        //         id: 54,
        //         title: 'Blog Single Main',
        //         link: '/blog-single/10-Reasons-why-you-should-make-a-physical-portfolio'
        //     },
        //     {
        //         id: 55,
        //         title: 'Blog Single Sidebar',
        //         link: '/blog-single-sidebar/10-Reasons-why-you-should-make-a-physical-portfolio'
        //     }
        // ]
    },
    {
        id: 88,
        title: '_contact',
        link: '/contact',
    }


]

const MobileMenu = () => {

    const [openId, setOpenId] = useState(0);
    const [menuActive, setMenuState] = useState(false);

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    return (
        <div>
            <div className={`mobileMenu ${menuActive ? "show" : ""}`}>
                <div className="menu-close">
                    <div className="clox" onClick={() => setMenuState(!menuActive)}><i className="ti-close"></i></div>
                </div>

                <ul className="responsivemenu">
                    {menus.map((item, mn) => {
                        return (
                            <ListItem className={item.id === openId ? 'active' : null} key={mn}>
                                {item.submenu ?
                                    <Fragment>
                                        <p onClick={() => setOpenId(item.id === openId ? 0 : item.id)}>{item.title}
                                            <i className={item.id === openId ? 'fa fa-angle-up' : 'fa fa-angle-down'}></i>
                                        </p>
                                        <Collapse in={item.id === openId} timeout="auto" unmountOnExit>
                                            <List className="subMenu">
                                                <Fragment>
                                                    {item.submenu.map((submenu, i) => {
                                                        return (
                                                            <ListItem key={i}>
                                                                <Link onClick={ClickHandler} className="active"
                                                                    to={submenu.link}>{submenu.title}</Link>
                                                            </ListItem>
                                                        )
                                                    })}
                                                </Fragment>
                                            </List>
                                        </Collapse>
                                    </Fragment>
                                    : <Link className="active"
                                        to={item.link}>{item.title}</Link>
                                }
                            </ListItem>
                        )
                    })}
                </ul>

            </div>

            <div className="showmenu" onClick={() => setMenuState(!menuActive)}>
                <button type="button" className="navbar-toggler open-btn">
                    <span className="icon-bar first-angle"></span>
                    <span className="icon-bar middle-angle"></span>
                    <span className="icon-bar last-angle"></span>
                </button>
            </div>
        </div>
    )
}

export default MobileMenu;