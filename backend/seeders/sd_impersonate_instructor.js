'use strict';
const bcrypt = require('bcryptjs');

const {ROLES} = require("../helpers/constants");
const { DatabaseError } = require('pg');

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

    },

    async down(queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('course_role', null, {});
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('user_info', null, {});
    }
};
