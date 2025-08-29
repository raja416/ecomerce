const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recommendation = sequelize.define('Recommendation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null for anonymous users
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sessionId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  // Recommendation algorithm type
  algorithm: {
    type: DataTypes.ENUM(
      'collaborative_filtering',
      'content_based',
      'hybrid',
      'popularity',
      'recently_viewed',
      'frequently_bought_together',
      'category_based',
      'brand_based',
      'price_based',
      'seasonal'
    ),
    allowNull: false
  },
  // Recommendation score (0-1)
  score: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
    validate: {
      min: 0,
      max: 1
    }
  },
  // Recommendation context
  context: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  // User interaction with recommendation
  isClicked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPurchased: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isDismissed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Interaction timestamps
  clickedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  purchasedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dismissedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Recommendation position/placement
  position: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  placement: {
    type: DataTypes.ENUM(
      'homepage',
      'product_page',
      'category_page',
      'search_results',
      'cart_page',
      'checkout_page',
      'email',
      'push_notification',
      'banner',
      'sidebar'
    ),
    allowNull: true
  },
  // A/B testing
  experimentId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  variant: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  // Performance metrics
  clickThroughRate: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true
  },
  conversionRate: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true
  },
  // Recommendation metadata
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'recommendations',
  indexes: [
    { fields: ['userId'] },
    { fields: ['sessionId'] },
    { fields: ['productId'] },
    { fields: ['algorithm'] },
    { fields: ['score'] },
    { fields: ['placement'] },
    { fields: ['createdAt'] }
  ]
});

