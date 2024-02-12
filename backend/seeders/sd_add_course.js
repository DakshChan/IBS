'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    async up (queryInterface, Sequelize) {
        // Seed an admin user
        await queryInterface.bulkInsert('user_info', [
            {
                username: 'adminuser',
                password: bcrypt.hashSync('adminPassword', 8),
                email: 'admin@example.com',
                admin: true
            },
            // Seed a non-admin user
            {
                username: 'regularuser',
                password: bcrypt.hashSync('regularPassword', 8),
                email: 'regular@example.com',
                admin: false
            }
        ]);
    },

    async down (queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('user_info', null, {});
    }
};
