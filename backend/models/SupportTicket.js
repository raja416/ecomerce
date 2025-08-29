const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupportTicket = sequelize.define('SupportTicket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticketNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Ticket information
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // Ticket categorization
  category: {
    type: DataTypes.ENUM(
      'general',
      'technical',
      'billing',
      'order',
      'product',
      'shipping',
      'return',
      'refund',
      'account',
      'security',
      'feature_request',
      'bug_report'
    ),
    allowNull: false,
    defaultValue: 'general'
  },
  subcategory: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // Priority and status
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM(
      'open',
      'in_progress',
      'waiting_for_customer',
      'waiting_for_third_party',
      'resolved',
      'closed',
      'cancelled'
    ),
    allowNull: false,
    defaultValue: 'open'
  },
  // Related entities
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  // Customer information
  customerEmail: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  // Ticket metadata
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  // SLA tracking
  slaLevel: {
    type: DataTypes.ENUM('standard', 'premium', 'enterprise'),
    defaultValue: 'standard'
  },
  slaTargetHours: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  slaDueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Resolution tracking
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Customer satisfaction
  customerRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  customerFeedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Internal notes
  internalNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Escalation
  isEscalated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  escalatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  escalatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  escalationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Automation
  isAutomated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  automationRule: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // Follow-up
  followUpDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isFollowUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'support_tickets',
  hooks: {
    beforeCreate: (ticket) => {
      // Generate ticket number
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      ticket.ticketNumber = `TKT-${timestamp}-${random}`;
      
      // Set SLA due date based on priority
      const now = new Date();
      const slaHours = {
        'urgent': 2,
        'high': 4,
        'medium': 24,
        'low': 72
      };
      ticket.slaDueDate = new Date(now.getTime() + (slaHours[ticket.priority] * 60 * 60 * 1000));
    }
  },
  indexes: [
    { fields: ['ticketNumber'] },
    { fields: ['userId'] },
    { fields: ['assignedTo'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['category'] },
    { fields: ['createdAt'] },
    { fields: ['slaDueDate'] }
  ]
});

// Instance methods
SupportTicket.prototype.isOverdue = function() {
  return this.slaDueDate && new Date() > this.slaDueDate && this.status !== 'resolved' && this.status !== 'closed';
};

SupportTicket.prototype.getSlaStatus = function() {
  if (this.status === 'resolved' || this.status === 'closed') {
    return 'completed';
  }
  
  if (this.isOverdue()) {
    return 'overdue';
  }
  
  const now = new Date();
  const timeLeft = this.slaDueDate - now;
  const hoursLeft = timeLeft / (1000 * 60 * 60);
  
  if (hoursLeft < 1) {
    return 'critical';
  } else if (hoursLeft < 4) {
    return 'warning';
  } else {
    return 'on_track';
  }
};

SupportTicket.prototype.escalate = async function(reason, escalatedBy) {
  this.isEscalated = true;
  this.escalatedAt = new Date();
  this.escalatedBy = escalatedBy;
  this.escalationReason = reason;
  this.priority = 'urgent';
  
  return await this.save();
};

SupportTicket.prototype.resolve = async function(resolutionNotes, resolvedBy) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  this.resolutionNotes = resolutionNotes;
  
  return await this.save();
};

SupportTicket.prototype.close = async function() {
  this.status = 'closed';
  return await this.save();
};

SupportTicket.prototype.addResponse = async function(response) {
  // This would typically create a related SupportResponse record
  return await sequelize.models.SupportResponse.create({
    ticketId: this.id,
    ...response
  });
};

// Static methods
SupportTicket.findOverdue = function() {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      slaDueDate: { [Op.lt]: new Date() },
      status: { [Op.notIn]: ['resolved', 'closed'] }
    },
    include: [
      { model: sequelize.models.User, as: 'customer' },
      { model: sequelize.models.User, as: 'assignedAgent' }
    ],
    order: [['slaDueDate', 'ASC']]
  });
};

SupportTicket.findByStatus = function(status) {
  return this.findAll({
    where: { status },
    include: [
      { model: sequelize.models.User, as: 'customer' },
      { model: sequelize.models.User, as: 'assignedAgent' }
    ],
    order: [['createdAt', 'DESC']]
  });
};

SupportTicket.findByPriority = function(priority) {
  return this.findAll({
    where: { priority },
    include: [
      { model: sequelize.models.User, as: 'customer' },
      { model: sequelize.models.User, as: 'assignedAgent' }
    ],
    order: [['createdAt', 'DESC']]
  });
};

SupportTicket.getSlaMetrics = function(startDate, endDate) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'priority',
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalTickets'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN resolvedAt <= slaDueDate THEN 1 ELSE 0 END')), 'metSla'],
      [sequelize.fn('AVG', sequelize.fn('TIMESTAMPDIFF', sequelize.literal('HOUR'), sequelize.col('createdAt'), sequelize.col('resolvedAt'))), 'avgResolutionTime']
    ],
    group: ['priority'],
    order: [['priority', 'ASC']]
  });
};

SupportTicket.getAgentPerformance = function(startDate, endDate) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      assignedTo: { [Op.ne]: null },
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'assignedTo',
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalAssigned'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN status IN ("resolved", "closed") THEN 1 ELSE 0 END')), 'resolved'],
      [sequelize.fn('AVG', sequelize.fn('TIMESTAMPDIFF', sequelize.literal('HOUR'), sequelize.col('createdAt'), sequelize.col('resolvedAt'))), 'avgResolutionTime'],
      [sequelize.fn('AVG', sequelize.col('customerRating')), 'avgRating']
    ],
    group: ['assignedTo'],
    include: [{ model: sequelize.models.User, as: 'assignedAgent', attributes: ['name', 'email'] }],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
  });
};

// Associations
SupportTicket.belongsTo(sequelize.models.User, { as: 'customer', foreignKey: 'userId' });
SupportTicket.belongsTo(sequelize.models.User, { as: 'assignedAgent', foreignKey: 'assignedTo' });
SupportTicket.belongsTo(sequelize.models.User, { as: 'resolver', foreignKey: 'resolvedBy' });
SupportTicket.belongsTo(sequelize.models.User, { as: 'escalator', foreignKey: 'escalatedBy' });
SupportTicket.belongsTo(sequelize.models.Order, { as: 'order', foreignKey: 'orderId' });
SupportTicket.belongsTo(sequelize.models.Product, { as: 'product', foreignKey: 'productId' });

module.exports = SupportTicket;




