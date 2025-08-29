const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WishlistItem = sequelize.define('WishlistItem', {
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
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: true,
    defaultValue: 'medium'
  },
  priceWhenAdded: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'wishlist_items',
  timestamps: true
});

const Wishlist = sequelize.define('Wishlist', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'My Wishlist'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'wishlists',
  timestamps: true
});

// Associations
Wishlist.hasMany(WishlistItem, { foreignKey: 'wishlistId', as: 'items' });
WishlistItem.belongsTo(Wishlist, { foreignKey: 'wishlistId', as: 'wishlist' });

// Instance methods
Wishlist.prototype.getItemCount = function() {
  return this.items ? this.items.length : 0;
};

Wishlist.prototype.getTotalValue = function() {
  if (!this.items) return 0;
  return this.items.reduce((total, item) => {
    return total + (item.priceWhenAdded || 0);
  }, 0);
};

Wishlist.prototype.getAvailableItems = function() {
  if (!this.items) return [];
  return this.items.filter(item => item.isAvailable);
};

Wishlist.prototype.getUnavailableItems = function() {
  if (!this.items) return [];
  return this.items.filter(item => !item.isAvailable);
};

module.exports = { Wishlist, WishlistItem };


