const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vendor = sequelize.define('Vendor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  businessName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  businessDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  banner: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Business information
  businessType: {
    type: DataTypes.ENUM('individual', 'company', 'partnership'),
    defaultValue: 'individual'
  },
  taxId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  businessLicense: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // Commission and payment settings
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 10.00, // 10% default commission
    validate: {
      min: 0,
      max: 100
    }
  },
  minimumPayout: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 50.00
  },
  payoutSchedule: {
    type: DataTypes.ENUM('weekly', 'biweekly', 'monthly'),
    defaultValue: 'monthly'
  },
  // Bank account information
  bankAccount: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Vendor status
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'suspended', 'rejected'),
    defaultValue: 'pending'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Analytics and performance
  totalSales: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Settings
  autoApproveProducts: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notificationSettings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      email: true,
      sms: false,
      push: true
    }
  },
  // SEO and marketing
  seoTitle: {
    type: DataTypes.STRING(60),
    allowNull: true
  },
  seoDescription: {
    type: DataTypes.STRING(160),
    allowNull: true
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  // Social media
  socialMedia: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  // Verification documents
  documents: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  // Approval information
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'vendors',
  hooks: {
    beforeCreate: (vendor) => {
      if (!vendor.seoTitle) {
        vendor.seoTitle = vendor.businessName;
      }
    }
  }
});

// Instance methods
Vendor.prototype.getCommissionAmount = function(orderAmount) {
  return (orderAmount * this.commissionRate) / 100;
};

Vendor.prototype.canReceivePayout = function() {
  return this.totalSales >= this.minimumPayout;
};

Vendor.prototype.getPayoutAmount = function() {
  return this.totalSales;
};

Vendor.prototype.updateAnalytics = async function() {
  const { Product, Order, Review } = sequelize.models;
  const { Op } = require('sequelize');

  // Calculate total sales and orders
  const salesData = await Order.findAll({
    where: {
      vendorId: this.id,
      status: { [Op.in]: ['completed', 'delivered'] }
    },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalSales'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders']
    ]
  });

  if (salesData[0]) {
    this.totalSales = parseFloat(salesData[0].dataValues.totalSales) || 0;
    this.totalOrders = parseInt(salesData[0].dataValues.totalOrders) || 0;
  }

  // Calculate average rating
  const reviewData = await Review.findAll({
    include: [{
      model: Product,
      where: { vendorId: this.id }
    }],
    attributes: [
      [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
    ]
  });

  if (reviewData[0]) {
    this.averageRating = parseFloat(reviewData[0].dataValues.averageRating) || 0;
    this.totalReviews = parseInt(reviewData[0].dataValues.totalReviews) || 0;
  }

  return await this.save();
};

// Static methods
Vendor.findApproved = function() {
  return this.findAll({
    where: { status: 'approved', isVerified: true },
    include: [{ model: sequelize.models.User, as: 'user' }],
    order: [['totalSales', 'DESC']]
  });
};

Vendor.findFeatured = function() {
  return this.findAll({
    where: { status: 'approved', isFeatured: true },
    include: [{ model: sequelize.models.User, as: 'user' }],
    order: [['averageRating', 'DESC']]
  });
};

Vendor.findByCategory = function(categoryId) {
  return this.findAll({
    include: [
      { model: sequelize.models.User, as: 'user' },
      {
        model: sequelize.models.Product,
        where: { categoryId, isActive: true },
        required: true
      }
    ],
    where: { status: 'approved' },
    order: [['averageRating', 'DESC']]
  });
};

Vendor.search = function(query) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      status: 'approved',
      [Op.or]: [
        { businessName: { [Op.like]: `%${query}%` } },
        { businessDescription: { [Op.like]: `%${query}%` } }
      ]
    },
    include: [{ model: sequelize.models.User, as: 'user' }],
    order: [['averageRating', 'DESC']]
  });
};

// Associations
Vendor.belongsTo(sequelize.models.User, { as: 'user', foreignKey: 'userId' });
Vendor.belongsTo(sequelize.models.User, { as: 'approver', foreignKey: 'approvedBy' });
Vendor.hasMany(sequelize.models.Product, { as: 'products', foreignKey: 'vendorId' });
Vendor.hasMany(sequelize.models.Order, { as: 'orders', foreignKey: 'vendorId' });

module.exports = Vendor;




