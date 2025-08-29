const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  variantName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  variantOption: {
    type: DataTypes.STRING,
    allowNull: true
  },
  variantPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'cart_items',
  timestamps: true
});

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  couponCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  couponDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  couponDiscountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: true,
    defaultValue: 'percentage'
  },
  shippingAddressType: {
    type: DataTypes.ENUM('home', 'work', 'other'),
    allowNull: true,
    defaultValue: 'home'
  },
  shippingStreet: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingCity: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingState: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingZipCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingCountry: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'United States'
  },
  shippingMethodName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingMethodPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  shippingEstimatedDays: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }
}, {
  tableName: 'carts',
  timestamps: true
});

// Associations
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

// Instance methods
Cart.prototype.getTotal = function() {
  if (!this.items) return 0;
  return this.items.reduce((total, item) => {
    const itemPrice = item.variantPrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
};

Cart.prototype.getSubtotal = function() {
  if (!this.items) return 0;
  return this.items.reduce((total, item) => {
    const itemPrice = item.variantPrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
};

Cart.prototype.getDiscount = function() {
  if (!this.couponDiscount) return 0;
  const subtotal = this.getSubtotal();
  if (this.couponDiscountType === 'percentage') {
    return (subtotal * this.couponDiscount) / 100;
  }
  return this.couponDiscount;
};

Cart.prototype.getShipping = function() {
  return this.shippingMethodPrice || 0;
};

Cart.prototype.getGrandTotal = function() {
  const subtotal = this.getSubtotal();
  const discount = this.getDiscount();
  const shipping = this.getShipping();
  return subtotal - discount + shipping;
};

module.exports = { Cart, CartItem };


