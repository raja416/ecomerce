const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Analytics = sequelize.define('Analytics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM(
      'page_view',
      'product_view',
      'cart_add',
      'cart_remove',
      'purchase',
      'search',
      'wishlist_add',
      'wishlist_remove',
      'review',
      'rating',
      'email_open',
      'email_click',
      'banner_click',
      'coupon_use',
      'return',
      'refund',
      'support_ticket',
      'login',
      'logout',
      'registration'
    ),
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sessionId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // Entity tracking
  entityType: {
    type: DataTypes.ENUM('product', 'category', 'vendor', 'order', 'coupon', 'page'),
    allowNull: true
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Event data
  eventData: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  // User context
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  referrer: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Location data
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // Device information
  deviceType: {
    type: DataTypes.ENUM('desktop', 'mobile', 'tablet'),
    allowNull: true
  },
  browser: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  os: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // Campaign tracking
  utmSource: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  utmMedium: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  utmCampaign: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  utmTerm: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  utmContent: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // Performance metrics
  loadTime: {
    type: DataTypes.INTEGER, // in milliseconds
    allowNull: true
  },
  // Conversion tracking
  conversionValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  conversionCurrency: {
    type: DataTypes.STRING(3),
    allowNull: true,
    defaultValue: 'USD'
  }
}, {
  tableName: 'analytics',
  indexes: [
    { fields: ['type'] },
    { fields: ['userId'] },
    { fields: ['sessionId'] },
    { fields: ['entityType', 'entityId'] },
    { fields: ['createdAt'] },
    { fields: ['country'] },
    { fields: ['deviceType'] }
  ]
});

// Static methods for analytics queries
Analytics.getPageViews = function(startDate, endDate, options = {}) {
  const whereClause = {
    type: 'page_view',
    createdAt: {
      [sequelize.Op.between]: [startDate, endDate]
    }
  };

  if (options.userId) {
    whereClause.userId = options.userId;
  }

  return this.findAll({
    where: whereClause,
    attributes: [
      'entityId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'viewCount'],
      [sequelize.fn('DATE', sequelize.col('createdAt')), 'date']
    ],
    group: ['entityId', sequelize.fn('DATE', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
  });
};

Analytics.getProductViews = function(startDate, endDate, options = {}) {
  const whereClause = {
    type: 'product_view',
    createdAt: {
      [sequelize.Op.between]: [startDate, endDate]
    }
  };

  if (options.userId) {
    whereClause.userId = options.userId;
  }

  return this.findAll({
    where: whereClause,
    attributes: [
      'entityId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'viewCount'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'uniqueUsers']
    ],
    group: ['entityId'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    limit: options.limit || 10
  });
};

Analytics.getConversionRate = function(startDate, endDate, options = {}) {
  const whereClause = {
    createdAt: {
      [sequelize.Op.between]: [startDate, endDate]
    }
  };

  if (options.userId) {
    whereClause.userId = options.userId;
  }

  return this.findAll({
    where: whereClause,
    attributes: [
      'type',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['type'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
  });
};

Analytics.getSalesAnalytics = function(startDate, endDate, options = {}) {
  const whereClause = {
    type: 'purchase',
    createdAt: {
      [sequelize.Op.between]: [startDate, endDate]
    }
  };

  if (options.userId) {
    whereClause.userId = options.userId;
  }

  return this.findAll({
    where: whereClause,
    attributes: [
      [sequelize.fn('SUM', sequelize.col('conversionValue')), 'totalSales'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
      [sequelize.fn('AVG', sequelize.col('conversionValue')), 'averageOrderValue'],
      [sequelize.fn('DATE', sequelize.col('createdAt')), 'date']
    ],
    group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
  });
};

Analytics.getUserJourney = function(userId, startDate, endDate) {
  return this.findAll({
    where: {
      userId,
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: ['type', 'entityType', 'entityId', 'eventData', 'createdAt'],
    order: [['createdAt', 'ASC']]
  });
};

Analytics.getTopProducts = function(startDate, endDate, limit = 10) {
  return this.findAll({
    where: {
      type: 'product_view',
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'entityId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'viewCount'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'uniqueUsers']
    ],
    group: ['entityId'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    limit
  });
};

Analytics.getGeographicData = function(startDate, endDate) {
  return this.findAll({
    where: {
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      },
      country: {
        [sequelize.Op.ne]: null
      }
    },
    attributes: [
      'country',
      'region',
      'city',
      [sequelize.fn('COUNT', sequelize.col('id')), 'eventCount']
    ],
    group: ['country', 'region', 'city'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
  });
};

Analytics.getDeviceAnalytics = function(startDate, endDate) {
  return this.findAll({
    where: {
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      },
      deviceType: {
        [sequelize.Op.ne]: null
      }
    },
    attributes: [
      'deviceType',
      'browser',
      'os',
      [sequelize.fn('COUNT', sequelize.col('id')), 'eventCount']
    ],
    group: ['deviceType', 'browser', 'os'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
  });
};

Analytics.getSearchAnalytics = function(startDate, endDate) {
  return this.findAll({
    where: {
      type: 'search',
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      [sequelize.fn('JSON_EXTRACT', sequelize.col('eventData'), '$.query'), 'searchQuery'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'searchCount']
    ],
    group: [sequelize.fn('JSON_EXTRACT', sequelize.col('eventData'), '$.query')],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    limit: 20
  });
};

// Instance methods
Analytics.prototype.getRelatedEvents = function(timeWindow = 3600000) { // 1 hour default
  return Analytics.findAll({
    where: {
      sessionId: this.sessionId,
      createdAt: {
        [sequelize.Op.between]: [
          new Date(this.createdAt.getTime() - timeWindow),
          new Date(this.createdAt.getTime() + timeWindow)
        ]
      }
    },
    order: [['createdAt', 'ASC']]
  });
};

// Associations
Analytics.belongsTo(sequelize.models.User, { as: 'user', foreignKey: 'userId' });

module.exports = Analytics;




