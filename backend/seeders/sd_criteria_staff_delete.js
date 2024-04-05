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
                username: 'cscstudentuser',
                password: bcrypt.hashSync('password', 8),
                email: 'cscstudent@example.com',
                admin: false // Set to false as this is a student
            },
            {
                username: 'matinstructoruser',
                password: bcrypt.hashSync('password', 8),
                email: 'matinstructor@example.com',
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
                username: 'cscstudentuser',
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

        // Seed tasks for the task group, '1'
        await queryInterface.bulkInsert('tasks', [
            {
                course_id: cscCourse.course_id,
                task: '1',
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
            }
        ]);

        // Seed criteria for the task
        const criteria = await queryInterface.bulkInsert('criteria', [
            {
                criteria: 'Correctness',
                task_name: 'Assignment-1',
                total: 80,
                description: 'In order to achieve a full 80/80 all test cases must pass.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                criteria: 'Style',
                task_name: 'Assignment-1',
                total: 20,
                description: 'In order to achieve a full 20/20 there must be no complaints from the linter.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                criteria: 'Bonus',
                task_name: 'Assignment-1',
                total: 10,
                description: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {returning: true});

        // Create marks for each criteria but the last one
        const marks = [];
        criteria.slice(0, -1).forEach(criterion => {
            marks.push({
                criteria_id: criterion.id,
                username: 'cscstudentuser',
                task_name: 'Assignment-1',
                mark: 0, // Default mark value
                old_mark: null,
                hidden: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        });

        // Seed marks
        await queryInterface.bulkInsert('marks', marks);
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
