'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {
        // Seed an admin user
        await queryInterface.bulkInsert('user_info', [{
            username: 'adminuser',
            password: bcrypt.hashSync('adminPassword', 8),
            email: 'admin@example.com',
            admin: true
        }]);

        // Seed courses
        await queryInterface.bulkInsert('courses', [
            { course_code: 'CSC101', course_session: '2023S', gitlab_group_id: '123', default_token_count: 10, token_length: 6, hidden: false },
            { course_code: 'CSC102', course_session: '2023F', gitlab_group_id: '124', default_token_count: 12, token_length: 8, hidden: true }
        ]);

        // Seed users and roles
        await queryInterface.bulkInsert('user_info', [
            { username: 'user1', password: bcrypt.hashSync('user1Password', 8), email: 'user1@example.com', admin: false },
            { username: 'user2', password: bcrypt.hashSync('user2Password', 8), email: 'user2@example.com', admin: false }
        ]);

        // Seed course roles
        await queryInterface.bulkInsert('course_role', [
            { username: 'user1', course_id: 1, role: 'instructor' },
            { username: 'user1', course_id: 2, role: 'ta' },
            { username: 'user2', course_id: 2, role: 'student' },
            { username: 'user2', course_id: 1, role: 'student' }
        ]);
    },

    async down(queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('user_info', null, {});
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('course_role', null, {});
    }
};
