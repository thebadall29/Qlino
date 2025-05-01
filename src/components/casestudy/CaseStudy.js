import React from 'react';
import './CaseStudy.css';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const data = [
  { name: "Rice Alcantara", description: "Multiple Sponsorships" },
];

const slugify = (str) => {
  return str.toLowerCase().replace(/\s+/g, '-');
};

function CaseStudy() {
  return (
    <div className="case-study-container" >
      <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="branding-badge heading_line "
                style={{ margin: "0 auto 3rem auto" }}
              >
                Case Study
              </motion.span>
      
      {data.map((item, index) => (
        <Link key={index} to={`/casestudy/${slugify(item.name)}`} className="block">
          <div className="case-study-row">
            <span className="case-study-name">{item.name}</span>
            <span className="case-study-description">{item.description}</span>
          </div>
        </Link>
      ))}

      <div className="case-study-divider"></div>
    </div>
  );
}

export default CaseStudy;
