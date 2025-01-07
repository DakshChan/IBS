'use strict';

const bcrypt = require('bcryptjs');
const {ROLES, GROUP_STATUS} = require("../helpers/constants");

module.exports = {
    async up(queryInterface, Sequelize) {
        // Seed an instructor user
        await queryInterface.bulkInsert('user_info', [
            {
                username: 'instructoruser',
                password: bcrypt.hashSync('password', 8),
                email: 'instructor@example.com',
                admin: false
            },
            {
                username: 'studentuser1',
                password: bcrypt.hashSync('password', 8),
                email: 'student1@example.com',
                admin: false
            },
            {
                username: 'studentuser2',
                password: bcrypt.hashSync('password', 8),
                email: 'student2@example.com',
                admin: false
            },
            {
                username: 'grouplessstudentuser',
                password: bcrypt.hashSync('password', 8),
                email: 'grouplessstudentuser@example.com',
                admin: false
            }
        ]);

        // Seed a course
        await queryInterface.bulkInsert('courses', [{
            course_code: 'CSC309',
            course_session: '2023S',
            gitlab_group_id: '123',
            default_token_count: 10,
            token_length: 6,
            hidden: false
        }]);


        // Seed course roles
        await queryInterface.bulkInsert('course_role', [
            {
                username: 'instructoruser',
                course_id: 1,
                role: ROLES.instructor
            },
            {
                username: 'studentuser1',
                course_id: 1,
                role: ROLES.student
            },
            {
                username: 'studentuser2',
                course_id: 1,
                role: ROLES.student
            },
            {
                username: 'grouplessstudentuser',
                course_id: 1,
                role: ROLES.student
            },
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

        // Seed tasks for the course
        const tasks = await queryInterface.bulkInsert(`tasks`, [
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
        ],  { returning: true });

        const groups = await queryInterface.bulkInsert('groups', [
            {
                group_id: 1,
                task_id: tasks[0].id,
                extension: 0,
                gitlab_group_id: 'gg1',
                gitlab_project_id: 'gp1',
                gitlab_url: 'https://www.temporary-url.com/',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], { returning: true })

        await queryInterface.bulkInsert('group_user', [
            {
                task_id: tasks[0].id,
                username: 'studentuser1',
                group_id: groups[0].group_id,
                status: GROUP_STATUS.confirmed
            },
            {
                task_id: tasks[0].id,
                username: 'studentuser2',
                group_id: groups[0].group_id,
                status: GROUP_STATUS.confirmed
            }
        ]);


    },

    async down(queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('tasks', null, {}); // Adjust according to your schema
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('course_role', null, {});
        await queryInterface.bulkDelete('user_info', null, {});
    }
};