// Static methods for recommendation generation
Recommendation.generateCollaborativeFiltering = async function(userId, limit = 10) {
  const { Product, Order, Analytics } = sequelize.models;
  const { Op } = require('sequelize');

  // Find users with similar purchase patterns
  const userOrders = await Order.findAll({
    where: { userId },
    include: [{ model: Product, as: 'products' }]
  });

  const userProductIds = userOrders.flatMap(order => 
    order.products.map(product => product.id)
  );

  // Find other users who bought similar products
  const similarUsers = await Order.findAll({
    where: {
      userId: { [Op.ne]: userId },
      '$products.id$': { [Op.in]: userProductIds }
    },
    include: [{ model: Product, as: 'products' }],
    group: ['userId']
  });

  const similarUserIds = similarUsers.map(order => order.userId);

  // Get products bought by similar users
  const recommendedProducts = await Order.findAll({
    where: {
      userId: { [Op.in]: similarUserIds },
      '$products.id$': { [Op.notIn]: userProductIds }
    },
    include: [{ model: Product, as: 'products' }],
    attributes: [
      'productId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'purchaseCount']
    ],
    group: ['productId'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    limit
  });

  return recommendedProducts.map(item => ({
    productId: item.productId,
    score: item.dataValues.purchaseCount / Math.max(...recommendedProducts.map(p => p.dataValues.purchaseCount)),
    algorithm: 'collaborative_filtering'
  }));
};

Recommendation.generateContentBased = async function(userId, limit = 10) {
  const { Product, Analytics } = sequelize.models;
  const { Op } = require('sequelize');

  // Get user's viewed products and their categories/brands
  const userViews = await Analytics.findAll({
    where: {
      userId,
      type: 'product_view'
    },
    attributes: ['entityId'],
    order: [['createdAt', 'DESC']],
    limit: 50
  });

  const viewedProductIds = userViews.map(view => view.entityId);

  // Get categories and brands of viewed products
  const viewedProducts = await Product.findAll({
    where: { id: { [Op.in]: viewedProductIds } },
    attributes: ['categoryId', 'brand']
  });

  const userCategories = [...new Set(viewedProducts.map(p => p.categoryId))];
  const userBrands = [...new Set(viewedProducts.map(p => p.brand))];

  // Find similar products
  const similarProducts = await Product.findAll({
    where: {
      id: { [Op.notIn]: viewedProductIds },
      isActive: true,
      status: 'published',
      [Op.or]: [
        { categoryId: { [Op.in]: userCategories } },
        { brand: { [Op.in]: userBrands } }
      ]
    },
    attributes: [
      'id',
      'categoryId',
      'brand',
      'rating',
      'viewCount'
    ],
    order: [['rating', 'DESC'], ['viewCount', 'DESC']],
    limit
  });

  return similarProducts.map(product => ({
    productId: product.id,
    score: (product.rating.average / 5) * 0.7 + (product.viewCount / 1000) * 0.3,
    algorithm: 'content_based',
    context: {
      categoryId: product.categoryId,
      brand: product.brand
    }
  }));
};

Recommendation.generateFrequentlyBoughtTogether = async function(productId, limit = 5) {
  const { Order } = sequelize.models;
  const { Op } = require('sequelize');

  // Find orders that contain the target product
  const ordersWithProduct = await Order.findAll({
    where: {
      '$products.id$': productId
    },
    include: [{ model: sequelize.models.Product, as: 'products' }]
  });

  const orderIds = ordersWithProduct.map(order => order.id);

  // Find other products frequently bought with the target product
  const frequentlyBought = await Order.findAll({
    where: {
      id: { [Op.in]: orderIds },
      '$products.id$': { [Op.ne]: productId }
    },
    include: [{ model: sequelize.models.Product, as: 'products' }],
    attributes: [
      'productId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'coOccurrence']
    ],
    group: ['productId'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    limit
  });

  return frequentlyBought.map(item => ({
    productId: item.productId,
    score: item.dataValues.coOccurrence / Math.max(...frequentlyBought.map(f => f.dataValues.coOccurrence)),
    algorithm: 'frequently_bought_together'
  }));
};

Recommendation.generatePopularityBased = async function(limit = 10) {
  const { Product } = sequelize.models;

  const popularProducts = await Product.findAll({
    where: {
      isActive: true,
      status: 'published'
    },
    attributes: [
      'id',
      'viewCount',
      'purchaseCount',
      'rating'
    ],
    order: [
      ['purchaseCount', 'DESC'],
      ['viewCount', 'DESC']
    ],
    limit
  });

  return popularProducts.map(product => ({
    productId: product.id,
    score: (product.purchaseCount / 100) * 0.6 + (product.viewCount / 1000) * 0.4,
    algorithm: 'popularity'
  }));
};

Recommendation.generateSeasonalRecommendations = async function(limit = 10) {
  const { Product } = sequelize.models;
  const currentMonth = new Date().getMonth();

  // Define seasonal categories
  const seasonalCategories = {
    11: [1, 2, 3], // December - Winter
    0: [1, 2, 3],  // January - Winter
    1: [1, 2, 3],  // February - Winter
    2: [4, 5, 6],  // March - Spring
    3: [4, 5, 6],  // April - Spring
    4: [4, 5, 6],  // May - Spring
    5: [7, 8, 9],  // June - Summer
    6: [7, 8, 9],  // July - Summer
    7: [7, 8, 9],  // August - Summer
    8: [10, 11, 12], // September - Fall
    9: [10, 11, 12], // October - Fall
    10: [10, 11, 12] // November - Fall
  };

  const currentSeasonalCategories = seasonalCategories[currentMonth] || [];

  const seasonalProducts = await Product.findAll({
    where: {
      isActive: true,
      status: 'published',
      categoryId: { [sequelize.Op.in]: currentSeasonalCategories }
    },
    attributes: [
      'id',
      'viewCount',
      'purchaseCount',
      'rating'
    ],
    order: [
      ['purchaseCount', 'DESC'],
      ['rating', 'DESC']
    ],
    limit
  });

  return seasonalProducts.map(product => ({
    productId: product.id,
    score: (product.purchaseCount / 100) * 0.5 + (product.rating.average / 5) * 0.5,
    algorithm: 'seasonal',
    context: {
      season: currentMonth,
      categories: currentSeasonalCategories
    }
  }));
};

// Instance methods
Recommendation.prototype.markAsClicked = async function() {
  this.isClicked = true;
  this.clickedAt = new Date();
  return await this.save();
};

Recommendation.prototype.markAsPurchased = async function() {
  this.isPurchased = true;
  this.purchasedAt = new Date();
  return await this.save();
};

Recommendation.prototype.markAsDismissed = async function() {
  this.isDismissed = true;
  this.dismissedAt = new Date();
  return await this.save();
};

Recommendation.prototype.updatePerformanceMetrics = async function() {
  // Calculate CTR and conversion rate based on interactions
  const totalShown = 1; // This would be calculated from analytics
  this.clickThroughRate = this.isClicked ? 1 : 0;
  this.conversionRate = this.isPurchased ? 1 : 0;
  
  return await this.save();
};

// Static methods for analytics
Recommendation.getPerformanceByAlgorithm = function(startDate, endDate) {
  return this.findAll({
    where: {
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'algorithm',
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalShown'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN isClicked = 1 THEN 1 ELSE 0 END')), 'totalClicks'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN isPurchased = 1 THEN 1 ELSE 0 END')), 'totalPurchases']
    ],
    group: ['algorithm'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
  });
};

// Associations
Recommendation.belongsTo(sequelize.models.User, { as: 'user', foreignKey: 'userId' });
Recommendation.belongsTo(sequelize.models.Product, { as: 'product', foreignKey: 'productId' });

module.exports = Recommendation;




