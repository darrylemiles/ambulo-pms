import React, { useState, useEffect } from 'react';

function Home() {
    const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  useEffect(() => {
    // Add scroll reveal animation logic
    const revealElements = () => {
      const elements = document.querySelectorAll('.reveal-element');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('revealed');
        }
      });
    };

    window.addEventListener('scroll', revealElements);
    revealElements(); // Initial check

    return () => window.removeEventListener('scroll', revealElements);
    }, []);

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      minHeight: '100vh',
    }}>
      <style>{`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #C3D2D2;
            overflow-x: hidden;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 20px;
        }

        /* Scroll reveal animations */
        .reveal-element {
            opacity: 0;
            transform: translateY(50px);
            transition: all 0.8s ease;
        }

        .reveal-element.revealed {
            opacity: 1;
            transform: translateY(0);
        }

        .slide-left {
            transform: translateX(-100px);
            opacity: 0;
        }

        .slide-left.revealed {
            transform: translateX(0);
            opacity: 1;
        }

        .slide-right {
            transform: translateX(100px);
            opacity: 0;
        }

        .slide-right.revealed {
            transform: translateX(0);
            opacity: 1;
        }

        .scale-up {
            transform: scale(0.8);
            opacity: 0;
        }

        .scale-up.revealed {
            transform: scale(1);
            opacity: 1;
        }

        .fade-in {
            opacity: 0;
            transition: opacity 0.8s ease;
        }

        .fade-in.revealed {
            opacity: 1;
        }

        /* Header */
        header {
            background: #92B6B8;
            padding: 20px 0;
            border-bottom: 1px solid #d0e7ed;
            position: relative;
            z-index: 1000;
        }

        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
        }

        .logo {
            font-size: 24px;
            font-weight: 600;
            color: #201F23;
            display: flex;
            align-items: center;
            z-index: 1001;
        }

        .logo::before {
            margin-right: 8px;
            font-size: 20px;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 20px;
            margin: 0;
            padding: 0;
        }

        .nav-links a {
            text-decoration: none;
            color: #201F23;
            font-weight: 500;
            font-size: 15px;
            transition: all 0.3s ease;
            padding: 8px 16px;
            border-radius: 6px;
            position: relative;
            overflow: hidden;
        }

        .nav-links a:hover {
            color: #3d5e86;
        }

        /* Hero Section */
        .hero {
            background: #C3D2D2;
            text-align: center;
            padding: 150px 0;
            position: relative;
            overflow: hidden;
        }

        .hero-content {
            position: relative;
            z-index: 2;
        }

        .hero h1 {
            font-size: 48px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #2d3748;
            opacity: 0;
            transform: translateY(30px);
            animation: fadeInUp 1s ease 0.3s forwards;
        }

        .hero h1 .brand {
            font-weight: 600;
            color: #2c5282;
        }

        .hero p {
            font-size: 25px;
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 40px;
            opacity: 0;
            transform: translateY(30px);
            animation: fadeInUp 1s ease 0.6s forwards;
        }

        .cta-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
            opacity: 0;
            transform: translateY(30px);
            animation: fadeInUp 1s ease 0.9s forwards;
        }

        .btn {
            padding: 14px 28px;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }

        .btn-primary {
            background: #FEFEF0;
            color: black;
        }

        .btn-primary:hover {
            background: #98cdd4;
            transform: translateY(-2px);
        }

        .btn-secondary {
            background: #536F76;
            color: white;
        }

        .btn-secondary:hover {
            background: #4a5568;
            transform: translateY(-2px);
        }

        /* Properties Section */
        .properties {
            padding: 80px 0;
            background: white;
        }

        .section-title {
            text-align: center;
            margin-bottom: 60px;
        }

        .section-title h2 {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #2d3748;
        }

        .section-title p {
            font-size: 16px;
            color: #4a5568;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }

        .property-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            margin-bottom: 50px;
        }

        .property-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
        }

        .property-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }

        .property-image {
            width: 100%;
            height: 200px;
            background-size: cover;
            background-position: center;
            position: relative;
        }

        .property-info {
            padding: 20px;
        }

        .property-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #2d3748;
        }

        .property-desc {
            color: #718096;
            font-size: 14px;
            line-height: 1.5;
        }

        .view-all-btn {
            text-align: center;
        }

        /* Property Images */
        .prop-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); }
        .prop-2 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .prop-3 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .prop-4 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
        .prop-5 { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
        .prop-6 { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }

        /* Location Section */
        .location {
            padding: 80px 0;
            background: #C3D2D2;
        }

        .location-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
        }

        .location-info h2 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 24px;
            color: #2d3748;
            line-height: 1.3;
        }

        .location-info p {
            margin-bottom: 20px;
            color: #4a5568;
            line-height: 1.7;
            font-size: 16px;
        }

        .map-container {
            background: #e2e8f0;
            height: 400px;
            border-radius: 12px;
            position: relative;
            overflow: hidden;
        }

        .map-placeholder {
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #4299e1, #3182ce);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            font-weight: 500;
        }

        /* About Section */
        .about {
            padding: 80px 0;
            background: white;
        }

        .about-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: start;
        }

        .about-images {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .about-image {
            height: 180px;
            background-size: cover;
            background-position: center;
            border-radius: 12px;
            transition: transform 0.3s ease;
        }

        .about-image:hover {
            transform: scale(1.05);
        }

        .about-image-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .about-image-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .about-image-3 { background: linear-gradient(135deg, #cc5fd8 0%, #cc112a 100%); }

        .about-text h2 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 24px;
            color: #2d3748;
        }

        .about-text p {
            margin-bottom: 20px;
            color: #4a5568;
            line-height: 1.7;
            font-size: 16px;
        }

        /* Contact Section */
        .contact {
            padding: 80px 0;
            background: #2d3748;
            color: white;
        }

        .contact-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
        }

        .contact-form {
            background: rgba(255,255,255,0.05);
            padding: 40px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
        }

        .contact-form h3 {
            margin-bottom: 30px;
            font-size: 24px;
            font-weight: 600;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #e2e8f0;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 14px 16px;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            font-size: 14px;
            background: rgba(255,255,255,0.1);
            color: white;
            transition: all 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #4299e1;
            background: rgba(255,255,255,0.15);
            transform: translateY(-2px);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
            color: rgba(255,255,255,0.6);
        }

        .form-group textarea {
            resize: vertical;
            height: 120px;
        }

        .contact-info h3 {
            margin-bottom: 30px;
            font-size: 24px;
            font-weight: 600;
        }

        .contact-details {
            background: rgba(255,255,255,0.05);
            padding: 30px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
        }

        .contact-details p {
            margin-bottom: 16px;
            color: #e2e8f0;
            font-size: 16px;
        }

        .contact-details strong {
            color: white;
            font-weight: 600;
        }

        /* Footer */
        footer {
            background: #1a202c;
            color: #a0aec0;
            text-align: center;
            padding: 30px 0;
            font-size: 14px;
        }

        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .footer-left {
            color: #666;
            font-size: 13px;
        }

        .footer-right {
            display: flex;
            gap: 30px;
        }

        .footer-link {
            color: #666;
            text-decoration: none;
            font-size: 13px;
            transition: color 0.2s ease;
        }

        .footer-link:hover {
            color: #ffffff;
            text-decoration: underline;
        }

        /* Animations */
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .footer-content {
                flex-direction: column;
                gap: 8px;
                text-align: center;
            }

            .footer-right {
                gap: 20px;
            }

            .nav-links {
                display: none;
            }

            .hero h1 {
                font-size: 32px;
            }

            .property-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }

            .location-content,
            .about-content,
            .contact-content {
                grid-template-columns: 1fr;
                gap: 40px;
            }

            .about-images {
                order: -1;
            }

            .cta-buttons {
                flex-direction: column;
                align-items: center;
            }

            .section-title h2 {
                font-size: 28px;
            }

            .location-info h2,
            .about-text h2 {
                font-size: 24px;
            }
        }

        @media (max-width: 480px) {
            .container {
                padding: 0 16px;
            }

            .hero {
                padding: 60px 0;
            }

            .properties,
            .location,
            .about,
            .contact {
                padding: 60px 0;
            }

            .contact-form {
                padding: 30px 20px;
            }
        }
      `}</style>

    <div className="app">

        <section id="home" className="hero">
          <div className="container">
            <div className="hero-content">
              <h1>WELCOME TO <span className="brand">Ambulo's Property</span></h1>
              <p>Every Property Has a Story. Start Yours Here.</p>
              <div className="cta-buttons">
                <a href="#properties" className="btn btn-primary">Inquire Now</a>
                <a href="#contact" className="btn btn-secondary">Call Us</a>
              </div>
            </div>
          </div>
        </section>

        <section id="properties" className="properties">
          <div className="container">
            <div className="section-title reveal-element">
              <h2>Introducing Our Premier Commercial Leasing Spaces</h2>
              <p>Discover exceptional commercial properties designed to elevate your business. From modern office spaces to retail locations, we provide premium commercial real estate solutions tailored to your needs.</p>
            </div>
            
            <div className="property-grid">
              <div className="property-card reveal-element scale-up" style={{transitionDelay: '0.1s'}}>
                <div className="property-image prop-1"></div>
                <div className="property-info">
                  <div className="property-title">Unit 1</div>
                  <div className="property-desc">Silang, Cavite</div>
                </div>
              </div>
              
              <div className="property-card reveal-element scale-up" style={{transitionDelay: '0.2s'}}>
                <div className="property-image prop-2"></div>
                <div className="property-info">
                  <div className="property-title">Unit 2</div>
                  <div className="property-desc">Silang, Cavite</div>
                </div>
              </div>
              
              <div className="property-card reveal-element scale-up" style={{transitionDelay: '0.3s'}}>
                <div className="property-image prop-3"></div>
                <div className="property-info">
                  <div className="property-title">Unit 3</div>
                  <div className="property-desc">Silang, Cavite</div>
                </div>
              </div>
              
              <div className="property-card reveal-element scale-up" style={{transitionDelay: '0.4s'}}>
                <div className="property-image prop-4"></div>
                <div className="property-info">
                  <div className="property-title">Unit 4</div>
                  <div className="property-desc">Silang, Cavite</div>
                </div>
              </div>
              
              <div className="property-card reveal-element scale-up" style={{transitionDelay: '0.5s'}}>
                <div className="property-image prop-5"></div>
                <div className="property-info">
                  <div className="property-title">Unit 5</div>
                  <div className="property-desc">Silang, Cavite</div>
                </div>
              </div>
              
              <div className="property-card reveal-element scale-up" style={{transitionDelay: '0.6s'}}>
                <div className="property-image prop-6"></div>
                <div className="property-info">
                  <div className="property-title">Unit 6</div>
                  <div className="property-desc">Silang, Cavite</div>
                </div>
              </div>
            </div>
            
            <div className="view-all-btn reveal-element">
              <a href="#" className="btn btn-secondary">View All Properties</a>
            </div>
          </div>
        </section>

        <section className="location">
          <div className="container">
            <div className="location-content">
              <div className="location-info reveal-element slide-right">
                <h2>Locate Your Next Business in Strong's Commercial Hotspot</h2>
                <p>Position your business where it matters most. Ambulo's Properties is located along Kapt. Sayas Street in Brgy. San Vicente II, Silang, Cavite—just minutes from key residential areas, schools, and major highways. With high foot traffic and thriving nearby establishments, it's the perfect place for your store, office, or clinic.</p>
                <a href="#" className="btn btn-primary">Learn About the Area</a>
              </div>
              <div className="map-container reveal-element slide-left">
                <div className="map-placeholder">
                  📍 Interactive Map View
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="about">
          <div className="container">
            <div className="section-title reveal-element">
              <h2>About Us</h2>
            </div>
            <div className="about-content">
              <div className="about-images reveal-element slide-left">
                <div className="about-image about-image-1"></div>
                <div className="about-image about-image-2"></div>
                <div className="about-image about-image-3"></div>
                <div className="about-image about-image-3"></div>
              </div>
              <div className="about-text reveal-element slide-right">
                <p>At Ambulo's Properties, we provide more than just spaces—we provide opportunities.
                  Rooted in Silang, Cavite, our mission is to support local entrepreneurs, startups, and business owners by offering flexible, strategically located commercial units tailored for growth.
                  From retail stores and restaurants to service centers and offices, our properties are designed to meet the dynamic needs of modern businesses. What started as a family-managed property has grown into a fully occupied commercial hub—home to thriving tenants like beauty lounges, clinics, ramen shops, and more.
                  Now powered by a custom-built web-based management system, we offer a seamless experience—from lease management to maintenance coordination and tenant support—all in one digital platform.
                  Grow your business in the right place, with the right people. Welcome to Ambulo's Properties.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="container">
            <div className="section-title reveal-element">
              <h2 style={{color: 'white', marginBottom: '50px'}}>Contact Us</h2>
            </div>
            <div className="contact-content">
              <div className="contact-form reveal-element slide-right">
                <h3>Send us Information</h3>
                <div>
                  <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Your Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your commercial space requirements..."
                    />
                  </div>
                  <button onClick={handleSubmit} className="btn btn-primary">Send Message</button>
                </div>
              </div>
              <div className="contact-info reveal-element slide-left">
                <h3>Learn How Service</h3>
                <div className="contact-details">
                  <p><strong>Email:</strong> ambulosproperty@gmail.com</p>
                  <p><strong>Phone:</strong> 1111111</p>
                  <p><strong>Address:</strong> 123 Commercial Boulevard<br />Business District, City 12345</p>
                  <p><strong>Business Hours:</strong><br />Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: By Appointment</p>
                  <p style={{marginTop: '20px', fontStyle: 'italic'}}>Ready to discover your ideal commercial space? Contact our experienced team today for a personalized consultation and comprehensive property tour.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-left">
              © 2025 Ambulo's Property Management System
            </div>
            <div className="footer-right">
              <a href="#" className="footer-link">Terms And Conditions</a>
              <a href="#" className="footer-link">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
    );
  }
export default Home;