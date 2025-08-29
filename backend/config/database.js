const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecommerce_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    // Disable automatic index creation to avoid "too many keys" error
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully.');
    
    // Only sync in development and with force: false to avoid data loss
    if (process.env.NODE_ENV === 'development') {
      // Use alter: false to prevent automatic schema changes
      await sequelize.sync({ alter: false });
      console.log('✅ Database synchronized safely.');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    // If it's a "too many keys" error, suggest using quick server
    if (error.message.includes('ER_TOO_MANY_KEYS')) {
      console.log('💡 Tip: Use quick server mode to avoid database issues:');
      console.log('   USE_QUICK_SERVER=true npm start');
    }
    
    // Don't exit process, let the application handle it
    return false;
  }
  return true;
};

// Export both sequelize instance and connect function
module.exports = sequelize;
module.exports.connectDB = connectDB;






