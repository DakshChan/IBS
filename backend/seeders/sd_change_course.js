'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    async up (queryInterface, Sequelize) {
        // Seed admin user
        await queryInterface.bulkInsert('user_info', [{
            username: 'adminuser',
            password: bcrypt.hashSync('adminPassword', 8),
            email: 'admin@example.com',
            admin: true
        }]);

        // Seed two courses
        await queryInterface.bulkInsert('courses', [{
            course_code: 'CSC101',
            course_session: '2023S',
            gitlab_group_id: '123',
            default_token_count: 10,
            token_length: 6,
            hidden: false
        }, {
            course_code: 'CSC102',
            course_session: '2023F',
            gitlab_group_id: '124',
            default_token_count: 12,
            token_length: 8,
            hidden: true
        }]);
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.bulkDelete('user_info', null, {});
        await queryInterface.bulkDelete('courses', null, {});
    }
};
