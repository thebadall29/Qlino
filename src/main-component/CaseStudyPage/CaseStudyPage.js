import React, { Fragment } from 'react';
import Header from '../../components/header/Header';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import ContactArea from '../../components/ContactArea';
import NewsLatter from '../../components/NewsLatter/NewsLatter';
import Footer2 from '../../components/footer2/Footer2';
import "./CaseStudyPage.css";
import { motion } from "framer-motion";
import { FaBolt } from "react-icons/fa"; // Import the FaBolt ico
import Image1 from "../../images/about.jpg"
import Image2 from "../../images/about.jpg"; // Import another image
import Image3 from "../../images/casestudy/rice_channel_anylistic.jpg"; // Import another image
import CTASection from "../../components/CtaSection/CTASection";

const CaseStudyPage = (props) => {

  const stats = [
    "310+ Organic Youtube Views in 90 days",
    "1.24+ Million Estimated Impressions",
    "2.6k+ New Followers Gained",
    "Multiple Viral videos",
    "Multi-platform growth",
    "Multiple Sponsorships",
  ];

  const shortFormVideo = [
    "grt4lkn2aq",
  ];

  const shortFormVideos = [
    "24nlhvct02",
    "49zvfaoweu",
    "24nlhvct02"
  ];

  const longFormVideos = [
    "aci54zhm58",
  ];


  return (
    <Fragment>
      <div className='dark-page'>
        <Header />
        <section className="case-study-container">

          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="branding-badge"
            style={{ margin: "1rem auto" }}
          >
            Case Study
          </motion.span>
          <h1 className="casestudy-title">
            Rice Alcantara
          </h1>
          <div className="underline"></div>
          <p className="description">
            310+ Organic Views, 2.6k new subscribers within 90 days, and multiple sponsorship
            deals and consultaion booking.
          </p>
        </section>

        <section>
          <div className="mission-container">
            <div className="mission-content">
              <h2 className="mission-title">Mission and Challenge</h2>
              <p>
                Rice was investing a lot of time and resources in creating long-form &
                short-form content but needed a solid content strategy. He was handling
                everything from content ideas to distribution, even after growing the
                channel to 18k+ subscribers he needed help to get constant growth. and customer by their youtube traffic.
              </p>
              <p>She wanted a solid video team that could:</p>
              <ul>
                <li>Come up with different content ideas</li>
                <li>Help with the strategy of the channel</li>
                <li>Edit Content without much intervention from his side</li>
                <li>Post Long & short-form content on all his social channels</li>
                <li>Help to convert their traffic into paying customers</li>
              </ul>
              <p>
                When we started working with him in Oct 2024: The mission was to grow
                the long-form content views and grow the subscribers organically.
                Our Goal is to get more traffic on their youtube channel and turn thier traffic into paying customers.
              </p>
            </div>
            <div className="wistia-grid" style={{marginRight:"10px"}}>
              {shortFormVideo.map((videoId) => (
                <div
                  key={videoId}
                  className="wistia_responsive_padding"
                  style={{ padding: "177.78% 0 0 0", position: "relative" }}
                >
                  <div
                    className="wistia_responsive_wrapper"
                    style={{
                      height: "100%",
                      left: "0",
                      position: "absolute",
                      top: "0",
                      width: "90vw",
                    }}
                  >
                    <div
                      className={`wistia_embed wistia_async_${videoId} seo=true videoFoam=true`}
                      style={{ height: "100%", position: "relative", width: "100%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* outcome section  */}

        <section className="outcome-section">
          <h2 className="outcome-title">Outcome</h2>
          <p className="outcome-description">
            Deliverables that not only grew his brand but made him get millions of traffic and more consultation bookings every month:
          </p>
          <ol className="outcome-list">
            <li>
              <strong>Content Ideas:</strong> We ideate content ideas that perfectly
              suit his brand, capturing trends while focusing on evergreen content.
            </li>
            <li>
              <strong>Editing:</strong> We produce shorts to test out content, and
              for any game-related update, we create a short first to get the
              content out ASAP. In long-form content, we focus on creating trendy
              and evergreen content that gains views even when not uploading.
            </li>
            <li>
              <strong>Distribution:</strong> We put together a publishing strategy to
              help him grow on TikTok, Instagram, YouTube, and Facebook
              simultaneously.
            </li>
            <li>
              <strong>Monetization Systems:</strong> We optimized CTA for every
              video to ensure not only gaining new followers but also converting
              those followers into Consultation Bookings.
            </li>
          </ol>
          <div className="image-container">
            <img src={Image3} alt="YouTube Analytics" />
          </div>
        </section>

        {/* result sectin  */}

        <section className="results-section">
          <div className="results-grid">
            {stats.map((stat, index) => (
              <div className="results-card" key={index}>
                <FaBolt className="icon" />
                <span>{stat}</span>
              </div>
            ))}
          </div>

          <div className="video-grid">
            <section className="custom-video-grid">
              <div className="custom-grid-container">

                <div className="custom-wistia-grid" style={{ marginTop: "2rem" }}>
                  {shortFormVideos.map((videoId) => (
                    <div
                      key={videoId}
                      className="custom-wistia-responsive-padding"
                    >
                      <div
                        className="custom-wistia-responsive-wrapper"
                        style={{
                          height: "100%",
                          left: "0",
                          position: "absolute",
                          top: "0",
                          width: "100%",
                        }}
                      >
                        <div
                          className={`wistia_embed wistia_async_${videoId} seo=true videoFoam=true`}
                          style={{ height: "100%", position: "relative", width: "100%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {longFormVideos.map((videoId) => (
                  <div
                    key={videoId}
                    className="custom-wistia-responsive-padding-long"
                  >
                    <div className="custom-wistia-responsive-wrapper-long">
                      <div
                        className={`wistia_embed wistia_async_${videoId} seo=true videoFoam=true`}
                        style={{ height: "100%", position: "relative", width: "100%" }}
                      />
                    </div>
                  </div>
                ))}


              </div>
            </section>
          </div>

        </section>

        <CTASection />
        <Footer2 />
        <Scrollbar />
      </div>
    </Fragment>
  )
};
export default CaseStudyPage;
