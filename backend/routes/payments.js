const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const emailService = require('../utils/emailService');

const router = express.Router();

// Mock payment processor
class MockPaymentProcessor {
  constructor() {
    this.supportedMethods = ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'];
    this.processingFees = {
      credit_card: 0.029, // 2.9%
      debit_card: 0.015,  // 1.5%
      paypal: 0.029,      // 2.9%
      apple_pay: 0.029,   // 2.9%
      google_pay: 0.029   // 2.9%
    };
  }

  // Simulate payment processing
  async processPayment(paymentData) {
    const { amount, paymentMethod, cardNumber, expiryDate, cvv, billingAddress } = paymentData;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Validate card number (Luhn algorithm)
    if (!this.validateCardNumber(cardNumber)) {
      throw new Error('Invalid card number');
    }

    // Simulate random failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Payment declined by bank');
    }

    // Calculate processing fee
    const fee = amount * this.processingFees[paymentMethod];
    const totalAmount = amount + fee;

    // Generate mock transaction details
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
      fee: fee,
      totalAmount: totalAmount,
      currency: 'USD',
      status: 'succeeded',
      paymentMethod: paymentMethod,
      processedAt: new Date(),
      authorizationCode: `AUTH_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      last4: cardNumber.slice(-4),
      cardBrand: this.getCardBrand(cardNumber),
      billingAddress: billingAddress
    };

    return transaction;
  }

  // Validate card number using Luhn algorithm
  validateCardNumber(cardNumber) {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Determine card brand
  getCardBrand(cardNumber) {
    const number = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'discover';
    
    return 'unknown';
  }

  // Generate test card numbers
  getTestCards() {
    return {
      visa: '4242424242424242',
      mastercard: '5555555555554444',
      amex: '378282246310005',
      discover: '6011111111111117',
      declined: '4000000000000002',
      insufficient_funds: '4000000000009995'
    };
  }
}

const paymentProcessor = new MockPaymentProcessor();

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Public
router.get('/methods', (req, res) => {
  try {
    const methods = [
      {
        id: 'credit_card',
        name: 'Credit Card',
        icon: '💳',
        description: 'Visa, Mastercard, American Express',
        processingTime: 'Instant',
        fee: '2.9%'
      },
      {
        id: 'debit_card',
        name: 'Debit Card',
        icon: '🏦',
        description: 'Direct bank transfer',
        processingTime: '1-2 business days',
        fee: '1.5%'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: '🔵',
        description: 'Pay with your PayPal account',
        processingTime: 'Instant',
        fee: '2.9%'
      },
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        icon: '🍎',
        description: 'Quick and secure payment',
        processingTime: 'Instant',
        fee: '2.9%'
      },
      {
        id: 'google_pay',
        name: 'Google Pay',
        icon: '🤖',
        description: 'Fast and secure payment',
        processingTime: 'Instant',
        fee: '2.9%'
      }
    ];

    res.json({
      success: true,
      data: {
        methods,
        testCards: paymentProcessor.getTestCards()
      }
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment methods'
    });
  }
});

// @desc    Process payment
// @route   POST /api/payments/process
// @access  Private
router.post('/process', [
  protect,
  body('orderId')
    .isInt({ min: 1 })
    .withMessage('Valid order ID is required'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'])
    .withMessage('Valid payment method is required'),
  body('cardNumber')
    .isLength({ min: 13, max: 19 })
    .withMessage('Valid card number is required'),
  body('expiryDate')
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
    .withMessage('Valid expiry date (MM/YY) is required'),
  body('cvv')
    .isLength({ min: 3, max: 4 })
    .withMessage('Valid CVV is required'),
  body('billingAddress')
    .isObject()
    .withMessage('Billing address is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId, paymentMethod, cardNumber, expiryDate, cvv, billingAddress } = req.body;

    // Get order
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been paid'
      });
    }

    // Process payment
    try {
      const transaction = await paymentProcessor.processPayment({
        amount: order.totalAmount,
        paymentMethod,
        cardNumber,
        expiryDate,
        cvv,
        billingAddress
      });

      // Update order
      await order.update({
        paymentStatus: 'paid',
        paymentIntentId: transaction.id,
        status: 'confirmed'
      });

      // Send order confirmation email
      try {
        const user = await User.findByPk(req.user.id);
        await emailService.sendOrderConfirmation(order, user);
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          transaction,
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus
          }
        }
      });
    } catch (paymentError) {
      // Update order with failed payment
      await order.update({
        paymentStatus: 'failed'
      });

      return res.status(400).json({
        success: false,
        message: paymentError.message
      });
    }
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payment'
    });
  }
});

// @desc    Get payment status
// @route   GET /api/payments/status/:orderId
// @access  Private
router.get('/status/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.orderId,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        amount: order.totalAmount
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment status'
    });
  }
});

// @desc    Refund payment
// @route   POST /api/payments/refund
// @access  Private
router.post('/refund', [
  protect,
  body('orderId')
    .isInt({ min: 1 })
    .withMessage('Valid order ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Valid refund amount is required'),
  body('reason')
    .isString()
    .isLength({ min: 10, max: 500 })
    .withMessage('Refund reason is required (10-500 characters)')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId, amount, reason } = req.body;

    // Get order
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order has not been paid'
      });
    }

    if (amount > order.totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed order total'
      });
    }

    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate refund transaction
    const refund = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalTransactionId: order.paymentIntentId,
      amount: amount,
      reason: reason,
      status: 'succeeded',
      processedAt: new Date(),
      refundMethod: 'original_payment_method'
    };

    // Update order
    const newStatus = amount === order.totalAmount ? 'refunded' : 'partially_refunded';
    await order.update({
      paymentStatus: newStatus,
      status: newStatus
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refund,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus
        }
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing refund'
    });
  }
});

module.exports = router;






