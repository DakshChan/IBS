'use strict';
const bcrypt = require('bcryptjs');

const {ROLES} = require("../helpers/constants");

module.exports = {
    async up(queryInterface, Sequelize) {
        // Seed a csc instructor, mat student & csc student
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
            }
        ]);

        // Seed a course
        const courses = await queryInterface.bulkInsert('courses', [
            {
                course_code: 'CSC101',
                course_session: '2023S',
                gitlab_group_id: '123',
                default_token_count: 10,
                token_length: 6,
                hidden: false,
            }
        ], {returning: true});

        const cscCourse = courses[0];

        // Seed a course role for the created users
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
            }
        ]);

        // Seed a task group for the instructor and student
        const taskGroups = await queryInterface.bulkInsert('taskgroups', [
            {
                course_id: cscCourse.course_id,
                max_token: 8,
                name: 'Assignments',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {returning: true});

        const taskGroup = taskGroups[0];

        // Seed tasks for the task group, 'Assignment-1'
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
                task_group_id: taskGroup.task_group_id,
                starter_code_url: 'www.exampleinstructions.com',
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
                task_group_id: taskGroup.task_group_id,
                starter_code_url: 'www.exampleinstructions.com',
            }

        ]);

        // Seed Criteria for the tasks
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
            }
        ]);

        // Seed Marks for the Criteria
        await queryInterface.bulkInsert('marks', [
            {
                criteria_id: 1,
                username: 'cscstudentusera',
                task_name: 'Assignment-1',
                mark: 80,
                hidden: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                criteria_id: 2,
                username: 'cscstudentusera',
                task_name: 'Assignment-1',
                mark: 20,
                hidden: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                criteria_id: 3,
                username: 'cscstudentusera',
                task_name: 'Assignment-1',
                mark: 10,
                hidden: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                criteria_id: 4,
                username: 'cscstudentusera',
                task_name: 'Assignment-2',
                mark: 1,
                hidden: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

    },

    async down(queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('marks', null, {});
        await queryInterface.bulkDelete('criteria', null, {});
        await queryInterface.bulkDelete('tasks', null, {});
        await queryInterface.bulkDelete('taskgroups', null, {});
        await queryInterface.bulkDelete('course_role', null, {});
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('user_info', null, {});
    }
};
