const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20]
    }
  },
  type: {
    type: DataTypes.ENUM('percentage', 'fixed', 'free_shipping'),
    allowNull: false,
    defaultValue: 'percentage'
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  minOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  maxDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  userUsageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  usedCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startsAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  applicableCategories: {
    type: DataTypes.JSON,
    allowNull: true
  },
  excludedCategories: {
    type: DataTypes.JSON,
    allowNull: true
  },
  applicableProducts: {
    type: DataTypes.JSON,
    allowNull: true
  },
  excludedProducts: {
    type: DataTypes.JSON,
    allowNull: true
  },
  minItems: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  maxItems: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  firstTimeOnly: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  newCustomerOnly: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'coupons',
  timestamps: true
});

// Instance methods
Coupon.prototype.isValid = function() {
  const now = new Date();
  
  // Check if coupon is active
  if (!this.isActive) return false;
  
  // Check start date
  if (this.startsAt && now < this.startsAt) return false;
  
  // Check expiration date
  if (this.expiresAt && now > this.expiresAt) return false;
  
  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  
  return true;
};

Coupon.prototype.calculateDiscount = function(orderAmount) {
  if (!this.isValid()) return 0;
  
  if (orderAmount < this.minOrderAmount) return 0;

  let discount = 0;

  if (this.type === 'percentage') {
      discount = (orderAmount * this.value) / 100;
  } else if (this.type === 'fixed') {
      discount = this.value;
  } else if (this.type === 'free_shipping') {
    // This would be handled separately in shipping calculation
    discount = 0;
  }
  
  // Apply max discount limit
  if (this.maxDiscount && discount > this.maxDiscount) {
    discount = this.maxDiscount;
  }
  
  return discount;
};

Coupon.prototype.canBeUsedByUser = function(userId, userOrderCount = 0) {
  if (!this.isValid()) return false;
  
  // Check if it's for new customers only
  if (this.newCustomerOnly && userOrderCount > 0) return false;
  
  // Check if it's first time only
  if (this.firstTimeOnly && userOrderCount > 0) return false;
  
  return true;
};

Coupon.prototype.isApplicableToProduct = function(productId, categoryId) {
  // Check excluded products
  if (this.excludedProducts && this.excludedProducts.includes(productId)) {
    return false;
  }
  
  // Check excluded categories
  if (this.excludedCategories && this.excludedCategories.includes(categoryId)) {
    return false;
  }
  
  // Check applicable products (if specified)
  if (this.applicableProducts && this.applicableProducts.length > 0) {
    if (!this.applicableProducts.includes(productId)) {
      return false;
    }
  }
  
  // Check applicable categories (if specified)
  if (this.applicableCategories && this.applicableCategories.length > 0) {
    if (!this.applicableCategories.includes(categoryId)) {
      return false;
    }
  }
  
  return true;
};

Coupon.prototype.incrementUsage = function() {
  this.usedCount += 1;
  return this.save();
};

module.exports = Coupon;







