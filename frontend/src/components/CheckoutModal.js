import React, { useState } from 'react';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, cart, onCheckout }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCheckout(formData);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>

        <div className="checkout-header">
          <h2>Checkout</h2>
          <div className="step-indicator">
            <span className={`step ${step >= 1 ? 'active' : ''}`}>1</span>
            <span className="step-line"></span>
            <span className={`step ${step >= 2 ? 'active' : ''}`}>2</span>
            <span className="step-line"></span>
            <span className={`step ${step >= 3 ? 'active' : ''}`}>3</span>
          </div>
        </div>

        <div className="checkout-content">
          {step === 1 && (
            <div className="checkout-step">
              <h3>Shipping Information</h3>
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="next-button">
                  Continue to Payment →
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-step">
              <h3>Payment Information</h3>
              <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                <div className="form-group">
                  <label>Card Number</label>
                  <div className="card-input">
                    <span className="card-icon">💳</span>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div className="security-note">
                  <span className="security-icon">🔒</span>
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <div className="button-group">
                  <button type="button" className="back-button" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button type="submit" className="next-button">
                    Review Order →
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-step">
              <h3>Order Review</h3>
              <div className="order-summary">
                <div className="order-items">
                  {cart.map((item, index) => (
                    <div key={index} className="order-item">
                      <img src={item.image} alt={item.name} />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-total">
                  <div className="total-line">
                    <span>Subtotal:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="total-line">
                    <span>Shipping:</span>
                    <span>$5.99</span>
                  </div>
                  <div className="total-line">
                    <span>Tax:</span>
                    <span>${(calculateTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="total-line total">
                    <span>Total:</span>
                    <span>${(calculateTotal() + 5.99 + (calculateTotal() * 0.08)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button type="button" className="back-button" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button type="button" className="place-order-button" onClick={handleSubmit}>
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
