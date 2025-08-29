import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            Discover Amazing Products
            <span className="sparkle">✨</span>
          </h1>
          <p className="hero-description">
            Shop the latest trends with unbeatable prices and fast delivery
          </p>
          <div className="hero-features">
            <div className="feature">
              <span className="star">⭐</span>
              <span>Premium Quality</span>
            </div>
            <div className="feature">
              <span className="star">⭐</span>
              <span>Fast Shipping</span>
            </div>
            <div className="feature">
              <span className="star">⭐</span>
              <span>Secure Payment</span>
            </div>
          </div>
          <button className="cta-button">
            Shop Now <span className="arrow">→</span>
          </button>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            <span>🛍️</span>
            <p>Amazing Products</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
