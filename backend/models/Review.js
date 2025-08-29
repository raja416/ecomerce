const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isHelpful: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isNotHelpful: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  adminResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  helpfulVotes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'user_id']
    }
  ]
});

// Instance methods
Review.prototype.markAsHelpful = function(userId) {
  if (!this.helpfulVotes.includes(userId)) {
    this.helpfulVotes.push(userId);
    this.isHelpful += 1;
  }
  return this.save();
};

Review.prototype.markAsNotHelpful = function(userId) {
  if (!this.helpfulVotes.includes(userId)) {
    this.helpfulVotes.push(userId);
    this.isNotHelpful += 1;
  }
  return this.save();
};

Review.prototype.verifyPurchase = function() {
  this.isVerified = true;
  return this.save();
};

// Class methods
Review.findByProduct = function(productId, options = {}) {
  const defaultOptions = {
    where: { productId, status: 'approved' },
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['id', 'firstName', 'lastName', 'avatar']
    }],
    order: [['createdAt', 'DESC']]
  };
  
  return this.findAll({ ...defaultOptions, ...options });
};

Review.getProductStats = async function(productId) {
  const stats = await this.findOne({
    where: { productId, status: 'approved' },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
      [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 5 THEN 1 ELSE 0 END')), 'fiveStar'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 4 THEN 1 ELSE 0 END')), 'fourStar'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 3 THEN 1 ELSE 0 END')), 'threeStar'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 2 THEN 1 ELSE 0 END')), 'twoStar'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 1 THEN 1 ELSE 0 END')), 'oneStar']
    ]
  });
  
  return stats;
};

Review.findByUser = function(userId) {
  return this.findAll({
    where: { userId },
    include: [{
      model: sequelize.models.Product,
      as: 'product',
      attributes: ['id', 'name', 'image']
    }],
    order: [['createdAt', 'DESC']]
  });
};

Review.findVerified = function(productId) {
  return this.findAll({
    where: { productId, isVerified: true, status: 'approved' },
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['id', 'firstName', 'lastName', 'avatar']
    }],
    order: [['createdAt', 'DESC']]
  });
};

module.exports = Review;


