'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {
        // Seed an instructor user and an admin user
        await queryInterface.bulkInsert('user_info', [
            {
                username: 'instructoruser',
                password: bcrypt.hashSync('instructorPassword', 8),
                email: 'instructor@example.com',
                admin: false
            }
        ]);

        // Seed courses
        await queryInterface.bulkInsert('courses', [
            {
                course_code: 'CSC101',
                course_session: '2023S',
                gitlab_group_id: '123',
                default_token_count: 10,
                token_length: 6,
                hidden: false
            }
        ]);

        // Seed course roles
        await queryInterface.bulkInsert('course_role', [
            {username: 'instructoruser', course_id: 1, role: 'instructor'
            }
        ]);

        // Seed taskgroup
        await queryInterface.bulkInsert('taskgroups', [
            {
                id: 1,
                task_group_id: 1,
                course_id: 1,
                max_token: 10,
                name: "assignment1",
                createdAt: new Date(),
                updatedAt: new Date()
            }]);

    },

    async down(queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('user_info', null, {});
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('course_role', null, {});
    }
};
