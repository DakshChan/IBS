'use strict';
const bcrypt = require('bcryptjs');

const { ROLES } = require("../helpers/constants");

module.exports = {
    async up(queryInterface, Sequelize) {
        // Seed an instructor, student, and ta users
        await queryInterface.bulkInsert('user_info', [
            {
            username: 'cscinstructoruser',
            password: bcrypt.hashSync('password', 8),
            email: 'cscinstructor@example.com',
            admin: false // Set to false as this is an instructor
            },
            {
                username: 'csctauser',
                password: bcrypt.hashSync('password', 8),
                email: 'cscta@example.com',
                admin: false // Set to false as this is an instructor
            },
            {
                username: 'cscstudentuser',
                password: bcrypt.hashSync('password', 8),
                email: 'cscstudent@example.com',
                admin: false // Set to false as this is an instructor
            },
            {
                username: 'matinstructoruser',
                password: bcrypt.hashSync('password', 8),
                email: 'matinstructor@example.com',
                admin: false // Set to false as this is an instructor
            },
            {
                username: 'mattauser',
                password: bcrypt.hashSync('password', 8),
                email: 'matta@example.com',
                admin: false // Set to false as this is an instructor
            },
            {
                username: 'matstudentuser',
                password: bcrypt.hashSync('password', 8),
                email: 'matstudent@example.com',
                admin: false // Set to false as this is an instructor
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
            },
            {
                course_code: 'MAT135',
                course_session: '2023S',
                gitlab_group_id: '124',
                default_token_count: 5,
                token_length: 1,
                hidden: false,
            }
        ], { returning: true });

        const cscCourse = courses[0];
        const matCourse = courses[1];

        // Seed a course role for the created useers
        await queryInterface.bulkInsert('course_role', [
            {
                username: 'cscinstructoruser',
                course_id: cscCourse.course_id,
                role: ROLES.instructor,
            },
            {
                username: 'csctauser',
                course_id: cscCourse.course_id,
                role: ROLES.teachingAssistant,
            },
            {
                username: 'cscstudentuser',
                course_id: cscCourse.course_id,
                role: ROLES.student,
            },
            {
                username: 'matinstructoruser',
                course_id: matCourse.course_id,
                role: ROLES.instructor,
            },
            {
                username: 'mattauser',
                course_id: matCourse.course_id,
                role: ROLES.teachingAssistant,
            },
            {
                username: 'matstudentuser',
                course_id: matCourse.course_id,
                role: ROLES.student,
            }
        ]);

        await queryInterface.bulkInsert('taskgroups', [
            {
                id: 1,
                task_group_id: 1,
                max_token: 10,
                name: "assignments",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 2,
                task_group_id: 2,
                max_token: 0,
                name: "exams",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 3,
                task_group_id: 3,
                max_token: 2,
                name: "tutorials",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 4,
                task_group_id: 4,
                max_token: 2,
                name: "lectures",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 5,
                task_group_id: 5,
                max_token: 5,
                name: "quizzes",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ])
    },

    async down(queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('taskgroups', null, {});
        await queryInterface.bulkDelete('course_role', null, {});
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('user_info', null, {});
    }
};
