const express = require('express');
const { body, validationResult } = require('express-validator');
const Coupon = require('../models/Coupon');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all active coupons (Public)
// @route   GET /api/coupons
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, type } = req.query;
    
    const whereClause = { 
      isActive: true,
      expiresAt: { [require('sequelize').Op.gt]: new Date() }
    };
    if (category) whereClause.categories = category;
    if (type) whereClause.type = type;

    const coupons = await Coupon.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        coupons: coupons.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(coupons.count / parseInt(limit)),
          totalItems: coupons.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Get single coupon by code
// @route   GET /api/coupons/:code
// @access  Public
router.get('/:code', async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      where: {
        code: req.params.code.toUpperCase(),
        isActive: true,
        expiresAt: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Coupon not found or expired'
        }
      });
    }

    res.json({
      success: true,
      data: {
        coupon
      }
    });
  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Validate coupon for cart
// @route   POST /api/coupons/validate
// @access  Private
router.post('/validate', protect, [
  body('code')
    .notEmpty()
    .trim()
    .withMessage('Coupon code is required'),
  body('cartTotal')
    .isFloat({ min: 0 })
    .withMessage('Cart total must be a positive number')
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

    const { code, cartTotal } = req.body;

    // Find coupon
    const coupon = await Coupon.findOne({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        expiresAt: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Coupon not found or expired'
        }
      });
    }

    // Check minimum order value
    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Minimum order value is $${coupon.minOrderValue}`
        }
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          discountValue: coupon.discountValue,
          maxDiscount: coupon.maxDiscount,
          minOrderValue: coupon.minOrderValue
        },
        discountAmount,
        finalTotal: cartTotal - discountAmount
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// Admin routes
// @desc    Create coupon (Admin only)
// @route   POST /api/coupons/admin
// @access  Private (Admin only)
router.post('/admin', protect, authorize('admin'), [
  body('code')
    .notEmpty()
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Code must be 3-20 characters, uppercase letters and numbers only'),
  body('type')
    .isIn(['percentage', 'fixed', 'free_shipping'])
    .withMessage('Type must be percentage, fixed, or free_shipping'),
  body('value')
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number'),
  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a positive number'),
  body('maxDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be a positive number'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('userUsageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User usage limit must be a positive integer'),
  body('expiresAt')
    .isISO8601()
    .withMessage('Expiration date must be a valid date'),
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
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

    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      userUsageLimit,
      expiresAt,
      categories,
      description
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Coupon code already exists'
        }
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      userUsageLimit,
      expiresAt,
      categories,
      description
    });

    res.status(201).json({
      success: true,
      data: {
        coupon
      },
      message: 'Coupon created successfully'
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons/admin/all
// @access  Private (Admin only)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive, type, search } = req.query;
    
    const whereClause = {};
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';
    if (type) whereClause.type = type;
    if (search) {
      whereClause.$or = [
        { code: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const coupons = await Coupon.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        coupons: coupons.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(coupons.count / parseInt(limit)),
          totalItems: coupons.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all coupons error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Get single coupon (Admin only)
// @route   GET /api/coupons/admin/:id
// @access  Private (Admin only)
router.get('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Coupon not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        coupon
      }
    });
  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Update coupon (Admin only)
// @route   PUT /api/coupons/admin/:id
// @access  Private (Admin only)
router.put('/admin/:id', protect, authorize('admin'), [
  body('type')
    .optional()
    .isIn(['percentage', 'fixed', 'free_shipping'])
    .withMessage('Type must be percentage, fixed, or free_shipping'),
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number'),
  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a positive number'),
  body('maxDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be a positive number'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('userUsageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User usage limit must be a positive integer'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid date'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
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

    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Coupon not found'
        }
      });
    }

    // Update coupon
    const updatedCoupon = await Coupon.update(
      req.body,
      {
        where: { id: req.params.id },
        returning: true,
        plain: true
      }
    );

    res.json({
      success: true,
      data: {
        coupon: updatedCoupon[1]
      },
      message: 'Coupon updated successfully'
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Delete coupon (Admin only)
// @route   DELETE /api/coupons/admin/:id
// @access  Private (Admin only)
router.delete('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Coupon not found'
        }
      });
    }

    // Soft delete - set isActive to false
    await Coupon.update({ isActive: false }, { where: { id: req.params.id } });

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Get coupon statistics (Admin only)
// @route   GET /api/coupons/admin/stats
// @access  Private (Admin only)
router.get('/admin/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await Coupon.findAll({
      attributes: [
        'id',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalCoupons'],
        [require('sequelize').fn('SUM', require('sequelize').literal('isActive')), 'activeCoupons'],
        [require('sequelize').fn('SUM', require('sequelize').literal('expiresAt < NOW()')), 'expiredCoupons'],
        [require('sequelize').fn('SUM', require('sequelize').col('usageCount')), 'totalUsage'],
        [require('sequelize').fn('SUM', require('sequelize').col('totalDiscount')), 'totalDiscount']
      ],
      group: ['id']
    });

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalCoupons: 0,
          activeCoupons: 0,
          expiredCoupons: 0,
          totalUsage: 0,
          totalDiscount: 0
        }
      }
    });
  } catch (error) {
    console.error('Get coupon stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

module.exports = router;







