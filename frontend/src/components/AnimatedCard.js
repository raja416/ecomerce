import React, { useState } from 'react';
import './AnimatedCard.css';

const AnimatedCard = ({ product, onAddToCart, onAddToWishlist, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleAddToWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist(product);
  };

  const handleViewDetails = () => {
    onViewDetails(product);
  };

  return (
    <div
      className={`product-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      <div className="card-image">
        <img src={product.image} alt={product.name} />
        <div className="card-overlay">
          <button className="action-button view-button" onClick={handleViewDetails}>
            👁️ View
          </button>
        </div>
        <button
          className={`wishlist-button ${isWishlisted ? 'active' : ''}`}
          onClick={handleAddToWishlist}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
        {product.discount > 0 && (
          <div className="discount-badge">
            -{product.discount}%
          </div>
        )}
      </div>

      <div className="card-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          <span className="stars">
            {'⭐'.repeat(Math.floor(product.rating))}
            {product.rating % 1 !== 0 && '⭐'}
          </span>
          <span className="rating-text">({product.reviews} reviews)</span>
        </div>

        <div className="product-price">
          <span className="current-price">${product.price}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="original-price">${product.originalPrice}</span>
          )}
        </div>

        <div className="product-actions">
          <button
            className="add-to-cart-button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            🛒 Add to Cart
          </button>
        </div>

        {!product.inStock && (
          <div className="out-of-stock">
            Out of Stock
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedCard;
