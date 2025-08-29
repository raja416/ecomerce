const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  productName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  productImage: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  discount: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  finalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  productVariant: {
    type: DataTypes.JSON,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  hooks: {
    beforeCreate: (orderItem) => {
      // Calculate total price
      orderItem.totalPrice = parseFloat(orderItem.unitPrice) * orderItem.quantity;
      
      // Calculate discount amount
      orderItem.discountAmount = (orderItem.totalPrice * parseFloat(orderItem.discount)) / 100;
      
      // Calculate final price
      orderItem.finalPrice = orderItem.totalPrice - orderItem.discountAmount;
    },
    beforeUpdate: (orderItem) => {
      if (orderItem.changed('unitPrice') || orderItem.changed('quantity') || orderItem.changed('discount')) {
        // Recalculate total price
        orderItem.totalPrice = parseFloat(orderItem.unitPrice) * orderItem.quantity;
        
        // Recalculate discount amount
        orderItem.discountAmount = (orderItem.totalPrice * parseFloat(orderItem.discount)) / 100;
        
        // Recalculate final price
        orderItem.finalPrice = orderItem.totalPrice - orderItem.discountAmount;
      }
    }
  }
});

// Instance methods
OrderItem.prototype.calculateTotals = function() {
  this.totalPrice = parseFloat(this.unitPrice) * this.quantity;
  this.discountAmount = (this.totalPrice * parseFloat(this.discount)) / 100;
  this.finalPrice = this.totalPrice - this.discountAmount;
  return this;
};

// Class methods
OrderItem.findByOrder = function(orderId) {
  return this.findAll({ 
    where: { orderId },
    order: [['createdAt', 'ASC']]
  });
};

OrderItem.getOrderItemsWithProduct = function(orderId) {
  return this.findAll({
    where: { orderId },
    include: [{
      model: sequelize.models.Product,
      as: 'product',
      attributes: ['id', 'name', 'image', 'description']
    }],
    order: [['createdAt', 'ASC']]
  });
};

module.exports = OrderItem;


