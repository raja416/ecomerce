const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  reviews: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'products',
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['category']
    },
    {
      fields: ['brand']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isFeatured']
    }
  ],
  hooks: {
    beforeCreate: (product) => {
      if (!product.sku) {
        product.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    }
  }
});

// Instance methods
Product.prototype.getDiscountPercentage = function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return this.discount || 0;
};

Product.prototype.getSalePrice = function() {
  if (this.discount && this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
};

Product.prototype.isInStock = function() {
  return this.stock > 0 && this.inStock;
};

Product.prototype.isOutOfStock = function() {
  return this.stock === 0 || !this.inStock;
};

// Static methods
Product.findFeatured = function() {
  return this.findAll({
    where: { isActive: true, isFeatured: true },
    order: [['createdAt', 'DESC']]
  });
};

Product.findByCategory = function(category) {
  return this.findAll({
    where: { category, isActive: true },
    order: [['createdAt', 'DESC']]
  });
};

Product.search = function(query) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        { name: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { brand: { [Op.like]: `%${query}%` } }
      ]
    },
    order: [['createdAt', 'DESC']]
  });
};

module.exports = Product;
