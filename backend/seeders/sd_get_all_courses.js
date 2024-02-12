'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    async up (queryInterface, Sequelize) {
        // Seed an admin user
        await queryInterface.bulkInsert('user_info', [{
            username: 'adminuser',
            password: bcrypt.hashSync('adminPassword', 8),
            email: 'admin@example.com',
            admin: true
        }]);

        // Seed courses for the test
        await queryInterface.bulkInsert('courses', [
            {
                course_code: 'CSC101',
                course_session: '2023S',
                gitlab_group_id: '123',
                default_token_count: 10,
                token_length: 6,
                hidden: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                course_code: 'CSC102',
                course_session: '2023F',
                gitlab_group_id: '124',
                default_token_count: 12,
                token_length: 8,
                hidden: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            // More courses can be added as needed
        ]);
    },

    async down (queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('user_info', null, {});
    }
};
