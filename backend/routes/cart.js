const express = require('express');
const { body, validationResult } = require('express-validator');
const { Cart, CartItem } = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({
      where: { userId: req.user.id, isActive: true },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    if (!cart) {
      // Create empty cart if none exists
      cart = await Cart.create({ 
        userId: req.user.id,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    res.json({
      success: true,
      data: {
        cart: {
          id: cart.id,
          items: cart.items || [],
          total: cart.getTotal ? cart.getTotal() : 0,
          itemCount: cart.items ? cart.items.length : 0
        }
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { productId, quantity } = req.body;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found'
        }
      });
    }

    // Get or create cart
    let [cart] = await Cart.findOrCreate({
      where: { userId: req.user.id, isActive: true },
      defaults: {
        userId: req.user.id,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId: productId }
    });

    if (cartItem) {
      // Update existing item quantity
      cartItem.quantity += quantity;
      cartItem.price = product.price;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId: productId,
        quantity: quantity,
        price: product.price
      });
    }

    // Refresh cart data
    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: {
        cart: {
          id: updatedCart.id,
          items: updatedCart.items || [],
          total: updatedCart.getTotal ? updatedCart.getTotal() : 0,
          itemCount: updatedCart.items ? updatedCart.items.length : 0
        }
      },
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
router.put('/:itemId', [
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { quantity } = req.body;
    const { itemId } = req.params;

    // Get user's cart
    const cart = await Cart.findOne({
      where: { userId: req.user.id, isActive: true }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Cart not found'
        }
      });
    }

    // Find the cart item
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found in cart'
        }
      });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      await cartItem.destroy();
    } else {
      // Update quantity
      cartItem.quantity = quantity;
      await cartItem.save();
    }

    // Refresh cart data
    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: {
        cart: {
          id: updatedCart.id,
          items: updatedCart.items || [],
          total: updatedCart.getTotal ? updatedCart.getTotal() : 0,
          itemCount: updatedCart.items ? updatedCart.items.length : 0
        }
      },
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    // Get user's cart
    const cart = await Cart.findOne({
      where: { userId: req.user.id, isActive: true }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Cart not found'
        }
      });
    }

    // Find and remove the cart item
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found in cart'
        }
      });
    }

    await cartItem.destroy();

    // Refresh cart data
    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: {
        cart: {
          id: updatedCart.id,
          items: updatedCart.items || [],
          total: updatedCart.getTotal ? updatedCart.getTotal() : 0,
          itemCount: updatedCart.items ? updatedCart.items.length : 0
        }
      },
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({
      where: { userId: req.user.id, isActive: true }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Cart not found'
        }
      });
    }

    // Clear all items in cart
    await CartItem.destroy({
      where: { cartId: cart.id }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

module.exports = router;







