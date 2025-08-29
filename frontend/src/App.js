import React, { useState, useEffect } from 'react';
import { productsAPI } from './utils/api';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [productRatings, setProductRatings] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkBackendStatus();
    loadProducts();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('/api/health', { timeout: 5000 });
      if (response.ok) {
        setBackendStatus('Connected to Backend API');
      } else {
        setBackendStatus('Backend API Error');
      }
    } catch (error) {
      console.log('Backend not available:', error.message);
      setBackendStatus('Backend API not available');
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsAPI.getAll({
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
      
      if (response.data.success) {
        setProducts(response.data.data.products);
      } else {
        setError('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products from server');
      
      // Fallback to sample data if API fails
      loadSampleProducts();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleProducts = () => {
    const sampleProducts = [
      {
        id: 1,
        name: 'Premium Wireless Headphones',
        price: 299.99,
        originalPrice: 399.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        description: 'High-quality wireless headphones with active noise cancellation',
        category: 'electronics',
        rating: 4.8,
        reviews: 1247,
        inStock: true,
        discount: 25
      },
      {
        id: 2,
        name: 'Smartphone Pro Max',
        price: 1299.99,
        originalPrice: 1499.99,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
        description: 'Latest smartphone with advanced camera system',
        category: 'electronics',
        rating: 4.9,
        reviews: 2156,
        inStock: true,
        discount: 13
      },
      {
        id: 3,
        name: 'Gaming Laptop Elite',
        price: 2499.99,
        originalPrice: 2799.99,
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop',
        description: 'High-performance gaming laptop with RTX graphics',
        category: 'electronics',
        rating: 4.7,
        reviews: 892,
        inStock: true,
        discount: 11
      },
      {
        id: 4,
        name: 'Smart Watch Series X',
        price: 499.99,
        originalPrice: 599.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
        description: 'Advanced smartwatch with health tracking',
        category: 'electronics',
        rating: 4.6,
        reviews: 1567,
        inStock: true,
        discount: 17
      },
      {
        id: 5,
        name: 'Wireless Earbuds Pro',
        price: 199.99,
        originalPrice: 249.99,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop',
        description: 'Premium wireless earbuds with noise cancellation',
        category: 'electronics',
        rating: 4.5,
        reviews: 2341,
        inStock: true,
        discount: 20
      },
      {
        id: 6,
        name: '4K Smart TV',
        price: 899.99,
        originalPrice: 1199.99,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop',
        description: 'Ultra HD smart TV with HDR and voice control',
        category: 'electronics',
        rating: 4.4,
        reviews: 678,
        inStock: true,
        discount: 25
      },
      {
        id: 7,
        name: 'Designer T-Shirt',
        price: 49.99,
        originalPrice: 79.99,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
        description: 'Premium cotton designer t-shirt',
        category: 'clothing',
        rating: 4.3,
        reviews: 445,
        inStock: true,
        discount: 38
      },
      {
        id: 8,
        name: 'Running Shoes',
        price: 129.99,
        originalPrice: 159.99,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
        description: 'Comfortable running shoes for athletes',
        category: 'clothing',
        rating: 4.6,
        reviews: 892,
        inStock: true,
        discount: 19
      }
    ];
    setProducts(sampleProducts);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const handleRating = (productId, rating) => {
    setProductRatings(prev => ({
      ...prev,
      [productId]: rating
    }));
    // Here you could also send the rating to the backend
    console.log(`Rating for product ${productId}: ${rating} stars`);
  };

  const handleCheckout = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleOrderComplete = (order) => {
    console.log('Order completed:', order);
    setCart([]);
    setShowCheckoutModal(false);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const filteredProducts = products
    .filter(product => 
      (selectedCategory === 'all' || (product.category && product.category.slug === selectedCategory)) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const categories = [
    { id: 'all', name: 'All Products', icon: '🛍️' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'home-garden', name: 'Home & Garden', icon: '🏠' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'books', name: 'Books', icon: '📚' }
  ];

  // Show admin panel if requested
  if (showAdmin) {
    return <AdminPanel />;
  }

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo">
              <span>🛒 eCommerce Pro</span>
            </div>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>

            <ul className="nav-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#products">Products</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li>
                <button 
                  className="cart-btn"
                  onClick={() => setCartOpen(!cartOpen)}
                >
                  🛒 Cart ({getCartCount()})
                </button>
              </li>
              <li>
                <button 
                  className="admin-btn"
                  onClick={() => setShowAdmin(!showAdmin)}
                >
                  👑 Admin
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Shopping Cart ({getCartCount()})</h3>
              <button onClick={() => setCartOpen(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <button onClick={() => setCartOpen(false)}>Continue Shopping</button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.images && item.images.length > 0 ? item.images[0] : item.image || 'https://via.placeholder.com/100x100/2a2a2a/ffffff?text=Image'} alt={item.name} />
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <p>${item.price}</p>
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total">
                    <strong>Total: ${getCartTotal().toFixed(2)}</strong>
                  </div>
                  <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container">
          <h1>Welcome to Our eCommerce Store</h1>
          <p>Discover amazing products at great prices</p>
          <a href="#products" className="btn">Shop Now</a>
        </div>
      </section>

      {/* Backend Status */}
      <div className="container">
        <div className={backendStatus.includes('Connected') ? 'status' : 'error'}>
          {backendStatus}
        </div>
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button onClick={loadProducts} className="retry-btn">Retry</button>
          </div>
        )}
      </div>

      {/* Products Section */}
      <section className="features" id="products">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Featured Products
          </h2>

          {/* Filters and Sorting */}
          <div className="product-controls">
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
            
            <div className="sort-controls">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading products...
            </div>
          ) : (
            <div className="features-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="feature-card">
                  <div className="product-image-container">
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0] : product.image || 'https://via.placeholder.com/300x200/2a2a2a/ffffff?text=Product+Image'} 
                      alt={product.name}
                      className="product-image"
                    />
                    <div className="product-overlay">
                      <button 
                        className="wishlist-btn"
                        onClick={() => toggleWishlist(product.id)}
                      >
                        {wishlist.includes(product.id) ? '❤️' : '🤍'}
                      </button>
                      <button 
                        className="quick-view-btn"
                        onClick={() => console.log('Quick view:', product.name)}
                      >
                        👁️
                      </button>
                    </div>
                    {product.discount > 0 && (
                      <div className="discount-badge">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <div className="product-rating">
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            className={`star-btn ${star <= (productRatings[product.id] || product.rating || 0) ? 'filled' : ''}`}
                            onClick={() => handleRating(product.id, star)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              color: star <= (productRatings[product.id] || product.rating || 0) ? '#FFD700' : '#ccc'
                            }}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                      <span className="rating-text">
                        ({productRatings[product.id] || product.rating || 0}/5)
                      </span>
                      <span className="reviews-count">({product.reviews} reviews)</span>
                    </div>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-price">
                      <span className="current-price">${product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="original-price">${product.originalPrice}</span>
                      )}
                    </div>
                    
                    <div className="product-actions">
                      <button 
                        className="btn add-to-cart-btn"
                        onClick={() => addToCart(product)}
                        disabled={!product.inStock}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features" style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Why Choose Us
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🚚 Fast Delivery</h3>
              <p>Get your products delivered within 24-48 hours</p>
            </div>
            <div className="feature-card">
              <h3>💰 Best Prices</h3>
              <p>Competitive prices with regular discounts and offers</p>
            </div>
            <div className="feature-card">
              <h3>🛡️ Secure Payment</h3>
              <p>Multiple secure payment options available</p>
            </div>
            <div className="feature-card">
              <h3>📞 24/7 Support</h3>
              <p>Round the clock customer support for your queries</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About eCommerce Pro</h2>
              <p className="about-description">
                Welcome to eCommerce Pro, your premier destination for quality products and exceptional shopping experiences. 
                Founded with a vision to revolutionize online shopping, we've been serving customers worldwide since 2020.
              </p>
              <div className="about-stats">
                <div className="stat-item">
                  <h3>50K+</h3>
                  <p>Happy Customers</p>
                </div>
                <div className="stat-item">
                  <h3>1000+</h3>
                  <p>Products</p>
                </div>
                <div className="stat-item">
                  <h3>24/7</h3>
                  <p>Support</p>
                </div>
                <div className="stat-item">
                  <h3>4.8⭐</h3>
                  <p>Average Rating</p>
                </div>
              </div>
              <div className="about-features">
                <div className="feature-item">
                  <span className="feature-icon">🌍</span>
                  <div>
                    <h4>Global Reach</h4>
                    <p>Serving customers in over 50 countries worldwide</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <div>
                    <h4>Secure Shopping</h4>
                    <p>Bank-level security for all your transactions</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">♻️</span>
                  <div>
                    <h4>Eco-Friendly</h4>
                    <p>Committed to sustainable and eco-friendly practices</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="image-placeholder">
                <span>🏢</span>
                <p>Our Store</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2>Contact Us</h2>
          <p className="contact-subtitle">Get in touch with our team. We'd love to hear from you!</p>
          
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <h4>Address</h4>
                  <p>123 Commerce Street<br />Business City, BC 12345<br />United States</p>
                </div>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <div>
                  <h4>Email</h4>
                  <p>support@ecommercepro.com</p>
                  <p>sales@ecommercepro.com</p>
                </div>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <h4>Phone</h4>
                  <p>+1 (555) 123-4567</p>
                  <p>+1 (555) 987-6543</p>
                </div>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">🕒</span>
                <div>
                  <h4>Business Hours</h4>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                  <p>Saturday: 10:00 AM - 4:00 PM EST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
            
            <div className="contact-form">
              <h3>Send us a Message</h3>
              <form className="contact-form-fields">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" placeholder="Your first name" required />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" placeholder="Your last name" required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="your.email@example.com" required />
                </div>
                
                <div className="form-group">
                  <label>Subject</label>
                  <select required>
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="sales">Sales Question</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Message</label>
                  <textarea 
                    rows="5" 
                    placeholder="Tell us how we can help you..."
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>🛒 eCommerce Pro</h4>
              <p>Your trusted destination for premium products and exceptional shopping experiences. We bring you the best deals on quality products.</p>
              <div className="social-links">
                <a href="#" className="social-link">📘 Facebook</a>
                <a href="#" className="social-link">📷 Instagram</a>
                <a href="#" className="social-link">🐦 Twitter</a>
                <a href="#" className="social-link">💼 LinkedIn</a>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>🛍️ Shop</h4>
              <ul>
                <li><a href="#products">All Products</a></li>
                <li><a href="#electronics">Electronics</a></li>
                <li><a href="#clothing">Clothing</a></li>
                <li><a href="#home">Home & Garden</a></li>
                <li><a href="#sports">Sports</a></li>
                <li><a href="#deals">Deals & Offers</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>👤 Account</h4>
              <ul>
                <li><a href="#login">Sign In</a></li>
                <li><a href="#register">Create Account</a></li>
                <li><a href="#orders">My Orders</a></li>
                <li><a href="#wishlist">Wishlist</a></li>
                <li><a href="#profile">Profile Settings</a></li>
                <li><a href="#addresses">Address Book</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>🛠️ Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#shipping">Shipping Info</a></li>
                <li><a href="#returns">Returns & Exchanges</a></li>
                <li><a href="#tracking">Track Order</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>📞 Contact Info</h4>
              <div className="contact-info">
                <p>📍 123 Commerce St, Business City, BC 12345</p>
                <p>📧 support@ecommercepro.com</p>
                <p>📞 +1 (555) 123-4567</p>
                <p>🕒 Mon-Fri: 9AM-6PM EST</p>
              </div>
              <div className="newsletter">
                <h5>📧 Newsletter</h5>
                <p>Subscribe for exclusive deals and updates</p>
                <div className="newsletter-form">
                  <input type="email" placeholder="Enter your email" />
                  <button>Subscribe</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <div className="footer-links">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#cookies">Cookie Policy</a>
                <a href="#sitemap">Sitemap</a>
              </div>
              <div className="payment-methods">
                <span>💳 We Accept:</span>
                <span>Visa</span>
                <span>Mastercard</span>
                <span>PayPal</span>
                <span>Apple Pay</span>
              </div>
              <div className="copyright">
                <p>&copy; 2024 eCommerce Pro. All rights reserved.</p>
                <p>Built with ❤️ using React & Node.js</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(userData) => {
          setUser(userData);
          setShowAuthModal(false);
          setShowCheckoutModal(true);
        }}
      />

      <CheckoutModal 
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
}

export default App;



