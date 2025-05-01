import React, { useEffect, useState } from 'react';
import './PartnerSection.css'; // Import your CSS file for styling

const PartnerSection = () => {
  const [isInView, setIsInView] = useState(false);
  const [expandProfiles, setExpandProfiles] = useState(false);

  // Add an event listener to detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector('.section_home-partners'); // Select the section by class name
      if (section) {
        const rect = section.getBoundingClientRect(); // Get the bounding rectangle of the section
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          // Check if the section is in viewport
          setIsInView(true); // Set isInView state to true when section is in viewport
        } else {
          setIsInView(false); // Set isInView state to false when section is out of viewport
        }
      }
    };

    // Attach scroll event listener to window
    window.addEventListener('scroll', handleScroll);

    // Clean up: Remove scroll event listener when component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <section
      data-w-id="0b8612ef-e411-e27e-681c-f216e8fb5887"
      className="section_home-partners padding-section-medium"
    >
      <div className={`track-partners ${expandProfiles ? 'expand-profiles' : ''}`}>
        <div className="partners-sticky-container">
          <div className="h2-wrapper on-partners">
            <h2 className="h2-line-one">Meet</h2>
            <h2 className="h2-line-two">Our </h2>
            <div className="h2-underline-wrapper">
              <h2 className="h2-line-three">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Partners</h2>
              <img
                src="https://assets-global.website-files.com/652427491a917cefc5a160de/65910fc0945adeb6ffc62b37_Frame-1.svg"
                loading="lazy"
                width={290}
                alt=""
                className="element_underline"
              />
            </div>
            <img
              src="https://assets-global.website-files.com/652427491a917cefc5a160de/65910fbf6bd5d34801e5033e_Arrow%20Line%20Head%20Angled%20Short.svg"
              loading="lazy"
              alt=""
              className="element_arrow-down"
            />
            <img
              src="https://assets-global.website-files.com/652427491a917cefc5a160de/6566b7e2b73f8c289413d755_flames.svg"
              loading="lazy"
              width={146}
              alt=""
              className="element_flames"
            />
          </div>
          <div className="partner-card">
            <img
              src="/partner/shweena/436293805_1466203954273227_1060728869425206742_n (1).jpg"
              loading="lazy"
              alt=""
              className="partner-image"
            />
            <div className="partner-info text-align-center">
              <div className="text-size-medium small-on-phone">
                Shweena krishnani
                <a href="https://www.instagram.com/shweenaworks?igsh=YTVwOWoxcjNkNmlo">
                  <strong>
                    <br />
                  </strong>
                </a>
              </div>
              <div className="text-color-grey">4.5k followers</div>
            </div>
          </div>
          {/* Additional partner profiles */}
          {/* ... */}
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
