const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // Mock notifications for now
    const mockNotifications = [
      {
        id: 1,
        userId: req.user.id,
        type: 'order_status',
        title: 'Order Shipped',
        message: 'Your order #12345 has been shipped and is on its way!',
        data: { orderId: 12345, trackingNumber: 'TRK123456789' },
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 2,
        userId: req.user.id,
        type: 'price_drop',
        title: 'Price Drop Alert',
        message: 'Premium Wireless Headphones price dropped by 20%!',
        data: { productId: 1, oldPrice: 399.99, newPrice: 299.99 },
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        id: 3,
        userId: req.user.id,
        type: 'welcome',
        title: 'Welcome to Our Store!',
        message: 'Thank you for joining us. Enjoy 10% off your first order with code WELCOME10',
        data: { couponCode: 'WELCOME10', discount: 10 },
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];

    // Filter by unread if requested
    let filteredNotifications = mockNotifications;
    if (unreadOnly === 'true') {
      filteredNotifications = mockNotifications.filter(n => !n.isRead);
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredNotifications.length / parseInt(limit)),
          totalItems: filteredNotifications.length,
          itemsPerPage: parseInt(limit),
          unreadCount: mockNotifications.filter(n => !n.isRead).length
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    // Mock update - in real app, this would update the database
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', async (req, res) => {
  try {
    // Mock update - in real app, this would update the database
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Mock delete - in real app, this would delete from database
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error'
      }
    });
  }
});

module.exports = router;

