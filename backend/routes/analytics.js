const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Analytics = require('../models/Analytics');
const Product = require('../models/Product');
const { authenticateToken, authorize } = require('../middleware/auth');

// Track user event
router.post('/track', [
  body('type').isIn([
    'page_view', 'product_view', 'cart_add', 'cart_remove', 'purchase',
    'search', 'wishlist_add', 'wishlist_remove', 'review', 'rating',
    'email_open', 'email_click', 'banner_click', 'coupon_use'
  ]).withMessage('Valid event type is required'),
  body('entityType').optional().isIn(['product', 'category', 'vendor', 'order', 'coupon', 'page']),
  body('entityId').optional().isInt().withMessage('Entity ID must be an integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const eventData = {
      type: req.body.type,
      userId: req.user?.id || null,
      sessionId: req.body.sessionId || req.session?.id,
      entityType: req.body.entityType,
      entityId: req.body.entityId,
      eventData: req.body.eventData || {},
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      referrer: req.get('Referrer'),
      deviceType: req.body.deviceType,
      browser: req.body.browser,
      os: req.body.os,
      utmSource: req.body.utmSource,
      utmMedium: req.body.utmMedium,
      utmCampaign: req.body.utmCampaign,
      utmTerm: req.body.utmTerm,
      utmContent: req.body.utmContent,
      loadTime: req.body.loadTime,
      conversionValue: req.body.conversionValue,
      conversionCurrency: req.body.conversionCurrency || 'USD'
    };

    const analytics = await Analytics.create(eventData);

    // Update product view count if it's a product view
    if (req.body.type === 'product_view' && req.body.entityId) {
      const product = await Product.findByPk(req.body.entityId);
      if (product) {
        await product.incrementViewCount();
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Event tracked successfully',
      data: analytics 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get analytics dashboard (admin only)
router.get('/dashboard', [
  authenticateToken, 
  authorize('admin')
], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const end = endDate ? new Date(endDate) : new Date();

    // Get page views
    const pageViews = await Analytics.getPageViews(start, end);
    
    // Get product views
    const productViews = await Analytics.getProductViews(start, end, { limit: 10 });
    
    // Get conversion rates
    const conversionRates = await Analytics.getConversionRate(start, end);
    
    // Get sales analytics
    const salesAnalytics = await Analytics.getSalesAnalytics(start, end);
    
    // Get geographic data
    const geographicData = await Analytics.getGeographicData(start, end);
    
    // Get device analytics
    const deviceAnalytics = await Analytics.getDeviceAnalytics(start, end);
    
    // Get search analytics
    const searchAnalytics = await Analytics.getSearchAnalytics(start, end);

    const dashboard = {
      pageViews,
      productViews,
      conversionRates,
      salesAnalytics,
      geographicData,
      deviceAnalytics,
      searchAnalytics,
      summary: {
        totalEvents: await Analytics.count({ where: { createdAt: { [sequelize.Op.between]: [start, end] } } }),
        uniqueUsers: await Analytics.count({ 
          where: { 
            createdAt: { [sequelize.Op.between]: [start, end] },
            userId: { [sequelize.Op.ne]: null }
          },
          distinct: true,
          col: 'userId'
        }),
        totalSessions: await Analytics.count({ 
          where: { 
            createdAt: { [sequelize.Op.between]: [start, end] },
            sessionId: { [sequelize.Op.ne]: null }
          },
          distinct: true,
          col: 'sessionId'
        })
      }
    };

    res.json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user journey (admin only)
router.get('/user-journey/:userId', [
  authenticateToken, 
  authorize('admin')
], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    const end = endDate ? new Date(endDate) : new Date();

    const userJourney = await Analytics.getUserJourney(req.params.userId, start, end);

    res.json({ success: true, data: userJourney });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get product analytics
router.get('/products', [
  authenticateToken, 
  authorize('admin')
], async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const topProducts = await Analytics.getTopProducts(start, end, parseInt(limit));

    // Get product details
    const productIds = topProducts.map(item => item.entityId);
    const products = await Product.findAll({
      where: { id: { [sequelize.Op.in]: productIds } },
      include: [{ model: sequelize.models.Category, as: 'category' }]
    });

    const productAnalytics = topProducts.map(item => {
      const product = products.find(p => p.id === item.entityId);
      return {
        ...item.dataValues,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category?.name,
          image: product.getPrimaryImage()
        } : null
      };
    });

    res.json({ success: true, data: productAnalytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sales analytics
router.get('/sales', [
  authenticateToken, 
  authorizeRoles('admin')
], async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const salesAnalytics = await Analytics.getSalesAnalytics(start, end);

    // Calculate additional metrics
    const totalSales = salesAnalytics.reduce((sum, item) => sum + parseFloat(item.dataValues.totalSales || 0), 0);
    const totalOrders = salesAnalytics.reduce((sum, item) => sum + parseInt(item.dataValues.totalOrders || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const analytics = {
      salesData: salesAnalytics,
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
        period: { start, end }
      }
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get conversion funnel
router.get('/conversion-funnel', [
  authenticateToken, 
  authorizeRoles('admin')
], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get counts for each step in the funnel
    const pageViews = await Analytics.count({
      where: {
        type: 'page_view',
        createdAt: { [sequelize.Op.between]: [start, end] }
      }
    });

    const productViews = await Analytics.count({
      where: {
        type: 'product_view',
        createdAt: { [sequelize.Op.between]: [start, end] }
      }
    });

    const cartAdds = await Analytics.count({
      where: {
        type: 'cart_add',
        createdAt: { [sequelize.Op.between]: [start, end] }
      }
    });

    const purchases = await Analytics.count({
      where: {
        type: 'purchase',
        createdAt: { [sequelize.Op.between]: [start, end] }
      }
    });

    const funnel = [
      { step: 'Page Views', count: pageViews, conversionRate: 100 },
      { step: 'Product Views', count: productViews, conversionRate: pageViews > 0 ? (productViews / pageViews) * 100 : 0 },
      { step: 'Cart Adds', count: cartAdds, conversionRate: productViews > 0 ? (cartAdds / productViews) * 100 : 0 },
      { step: 'Purchases', count: purchases, conversionRate: cartAdds > 0 ? (purchases / cartAdds) * 100 : 0 }
    ];

    res.json({ success: true, data: funnel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get real-time analytics
router.get('/realtime', [
  authenticateToken, 
  authorizeRoles('admin')
], async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get events in the last hour
    const recentEvents = await Analytics.findAll({
      where: {
        createdAt: { [sequelize.Op.gte]: oneHourAgo }
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Get active users in the last hour
    const activeUsers = await Analytics.count({
      where: {
        createdAt: { [sequelize.Op.gte]: oneHourAgo },
        userId: { [sequelize.Op.ne]: null }
      },
      distinct: true,
      col: 'userId'
    });

    // Get current sessions
    const activeSessions = await Analytics.count({
      where: {
        createdAt: { [sequelize.Op.gte]: oneHourAgo },
        sessionId: { [sequelize.Op.ne]: null }
      },
      distinct: true,
      col: 'sessionId'
    });

    const realtime = {
      recentEvents,
      activeUsers,
      activeSessions,
      lastUpdated: now
    };

    res.json({ success: true, data: realtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export analytics data
router.get('/export', [
  authenticateToken, 
  authorizeRoles('admin')
], async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await Analytics.findAll({
      where: {
        createdAt: { [sequelize.Op.between]: [start, end] }
      },
      include: [
        { model: sequelize.models.User, as: 'user', attributes: ['name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = analytics.map(item => ({
        id: item.id,
        type: item.type,
        userId: item.user?.name || 'Anonymous',
        sessionId: item.sessionId,
        entityType: item.entityType,
        entityId: item.entityId,
        createdAt: item.createdAt,
        ipAddress: item.ipAddress,
        deviceType: item.deviceType,
        browser: item.browser,
        os: item.os
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}.csv`);
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      res.send(csvString);
    } else {
      res.json({ success: true, data: analytics });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;




