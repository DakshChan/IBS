'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    async up (queryInterface, Sequelize) {
        return queryInterface.bulkInsert('user_info', [
            {
                username: 'demouser',
                password: bcrypt.hashSync('password', 8), // Replace 'password' with the user's password
                email: 'demo@example.com',
                admin: false, // or true, based on your requirements
                // Add other fields as required by your model
            },
            // Add more users as needed
        ]);
    },

    async down (queryInterface, Sequelize) {
        return queryInterface.bulkDelete('user_info', null, {});
    }
};
