'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {
        // Seed an instructor user
        await queryInterface.bulkInsert('user_info', [{
            username: 'instructoruser',
            password: bcrypt.hashSync('instructorPassword', 8),
            email: 'instructor@example.com',
            admin: false
        }]);

        // Seed a course
        await queryInterface.bulkInsert('courses', [{
            course_code: 'CSC101',
            course_session: '2023S',
            gitlab_group_id: '123',
            default_token_count: 10,
            token_length: 6,
            hidden: false
        }]);
        await queryInterface.bulkInsert('courses', [{
            course_code: 'CSC102',
            course_session: '2023S',
            gitlab_group_id: '124',
            default_token_count: 10,
            token_length: 6,
            hidden: false
        }]);

        // Seed course roles
        await queryInterface.bulkInsert('course_role', [{
            username: 'instructoruser',
            course_id: 1,
            role: 'instructor'
        }]);
        await queryInterface.bulkInsert('course_role', [{
            username: 'instructoruser',
            course_id: 2,
            role: 'instructor'
        }]);

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

        // Seed tasks for the course
        await queryInterface.bulkInsert(`tasks`, [
            // Add task details here
            {
                course_id: 1,
                task: "Task1",
                long_name: "First Task",
                due_date: new Date('2023-12-31'),
                weight: 10,
                hidden: false,
                min_member: 1,
                max_member: 4,
                max_token: 3,
                change_group: true,
                hide_interview: false,
                hide_file: false,
                interview_group: null,
                task_group_id: 1,
                starter_code_url: null
            },
            {
                course_id: 1,
                task: "Task2",
                long_name: "Second Task",
                due_date: new Date('2024-01-15'),
                weight: 15,
                hidden: false,
                min_member: 1,
                max_member: 4,
                max_token: 3,
                change_group: true,
                hide_interview: false,
                hide_file: false,
                interview_group: null,
                task_group_id: 1,
                starter_code_url: null
            }
            // Add more tasks as needed
        ]);
    },

    async down(queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('user_info', null, {});
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('course_role', null, {});
        await queryInterface.bulkDelete('tasks', null, {}); // Adjust according to your schema
    }
};