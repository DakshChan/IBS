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
            },
            {
                username: 'matinstructoruser',
                password: bcrypt.hashSync('password', 8),
                email: 'matinstructor@example.com',
                admin: false // Set to false as this is an instructor
            },
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
            },
            {
                course_code: 'MAT101',
                course_session: '2023S',
                gitlab_group_id: '124',
                default_token_count: 10,
                token_length: 6,
                hidden: false,
            }
        ], {returning: true});

        const cscCourse = courses[0];
        const matCourse = courses[1];

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
            },
            {
                username: 'matinstructoruser',
                course_id: matCourse.course_id,
                role: ROLES.instructor,
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
            },
            {
                course_id: matCourse.course_id,
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

        // Seed groups for interviews
        await queryInterface.bulkInsert('groups', [
            {
                group_id: 1,
                task_id: 1,
                gitlab_group_id: '1231',
                gitlab_project_id: '3113',
                gitlab_url: 'gitlab.com/project/3113',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        // Seed interviews
        await queryInterface.bulkInsert('interviews', [
            {
                task_name: 'Assignment-1',
                host: 'cscinstructoruser',
                group_id: 1,
                length: 60,
                location: 'Online',
                note: 'zoom.com/meeting/124',
                time: '2024-04-15 13:30:00',
                date: '2024-04-15',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ])

    },

    async down(queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('interviews', null, {});
        await queryInterface.bulkDelete('groups', null, {});
        await queryInterface.bulkDelete('tasks', null, {});
        await queryInterface.bulkDelete('taskgroups', null, {});
        await queryInterface.bulkDelete('course_role', null, {});
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('user_info', null, {});
    }
};
