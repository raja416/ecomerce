const express = require('express');
const { body, validationResult } = require('express-validator');
const { Wishlist, WishlistItem } = require('../models/Wishlist');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: WishlistItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image', 'stock', 'isActive']
            }
          ]
        }
      ]
    });

    if (!wishlist) {
      // Create default wishlist if none exists
      const newWishlist = await Wishlist.create({
        userId: req.user.id,
        name: 'My Wishlist',
        isPublic: false
      });

      return res.json({
        success: true,
        data: {
          wishlist: {
            id: newWishlist.id,
            name: newWishlist.name,
            items: []
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        wishlist: {
          id: wishlist.id,
          name: wishlist.name,
          items: wishlist.items || []
        }
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
router.post('/', [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID is required')
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

    const { productId } = req.body;

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

    // Get or create wishlist
    let [wishlist] = await Wishlist.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId: req.user.id,
        name: 'My Wishlist',
        isPublic: false
      }
    });

    // Check if item already exists in wishlist
    const existingItem = await WishlistItem.findOne({
      where: { wishlistId: wishlist.id, productId: productId }
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Item already exists in wishlist'
        }
      });
    }

    // Add item to wishlist
    await WishlistItem.create({
      wishlistId: wishlist.id,
      productId: productId
    });

    // Refresh wishlist data
    const updatedWishlist = await Wishlist.findOne({
      where: { id: wishlist.id },
      include: [
        {
          model: WishlistItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image', 'stock', 'isActive']
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: {
        wishlist: {
          id: updatedWishlist.id,
          name: updatedWishlist.name,
          items: updatedWishlist.items || []
        }
      },
      message: 'Item added to wishlist successfully'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:itemId
// @access  Private
router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    // Get user's wishlist
    const wishlist = await Wishlist.findOne({
      where: { userId: req.user.id }
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Wishlist not found'
        }
      });
    }

    // Find and remove the wishlist item
    const wishlistItem = await WishlistItem.findOne({
      where: { id: itemId, wishlistId: wishlist.id }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found in wishlist'
        }
      });
    }

    await wishlistItem.destroy();

    // Refresh wishlist data
    const updatedWishlist = await Wishlist.findOne({
      where: { id: wishlist.id },
      include: [
        {
          model: WishlistItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image', 'stock', 'isActive']
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: {
        wishlist: {
          id: updatedWishlist.id,
          name: updatedWishlist.name,
          items: updatedWishlist.items || []
        }
      },
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
router.delete('/', async (req, res) => {
  try {
    // Get user's wishlist
    const wishlist = await Wishlist.findOne({
      where: { userId: req.user.id }
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Wishlist not found'
        }
      });
    }

    // Clear all items in wishlist
    await WishlistItem.destroy({
      where: { wishlistId: wishlist.id }
    });

    res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

module.exports = router;







