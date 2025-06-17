import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ServiceSection = () => {
  const services = [
    {
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&q=80",
      title: "Dentist",
      description: "Teething troubles? Schedule a dental checkup",
      route: "/dermatology/doctors"
    },
    {
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80",
      title: "Gynecologist/Obstetrician",
      description: "Explore for women's health, pregnancy and infertility treatments",
      route: "/gynecology/doctors"
    },
    {
      image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=500&q=80",
      title: "Dietitian/Nutrition",
      description: "Get guidance on eating right, weight management and sports nutrition",
      route: "/general medicine/doctors"
    },
    {
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&q=80",
      title: "Physiotherapist",
      description: "Pulled a muscle? Get it treated by a trained physiotherapist",
      route: "/nephrology/doctors"
    }
  ];

  const doubledServices = [...services, ...services];

  return (
    <section className="service__section">
      <div className="service__header">
        <h2>Book an appointment for an in-clinic consultation</h2>
        <p>Find experienced doctors across all specialties</p>
      </div>
      
      <div className="service__slider">
        <motion.div 
          className="service__container"
          animate={{
            x: [0, -100 * services.length],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            },
          }}
        >
          {doubledServices.map((service, index) => (
            <Link 
              to={service.route}
              key={index}
              className="service__card"
            >
              <motion.div className="service__inner">
                <div className="service__image">
                  <img src={service.image} alt={service.title} />
                </div>
                <div className="service__content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceSection;
