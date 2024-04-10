const { Sequelize } = require('sequelize');

// Get NODE_ENV, defaulting to 'development'
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

let sequelize;
if (process.env.DATABASE_URL) {
    // Use DATABASE_URL if available, e.g., in production
    sequelize = new Sequelize(process.env.DATABASE_URL, { logging: config.logging });
} else {
    // Otherwise, use details from config.json
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        {
            host: config.host,
            dialect: config.dialect,
            logging: config.logging
        }
    );
}

module.exports = sequelize;
