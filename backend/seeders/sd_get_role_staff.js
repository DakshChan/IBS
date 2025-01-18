'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    async up (queryInterface, Sequelize) {
        // Seed users
        await queryInterface.bulkInsert('user_info', [
            {
                username: 'adminuser',
                password: bcrypt.hashSync('adminPassword', 8),
                email: 'admin@example.com',
                admin: true
            },
            {
                username: 'instructoruser',
                password: bcrypt.hashSync('instructorPassword', 8),
                email: 'instructor@example.com',
                admin: false
            },
            {
                username: 'studentuser',
                password: bcrypt.hashSync('studentPassword', 8),
                email: 'student@example.com',
                admin: false
            }
        ]);

        // Seed courses
        await queryInterface.bulkInsert('courses', [
            {course_code: 'CSC101', course_session: '2023S', gitlab_group_id: '123', default_token_count: 10, token_length: 6, hidden: false},
            {course_code: 'CSC102', course_session: '2023F', gitlab_group_id: '124', default_token_count: 12, token_length: 8, hidden: false}
        ]);

        // Seed course roles
        await queryInterface.bulkInsert('course_role', [
            {username: 'instructoruser', course_id: 1, role: 'instructor'},
            {username: 'studentuser', course_id: 1, role: 'student'},
            {username: 'instructoruser', course_id: 2, role: 'instructor'}
        ]);
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.bulkDelete('user_info', null, {});
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('course_role', null, {});
    }
};
