'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {
        // First, seed a user into the user_info table
        await queryInterface.bulkInsert('user_info', [{
            username: 'demouser',
            password: bcrypt.hashSync('password', 8), // Current password
            email: 'demouser@example.com',
            admin: false,
        }], {});

        // Next, seed a verification code into the user_verification table
        await queryInterface.bulkInsert('user_verification', [{
            id: 1, // You might want to adjust this depending on your ID generation strategy
            username: 'demouser',
            code: '111111', // The code to be used in your test
            created_at: new Date() // Current timestamp
        }], {});
    },

    async down(queryInterface, Sequelize) {
        // Remove the seeded data (optional, based on your testing strategy)
        await queryInterface.bulkDelete('user_verification', { username: 'existingUser' }, {});
        await queryInterface.bulkDelete('user_info', { username: 'existingUser' }, {});
    }
};
