import React, { useEffect } from 'react';

const PartnerSection = () => {

  useEffect(() => {
    // Load external scripts
    const loadScript = (src, integrity, crossorigin) => {
      const script = document.createElement('script');
      script.src = src;
      if (integrity) script.integrity = integrity;
      if (crossorigin) script.crossOrigin = crossorigin;
      script.async = true;
      document.body.appendChild(script);
    };

    // Load jQuery
    loadScript('https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=652427491a917cefc5a160de', 
               'sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=', 'anonymous');
    
    // Load webflow script
    loadScript('https://assets-global.website-files.com/652427491a917cefc5a160de/js/webflow.6a5ed4a4d.js');

    // Load PureCounter script
    loadScript('https://cdn.jsdelivr.net/npm/@srexi/purecounterjs/dist/purecounter_vanilla.js');

    // Load WebFont script
    loadScript('https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

    // WebFont loader configuration
    const webFontScript = document.createElement('script');
    webFontScript.innerHTML = `
      WebFont.load({
        google: {
          families: ["Poppins:300,300italic,regular,italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic"]
        }
      });
    `;
    document.body.appendChild(webFontScript);

    // Additional inline script
    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      !function(o, c) {
        var n = c.documentElement,
            t = " w-mod-";
        n.className += t + "js", ("ontouchstart" in o || o.DocumentTouch && c instanceof DocumentTouch) && (n.className += t + "touch")
      }(window, document);
    `;
    document.body.appendChild(inlineScript);

    // PureCounter configuration
    const pureCounterScript = document.createElement('script');
    pureCounterScript.innerHTML = `
      new PureCounter({
        selector: '.views',
        start: 100,
        end: 163,
        duration: 5,
        delay: 10,
        once: true,
        repeat: false,
        decimals: 0,
        legacy: true,
        filesizing: false,
        currency: false,
        separator: false
      });
      
      new PureCounter({
        selector: '.followers',
        start: 0,
        end: 51,
        duration: 1,
        delay: 10,
        once: true,
        repeat: false,
        decimals: 0,
        legacy: true,
        filesizing: false,
        currency: false,
        separator: false
      });
    `;
    document.body.appendChild(pureCounterScript);

  }, []);

  return (
    <section
      data-w-id="0b8612ef-e411-e27e-681c-f216e8fb5887"
      className="section_home-partners padding-section-medium"
    >
      <div className="track-partners">
        <div className="partners-sticky-container">
          <div
            id="w-node-d1dc8025-ce82-a339-d486-84a5da517600-c5a160e1"
            className="h2-wrapper on-partners"
          >
            <h2 className="h2-line-one">Meet</h2>
            <h2 className="h2-line-two">Our </h2>
            <div className="h2-underline-wrapper">
              <h2 className="h2-line-three">
                {" "}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Partners
              </h2>
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
          <div className="_1-partner-card">
            <img
              src="/partner/pamela/pamela.jpg"
              loading="lazy"
              alt=""
              className="partner-image"
            />
            <div className="partner-info text-align-center">
              <div className="text-size-medium small-on-phone">
                pamela mukherjee
                <a href="https://youtube.fandom.com/wiki/Lazy_Assassin#articleComments">
                  <strong>
                    <br />
                  </strong>
                </a>
              </div>
              <div className="text-color-grey">111k followers</div>
            </div>
          </div>
          <div className="_2-partner">
            <img
              src="/partner/jonty/429487184_1990656754669411_2692820829981330280_n (1).jpg"
              loading="lazy"
              alt=""
              className="partner-image"
            />
            <div className="partner-info text-align-center">
              <div className="text-size-medium small-on-phone">
                Jonty krishnani
                <a href="https://www.instagram.com/jontykrishnani?igsh=Z2dkdjJjZGs3dmty">
                  <strong>
                    <br />
                  </strong>
                </a>
              </div>
              <div className="text-color-grey">1k followers</div>
            </div>
          </div>
          <div className="_4-partner">
            <img
              src="/partner/keyen lage/403728312_869009221393712_4827992538575957678_n.jpg"
              loading="lazy"
              alt=""
              className="partner-image"
            />
            <div className="partner-info text-align-center">
              <div className="text-size-medium small-on-phone">
                Keyen lage
                <a href="https://www.instagram.com/officialkeyen?igsh=MWJoc292ZzloNHp2aQ==">
                  <strong>
                    <br />
                  </strong>
                </a>
              </div>
              <div className="text-color-grey">107k followers</div>
            </div>
          </div>
          <div className="_5-partner">
            <img
              src="/partner/sm cricket/355058684_795735428948485_8515041569320952596_n.jpg"
              loading="lazy"
              alt=""
              className="partner-image"
            />
            <div className="partner-info text-align-center">
              <div className="text-size-medium small-on-phone">
                SM cricket
                <a href="https://www.instagram.com/smcricket?igsh=MWlrdm05c25hNjFraw==">
                  <strong>
                    <br />
                  </strong>
                </a>
              </div>
              <div className="text-color-grey">8.5k followers</div>
            </div>
          </div>
          <div className="_6-partner">
            <img
              src="/partner/defence coridor/channels4_profile.jpg"
              loading="lazy"
              alt=""
              className="partner-image"
            />
            <div className="partner-info text-align-center">
              <div className="text-size-medium small-on-phone">
                Defence coridor
                <a href="https://youtube.fandom.com/wiki/Lazy_Assassin#articleComments">
                  <strong>
                    <br />
                  </strong>
                </a>
              </div>
              <div className="text-color-grey">71k followers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
