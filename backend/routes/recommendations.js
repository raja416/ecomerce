const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Recommendation = require('../models/Recommendation');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

// Get personalized recommendations for user
router.get('/personalized', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, placement = 'homepage' } = req.query;
    const userId = req.user.id;

    // Generate recommendations using multiple algorithms
    const [collaborativeRecs, contentRecs, popularRecs] = await Promise.all([
      Recommendation.generateCollaborativeFiltering(userId, Math.ceil(limit / 3)),
      Recommendation.generateContentBased(userId, Math.ceil(limit / 3)),
      Recommendation.generatePopularityBased(Math.ceil(limit / 3))
    ]);

    // Combine and deduplicate recommendations
    const allRecs = [...collaborativeRecs, ...contentRecs, ...popularRecs];
    const uniqueRecs = allRecs.filter((rec, index, self) => 
      index === self.findIndex(r => r.productId === rec.productId)
    );

    // Get product details for recommendations
    const productIds = uniqueRecs.slice(0, limit).map(rec => rec.productId);
    const products = await Product.findAll({
      where: { id: { [sequelize.Op.in]: productIds } },
      include: [{ model: sequelize.models.Category, as: 'category' }]
    });

    // Create recommendation records
    const recommendations = await Promise.all(
      uniqueRecs.slice(0, limit).map(async (rec, index) => {
        const product = products.find(p => p.id === rec.productId);
        if (!product) return null;

        const recommendation = await Recommendation.create({
          userId,
          productId: rec.productId,
          algorithm: rec.algorithm,
          score: rec.score,
          placement,
          position: index + 1,
          context: rec.context || {}
        });

        return {
          ...recommendation.toJSON(),
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            comparePrice: product.comparePrice,
            image: product.getPrimaryImage(),
            category: product.category?.name,
            rating: product.rating,
            isOnSale: product.isOnSale,
            salePercentage: product.salePercentage
          }
        };
      })
    );

    const validRecommendations = recommendations.filter(rec => rec !== null);

    res.json({
      success: true,
      data: validRecommendations,
      meta: {
        total: validRecommendations.length,
        algorithms: {
          collaborative: collaborativeRecs.length,
          content: contentRecs.length,
          popularity: popularRecs.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get frequently bought together recommendations
router.get('/frequently-bought/:productId', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const productId = parseInt(req.params.productId);

    const frequentlyBought = await Recommendation.generateFrequentlyBoughtTogether(productId, parseInt(limit));

    // Get product details
    const productIds = frequentlyBought.map(rec => rec.productId);
    const products = await Product.findAll({
      where: { id: { [sequelize.Op.in]: productIds } },
      include: [{ model: sequelize.models.Category, as: 'category' }]
    });

    const recommendations = frequentlyBought.map(rec => {
      const product = products.find(p => p.id === rec.productId);
      return {
        ...rec,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          comparePrice: product.comparePrice,
          image: product.getPrimaryImage(),
          category: product.category?.name,
          rating: product.rating
        } : null
      };
    });

    res.json({
      success: true,
      data: recommendations.filter(rec => rec.product !== null)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get seasonal recommendations
router.get('/seasonal', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const seasonalRecs = await Recommendation.generateSeasonalRecommendations(parseInt(limit));

    // Get product details
    const productIds = seasonalRecs.map(rec => rec.productId);
    const products = await Product.findAll({
      where: { id: { [sequelize.Op.in]: productIds } },
      include: [{ model: sequelize.models.Category, as: 'category' }]
    });

    const recommendations = seasonalRecs.map(rec => {
      const product = products.find(p => p.id === rec.productId);
      return {
        ...rec,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          comparePrice: product.comparePrice,
          image: product.getPrimaryImage(),
          category: product.category?.name,
          rating: product.rating
        } : null
      };
    });

    res.json({
      success: true,
      data: recommendations.filter(rec => rec.product !== null)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track recommendation interaction
router.post('/track-interaction', [
  authenticateToken,
  body('recommendationId').isInt().withMessage('Valid recommendation ID is required'),
  body('action').isIn(['click', 'purchase', 'dismiss']).withMessage('Valid action is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const recommendation = await Recommendation.findByPk(req.body.recommendationId);
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    // Verify user owns this recommendation or it's anonymous
    if (recommendation.userId && recommendation.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Track the interaction
    switch (req.body.action) {
      case 'click':
        await recommendation.markAsClicked();
        break;
      case 'purchase':
        await recommendation.markAsPurchased();
        break;
      case 'dismiss':
        await recommendation.markAsDismissed();
        break;
    }

    await recommendation.updatePerformanceMetrics();

    res.json({
      success: true,
      message: 'Interaction tracked successfully',
      data: recommendation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recommendation performance analytics (admin only)
router.get('/analytics', [
  authenticateToken,
  authorize('admin')
], async (req, res) => {
  try {
    const { startDate, endDate, algorithm } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const whereClause = {
      createdAt: { [sequelize.Op.between]: [start, end] }
    };

    if (algorithm) {
      whereClause.algorithm = algorithm;
    }

    const performance = await Recommendation.getPerformanceByAlgorithm(start, end);

    // Calculate overall metrics
    const totalShown = performance.reduce((sum, item) => sum + parseInt(item.dataValues.totalShown || 0), 0);
    const totalClicks = performance.reduce((sum, item) => sum + parseInt(item.dataValues.totalClicks || 0), 0);
    const totalPurchases = performance.reduce((sum, item) => sum + parseInt(item.dataValues.totalPurchases || 0), 0);

    const analytics = {
      performance,
      summary: {
        totalShown,
        totalClicks,
        totalPurchases,
        overallCTR: totalShown > 0 ? (totalClicks / totalShown) * 100 : 0,
        overallConversionRate: totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0
      }
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's recommendation history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const recommendations = await Recommendation.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        { 
          model: Product, 
          as: 'product',
          include: [{ model: sequelize.models.Category, as: 'category' }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const formattedRecs = recommendations.rows.map(rec => ({
      id: rec.id,
      algorithm: rec.algorithm,
      score: rec.score,
      placement: rec.placement,
      isClicked: rec.isClicked,
      isPurchased: rec.isPurchased,
      isDismissed: rec.isDismissed,
      createdAt: rec.createdAt,
      product: rec.product ? {
        id: rec.product.id,
        name: rec.product.name,
        price: rec.product.price,
        image: rec.product.getPrimaryImage(),
        category: rec.product.category?.name
      } : null
    }));

    res.json({
      success: true,
      data: formattedRecs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(recommendations.count / limit),
        totalItems: recommendations.count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// A/B test recommendations
router.get('/ab-test', async (req, res) => {
  try {
    const { experimentId, variant } = req.query;
    const sessionId = req.session?.id || req.query.sessionId;

    if (!experimentId || !variant) {
      return res.status(400).json({ 
        success: false, 
        message: 'Experiment ID and variant are required' 
      });
    }

    // Get recommendations based on variant
    let recommendations;
    if (variant === 'A') {
      // Control group - use popularity-based recommendations
      recommendations = await Recommendation.generatePopularityBased(10);
    } else if (variant === 'B') {
      // Test group - use personalized recommendations
      if (req.user) {
        recommendations = await Recommendation.generateCollaborativeFiltering(req.user.id, 10);
      } else {
        recommendations = await Recommendation.generatePopularityBased(10);
      }
    }

    // Get product details
    const productIds = recommendations.map(rec => rec.productId);
    const products = await Product.findAll({
      where: { id: { [sequelize.Op.in]: productIds } },
      include: [{ model: sequelize.models.Category, as: 'category' }]
    });

    const formattedRecs = recommendations.map((rec, index) => {
      const product = products.find(p => p.id === rec.productId);
      return {
        ...rec,
        experimentId,
        variant,
        position: index + 1,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.getPrimaryImage(),
          category: product.category?.name
        } : null
      };
    });

    res.json({
      success: true,
      data: formattedRecs.filter(rec => rec.product !== null),
      meta: {
        experimentId,
        variant,
        sessionId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recommendation insights for a specific product
router.get('/product-insights/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    // Get recommendation performance for this product
    const recommendations = await Recommendation.findAll({
      where: { productId },
      attributes: [
        'algorithm',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalShown'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN isClicked = 1 THEN 1 ELSE 0 END')), 'totalClicks'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN isPurchased = 1 THEN 1 ELSE 0 END')), 'totalPurchases'],
        [sequelize.fn('AVG', sequelize.col('score')), 'averageScore']
      ],
      group: ['algorithm']
    });

    // Get frequently bought together
    const frequentlyBought = await Recommendation.generateFrequentlyBoughtTogether(productId, 5);

    const insights = {
      recommendationPerformance: recommendations,
      frequentlyBoughtTogether: frequentlyBought,
      totalRecommendations: recommendations.reduce((sum, rec) => sum + parseInt(rec.dataValues.totalShown || 0), 0)
    };

    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;




