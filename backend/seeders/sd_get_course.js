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

        // Seed a course for testing
        await queryInterface.bulkInsert('courses', [{
            course_code: 'CSC101',
            course_session: '2023S',
            gitlab_group_id: '123',
            default_token_count: 10,
            token_length: 6,
            hidden: false
        }]);

        // Add more seeding as needed
    },

    async down (queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('user_info', null, {});
        await queryInterface.bulkDelete('courses', null, {});
    }
};
