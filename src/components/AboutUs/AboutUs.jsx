import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutUs.css';
import { FiChevronLeft, FiAward, FiUsers, FiHeart, FiShield, FiClock, FiMapPin } from 'react-icons/fi';
import { MdLocalPharmacy, MdHealthAndSafety } from 'react-icons/md';
import { FaUserMd, FaTruck, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const AboutUs = ({ onBack }) => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(null);

  const handleCardHover = (index) => {
    setActiveCard(index);
  };

  const handleCardLeave = () => {
    setActiveCard(null);
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) + ' - ' + now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const achievementCards = [
    {
      icon: <FiUsers />,
      number: "10+",
      title: "Years",
      subtitle: "Serving Community",
      color: "#3b82f6"
    },
    {
      icon: <FiAward />,
      number: "50K+",
      title: "Happy",
      subtitle: "Customers",
      color: "#10b981"
    },
    {
      icon: <MdLocalPharmacy />,
      number: "500+",
      title: "Medicines",
      subtitle: "Available",
      color: "#f59e0b"
    },
    {
      icon: <FaUserMd />,
      number: "24/7",
      title: "Expert",
      subtitle: "Support",
      color: "#ef4444"
    }
  ];

  const serviceCards = [
    {
      icon: <MdHealthAndSafety />,
      title: "Quality Assurance",
      description: "All our medicines are sourced from certified manufacturers and undergo strict quality checks.",
      color: "#3b82f6"
    },
    {
      icon: <FaTruck />,
      title: "Fast Delivery",
      description: "Same-day delivery within city limits and express shipping nationwide for urgent medications.",
      color: "#10b981"
    },
    {
      icon: <FiShield />,
      title: "Secure & Safe",
      description: "Your personal and medical information is protected with industry-standard security measures.",
      color: "#f59e0b"
    },
    {
      icon: <FiClock />,
      title: "24/7 Support",
      description: "Round-the-clock customer support and emergency prescription services available.",
      color: "#ef4444"
    }
  ];

  return (
    <div className="about-us-container">
      {/* Header */}
      <header className="about-us-header">
        <div className="header-left">
          <button className="header-back-btn" onClick={onBack}>
            <FiChevronLeft /> Back to Dashboard
          </button>
        </div>
        <div className="header-right">
          <div className="language-selector">
            <span>🌐 English (US)</span>
          </div>
          <div className="greeting-container">
            <span className="greeting-icon">☀️</span>
            <span className="greeting-text">{getTimeBasedGreeting()}</span>
          </div>
          <div className="date-time">
            {getCurrentDate()}
          </div>
        </div>
      </header>

      <div className="about-us-content">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="pharmacy-brand-large">
              <MdLocalPharmacy className="brand-icon-large" />
              <h1>Crystal Pharmacy</h1>
            </div>
            <p className="hero-tagline">Your Health, Our Priority - Serving the Community for Over a Decade</p>
          </div>
          <div className="hero-image">
            <div className="image-placeholder">
              <MdHealthAndSafety className="hero-icon" />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="about-section">
          <div className="section-header">
            <h2>About Us</h2>
            <p>Learn more about Crystal Pharmacy and our commitment to your health and well-being</p>
          </div>

          <div className="about-content-grid">
            <div className="about-text">
              <h3>Our Mission</h3>
              <p>
                At Crystal Pharmacy, we are dedicated to providing exceptional pharmaceutical care and health services 
                to our community. Our mission is to ensure that quality healthcare and medications are accessible, 
                affordable, and delivered with the highest standards of professional service.
              </p>
              
              <h3>Our Vision</h3>
              <p>
                To be the most trusted pharmacy in the region, known for our commitment to patient care, 
                innovative health solutions, and community wellness programs that make a positive impact 
                on people's lives.
              </p>

              <div className="contact-info">
                <h3>Get in Touch</h3>
                <div className="contact-items">
                  <div className="contact-item">
                    <FaPhoneAlt className="contact-icon" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="contact-item">
                    <FaEnvelope className="contact-icon" />
                    <span>info@crystalpharmacy.com</span>
                  </div>
                  <div className="contact-item">
                    <FiMapPin className="contact-icon" />
                    <span>123 Health Street, Medical District, City</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="achievements-grid">
              {achievementCards.map((card, index) => (
                <div 
                  key={index}
                  className={`achievement-card ${activeCard === index ? 'active' : ''}`}
                  onMouseEnter={() => handleCardHover(index)}
                  onMouseLeave={handleCardLeave}
                  style={{ '--card-color': card.color }}
                >
                  <div className="achievement-icon">
                    {card.icon}
                  </div>
                  <div className="achievement-number">{card.number}</div>
                  <div className="achievement-title">{card.title}</div>
                  <div className="achievement-subtitle">{card.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="services-section">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Comprehensive pharmaceutical services designed to meet all your healthcare needs</p>
          </div>

          <div className="services-grid">
            {serviceCards.map((service, index) => (
              <div 
                key={index}
                className="service-card"
                style={{ '--service-color': service.color }}
              >
                <div className="service-icon">
                  {service.icon}
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="service-overlay"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="values-section">
          <div className="section-header">
            <h2>Our Values</h2>
            <p>The principles that guide everything we do at Crystal Pharmacy</p>
          </div>

          <div className="values-grid">
            <div className="value-item">
              <FiHeart className="value-icon" />
              <h3>Compassionate Care</h3>
              <p>We treat every customer with empathy, understanding, and genuine concern for their well-being.</p>
            </div>
            <div className="value-item">
              <FiShield className="value-icon" />
              <h3>Trust & Integrity</h3>
              <p>We maintain the highest ethical standards and build lasting relationships based on trust.</p>
            </div>
            <div className="value-item">
              <FiAward className="value-icon" />
              <h3>Excellence</h3>
              <p>We strive for excellence in every aspect of our service, from product quality to customer experience.</p>
            </div>
          </div>
        </div>

     
      </div>
    </div>
  );
};

export default AboutUs;
