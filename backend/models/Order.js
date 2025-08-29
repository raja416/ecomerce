const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  shippingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
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
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paymentIntentId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false
  },
  billingAddress: {
    type: DataTypes.JSON,
    allowNull: false
  },
  shippingMethod: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  trackingNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estimatedDelivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  couponCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  couponDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  }
}, {
  tableName: 'orders',
  timestamps: true,
  hooks: {
    beforeCreate: (order) => {
      if (!order.orderNumber) {
        order.orderNumber = generateOrderNumber();
      }
    }
  }
});

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp.slice(-8)}-${random}`;
}

// Instance methods
Order.prototype.calculateTotal = function() {
  this.totalAmount = parseFloat(this.subtotal) + 
                    parseFloat(this.taxAmount) + 
                    parseFloat(this.shippingAmount) - 
                    parseFloat(this.discountAmount);
  return this.totalAmount;
};

Order.prototype.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Class methods
Order.findByOrderNumber = function(orderNumber) {
  return this.findOne({ where: { orderNumber } });
};

Order.findByUser = function(userId) {
  return this.findAll({ 
    where: { userId },
    order: [['createdAt', 'DESC']]
  });
};

Order.getOrderStats = async function() {
  const stats = await this.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalRevenue']
    ],
    group: ['status']
  });
  return stats;
};

module.exports = Order;


