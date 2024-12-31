'use strict';
const bcrypt = require('bcryptjs');

const { ROLES } = require("../helpers/constants");
const { query } = require('express');

module.exports = {
    async up(queryInterface, Sequelize) {
        // Seed users
        await queryInterface.bulkInsert('user_info', [
            {
                username: 'cscinstructoruser',
                password: bcrypt.hashSync('password', 8),
                email: 'cscinstructor@example.com',
                admin: false // Set to false as this is an instructor
            },
            {
                username: 'cscstudentusera',
                password: bcrypt.hashSync('password', 8),
                email: 'cscstudenta@example.com',
                admin: false // Set to false as this is a student
            },
            {
                username: 'cscstudentuserb',
                password: bcrypt.hashSync('password', 8),
                email: 'cscstudentb@example.com',
                admin: false // Set to false as this is a student
            },
            {
                username: 'matinstructoruser',
                password: bcrypt.hashSync('password', 8),
                email: 'matinstructor@example.com',
                admin: false // Set to false as this is an instructor
            },
        ]);

        // Seed courses
        const courses = await queryInterface.bulkInsert('courses', [
            {
                course_code: 'CSC101',
                course_session: '2023S',
                gitlab_group_id: '123',
                default_token_count: 10,
                token_length: 6,
                hidden: false,
            },
            {
                course_code: 'MAT101',
                course_session: '2023S',
                gitlab_group_id: '124',
                default_token_count: 10,
                token_length: 6,
                hidden: false,
            }
        ], { returning: true });

        const cscCourse = courses[0];
        const matCourse = courses[1];

        // Seed course roles
        await queryInterface.bulkInsert('course_role', [
            {
                username: 'cscinstructoruser',
                course_id: cscCourse.course_id,
                role: ROLES.instructor,
            },
            {
                username: 'cscstudentusera',
                course_id: cscCourse.course_id,
                role: ROLES.student,
            },
            {
                username: 'cscstudentuserb',
                course_id: cscCourse.course_id,
                role: ROLES.student,
            },
            {
                username: 'matinstructoruser',
                course_id: matCourse.course_id,
                role: ROLES.instructor,
            }
        ]);

        // Seed tasks
        await queryInterface.bulkInsert('tasks', [
            {
                course_id: cscCourse.course_id,
                task: 'Assignment-1',
                long_name: 'Tutorial 1',
                due_date: new Date(),
                weight: 15,
                hidden: false,
                min_member: 0,
                max_member: 120,
                max_token: 4,
                hide_interview: true,
                hide_file: false,
                change_group: false,
                interview_group: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                course_id: cscCourse.course_id,
                task: 'Assignment-2',
                long_name: 'Tutorial 2',
                due_date: new Date(),
                weight: 15,
                hidden: false,
                min_member: 0,
                max_member: 120,
                max_token: 4,
                hide_interview: true,
                hide_file: false,
                change_group: false,
                interview_group: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ]);

        // Seed criteria for the tasks
        await queryInterface.bulkInsert('criteria', [
            {
                criteria: 'Correctness',
                total: 80,
                description: 'In order to get full marks, all test cases must pass.',
                task_name: 'Assignment-1',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                criteria: 'Code Style',
                total: 20,
                description: "Each complaint from the code linter will deduct 1 mark.",
                task_name: 'Assignment-1',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                criteria: 'Bonus',
                total: 10,
                task_name: 'Assignment-1',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                criteria: 'Participation',
                total: 1,
                task_name: 'Assignment-2',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                criteria: 'Participation Bonus',
                total: 5,
                task_name: 'Assignment-1',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        // Seed group
        await queryInterface.bulkInsert('groups', [
            {
                group_id: 1,
                task_id: 1,
                extension: 0,
                gitlab_group_id: 'group_050',
                gitlab_project_id: 'project_1042',
                gitlab_url: 'github.com/project_1042',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        // Seed user groups
        await queryInterface.bulkInsert('group_user', [
            {
                task_id: 1,
                username: 'cscstudentusera',
                group_id: 1,
                status: 'confirmed',
            },
            {
                task_id: 1,
                username: 'cscstudentuserb',
                group_id: 1,
                status: 'confirmed'
            }
        ]);

    },

    async down(queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('marks', null, {});
        await queryInterface.bulkDelete('group_user', null, {});
        await queryInterface.bulkDelete('groups', null, {});
        await queryInterface.bulkDelete('criteria', null, {});
        await queryInterface.bulkDelete('tasks', null, {});
        await queryInterface.bulkDelete('course_role', null, {});
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('user_info', null, {});
    }
};