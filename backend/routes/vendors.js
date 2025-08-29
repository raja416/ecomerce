const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');

// Get all vendors (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, featured, search } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = { status: 'approved', isVerified: true };
    
    if (featured === 'true') {
      whereClause.isFeatured = true;
    }
    
    if (search) {
      whereClause[sequelize.Op.or] = [
        { businessName: { [sequelize.Op.like]: `%${search}%` } },
        { businessDescription: { [sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    const vendors = await Vendor.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'avatar'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['totalSales', 'DESC']]
    });
    
    res.json({
      success: true,
      data: vendors.rows,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(vendors.count / limit),
        totalItems: vendors.count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get vendor by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      where: { id: req.params.id, status: 'approved' },
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'avatar'] },
        { 
          model: Product, 
          as: 'products', 
          where: { isActive: true, status: 'published' },
          required: false,
          include: [{ model: sequelize.models.Category, as: 'category' }]
        }
      ]
    });
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get vendor products
router.get('/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, sort = 'newest' } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = { 
      vendorId: req.params.id,
      isActive: true, 
      status: 'published' 
    };
    
    if (category) {
      whereClause.categoryId = category;
    }
    
    let orderClause = [['createdAt', 'DESC']];
    if (sort === 'price_low') orderClause = [['price', 'ASC']];
    if (sort === 'price_high') orderClause = [['price', 'DESC']];
    if (sort === 'popular') orderClause = [['viewCount', 'DESC']];
    if (sort === 'rating') orderClause = [['rating', 'DESC']];
    
    const products = await Product.findAndCountAll({
      where: whereClause,
      include: [{ model: sequelize.models.Category, as: 'category' }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: orderClause
    });
    
    res.json({
      success: true,
      data: products.rows,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(products.count / limit),
        totalItems: products.count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Apply to become a vendor
router.post('/apply', [
  authenticateToken,
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('businessDescription').notEmpty().withMessage('Business description is required'),
  body('contactEmail').isEmail().withMessage('Valid contact email is required'),
  body('businessType').isIn(['individual', 'company', 'partnership']).withMessage('Valid business type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    // Check if user already has a vendor account
    const existingVendor = await Vendor.findOne({ where: { userId: req.user.id } });
    if (existingVendor) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a vendor account' 
      });
    }
    
    const vendor = await Vendor.create({
      ...req.body,
      userId: req.user.id,
      status: 'pending'
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Vendor application submitted successfully',
      data: vendor 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get vendor dashboard (vendor only)
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    
    // Get vendor statistics
    const totalProducts = await Product.count({ where: { vendorId: vendor.id } });
    const activeProducts = await Product.count({ 
      where: { vendorId: vendor.id, isActive: true, status: 'published' } 
    });
    const lowStockProducts = await Product.count({
      where: {
        vendorId: vendor.id,
        stock: { [sequelize.Op.lte]: sequelize.col('lowStockThreshold') },
        stock: { [sequelize.Op.gt]: 0 }
      }
    });
    
    // Get recent orders (if Order model exists)
    const recentOrders = []; // Placeholder for order data
    
    // Get sales analytics
    const salesData = {
      totalSales: vendor.totalSales,
      totalOrders: vendor.totalOrders,
      averageRating: vendor.averageRating,
      totalReviews: vendor.totalReviews
    };
    
    res.json({
      success: true,
      data: {
        vendor,
        stats: {
          totalProducts,
          activeProducts,
          lowStockProducts,
          recentOrders
        },
        sales: salesData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update vendor profile (vendor only)
router.put('/profile', [
  authenticateToken,
  body('businessName').optional().notEmpty().withMessage('Business name cannot be empty'),
  body('businessDescription').optional().notEmpty().withMessage('Business description cannot be empty'),
  body('contactEmail').optional().isEmail().withMessage('Valid contact email is required'),
  body('website').optional().isURL().withMessage('Valid website URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    
    await vendor.update(req.body);
    
    res.json({ 
      success: true, 
      message: 'Vendor profile updated successfully',
      data: vendor 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all vendor applications
router.get('/admin/applications', [
  authenticateToken, 
  authorizeRoles('admin')
], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    
    const applications = await Vendor.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'avatar'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: applications.rows,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(applications.count / limit),
        totalItems: applications.count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Approve/reject vendor application
router.patch('/admin/:id/status', [
  authenticateToken, 
  authorizeRoles('admin'),
  body('status').isIn(['approved', 'rejected']).withMessage('Valid status is required'),
  body('rejectionReason').optional().notEmpty().withMessage('Rejection reason is required when rejecting')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    
    const updateData = {
      status: req.body.status,
      approvedBy: req.user.id,
      approvedAt: new Date()
    };
    
    if (req.body.status === 'rejected' && req.body.rejectionReason) {
      updateData.rejectionReason = req.body.rejectionReason;
    }
    
    await vendor.update(updateData);
    
    res.json({ 
      success: true, 
      message: `Vendor application ${req.body.status}`,
      data: vendor 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get vendor analytics
router.get('/admin/analytics', [
  authenticateToken, 
  authorizeRoles('admin')
], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const vendors = await Vendor.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ],
      order: [['totalSales', 'DESC']]
    });
    
    const analytics = {
      totalVendors: vendors.length,
      approvedVendors: vendors.filter(v => v.status === 'approved').length,
      pendingVendors: vendors.filter(v => v.status === 'pending').length,
      totalSales: vendors.reduce((sum, v) => sum + parseFloat(v.totalSales), 0),
      topVendors: vendors.slice(0, 10)
    };
    
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;




