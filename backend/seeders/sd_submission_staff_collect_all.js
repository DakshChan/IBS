'use strict';
const bcrypt = require('bcryptjs');

const { ROLES } = require("../helpers/constants");

module.exports = {
    async up(queryInterface, Sequelize) {
        // Seed an instructor, student users
        await queryInterface.bulkInsert('user_info', [
            {
                username: 'instructoruser',
                password: bcrypt.hashSync('password', 8),
                email: 'instructor@example.com',
                admin: false
            },
            {
                username: 'cscstudentuser',
                password: bcrypt.hashSync('password', 8),
                email: 'cscstudent@example.com',
                admin: false
            },
            {
                username: 'cscstudentuser2',
                password: bcrypt.hashSync('password', 8),
                email: 'cscstudent2@example.com',
                admin: false
            },
            {
                username: 'cscstudentuser3',
                password: bcrypt.hashSync('password', 8),
                email: 'cscstudent2@example.com',
                admin: false
            },
            {
                username: 'studentnogroup',
                password: bcrypt.hashSync('password', 8),
                email: 'studentnogroup@example.com',
                admin: false // Student who does not have a group
            }
        ]);

        // Seed a course
        await queryInterface.bulkInsert('courses', [
            {
                course_code: 'CSC369',
                course_session: '2023S',
                gitlab_group_id: '123',
                default_token_count: 10,
                token_length: 6,
                hidden: false,
            }
        ]);

        // Seed a course role for the created users
        await queryInterface.bulkInsert('course_role', [
            {
                username: 'instructoruser',
                course_id: 1,
                role: ROLES.instructor
            },
            {
                username: 'cscstudentuser',
                course_id: 1,
                role: ROLES.student,
            },
            {
                username: 'cscstudentuser2',
                course_id: 1,
                role: ROLES.student,
            },
            {
                username: 'cscstudentuser3',
                course_id: 1,
                role: ROLES.student,
            },
            {
                username: 'studentnogroup',
                course_id: 1,
                role: ROLES.student,
            },
        ]);

        await queryInterface.bulkInsert('taskgroups', [
            {
                id: 1,
                task_group_id: 1,
                course_id: 1,
                max_token: 10,
                name: "assignments",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

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
                due_date: new Date('2023-01-15'),
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
            },
            {
                course_id: 1,
                task: "Task3",
                long_name: "Task due not passed",
                due_date: new Date('2034-01-15'),
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
        ]);

        await queryInterface.bulkInsert('groups', [
            {
                group_id: 1,
                task_id: 1,
                extension: 5,
                gitlab_group_id: 10000001,
                gitlab_project_id: 123456,
                gitlab_url: "https://gitlab.com/username/repository-name",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                group_id: 2,
                task_id: 1,
                extension: 5,
                gitlab_group_id: 10000001,
                gitlab_project_id: 123456,
                gitlab_url: "https://gitlab.com/username/repository-name",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                group_id: 3,
                task_id: 2,
                extension: 5,
                gitlab_group_id: 10000001,
                gitlab_project_id: 123456,
                gitlab_url: "https://gitlab.com/username/repository-name",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            { // with task due date not passed
                group_id: 4,
                task_id: 3,
                extension: 5,
                gitlab_group_id: 10000001,
                gitlab_project_id: 123456,
                gitlab_url: "https://gitlab.com/username/repository-name",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                group_id: 5,
                task_id: 1,
                extension: 5,
                gitlab_group_id: 10000001,
                gitlab_project_id: 123456,
                gitlab_url: "https://gitlab.com/username/repository-name",
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);

        await queryInterface.bulkInsert('group_user', [
            {
                task_id: 1,
                username: "cscstudentuser",
                group_id: 1,
                status: 'confirmed',
                token_count: 10,
            },
            {
                task_id: 1,
                username: "cscstudentuser2",
                group_id: 2,
                status: 'confirmed',
                token_count: 8,
            },
            {
                task_id: 2,
                username: "cscstudentuser",
                group_id: 3,
                status: 'confirmed',
                token_count: 10,
            },
            {
                task_id: 3,
                username: "cscstudentuser",
                group_id: 4,
                status: 'confirmed',
                token_count: 10,
            },
            {
                task_id: 1,
                username: "cscstudentuser3",
                group_id: 5,
                status: 'confirmed',
                token_count: 10,
            },
        ]);

        await queryInterface.bulkInsert('submissions', [
            {
                task: 1,
                group_id: 1,
                commit_id: 100000,
                token_used: 2,
                timestamp: new Date(),
            },
            // {
            //     submission_id: 3,
            //     task: 2,
            //     group_id: 3,
            //     commit_id: 100000,
            //     token_used: 0,
            //     timestamp: new Date(),
            // },
            {
                task: 1,
                group_id: 5,
                commit_id: 100000,
                token_used: 4,
                timestamp: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('taskgroups', null, {});
        await queryInterface.bulkDelete('course_role', null, {});
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('user_info', null, {});
        await queryInterface.bulkDelete('tasks', null, {});
        await queryInterface.bulkDelete('groups', null, {});
        await queryInterface.bulkDelete('group_user', null, {});
        await queryInterface.bulkDelete('submissions', null, {});
    }
};