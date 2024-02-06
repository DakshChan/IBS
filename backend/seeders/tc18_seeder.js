'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {
        // Seed an instructor, student, and ta users
        await queryInterface.bulkInsert('user_info', [{
            username: 'instructoruser',
            password: bcrypt.hashSync('password', 8),
            email: 'instructor@example.com',
            admin: false // Set to false as this is an instructor
        }]);

        await queryInterface.bulkInsert('user_info', [{
            username: 'tauser',
            password: bcrypt.hashSync('password', 8),
            email: 'ta@example.com',
            admin: false // Set to false as this is an instructor
        }]);

        await queryInterface.bulkInsert('user_info', [{
            username: 'studentuser',
            password: bcrypt.hashSync('password', 8),
            email: 'student@example.com',
            admin: false // Set to false as this is an instructor
        }]);

        // Seed a course
        const courses = await queryInterface.bulkInsert('courses', [{
            course_code: 'CSC101',
            course_session: '2023S',
            gitlab_group_id: '123',
            default_token_count: 10,
            token_length: 6,
            hidden: false,
        }], { returning: true });

        // Seed a course role for the created useers
        await queryInterface.bulkInsert('course_role', [{
            username: 'instructoruser',
            course_id: 1, // Assuming the first inserted course is the one we want
            role: 'instructor',
            // Include createdAt and updatedAt if your model requires them
        }]);

        await queryInterface.bulkInsert('course_role', [{
            username: 'tauser',
            course_id: 1, // Assuming the first inserted course is the one we want
            role: 'ta',
            // Include createdAt and updatedAt if your model requires them
        }]);

        await queryInterface.bulkInsert('course_role', [{
            username: 'studentuser',
            course_id: 1, // Assuming the first inserted course is the one we want
            role: 'student',
            // Include createdAt and updatedAt if your model requires them
        }]);




    },

    async down(queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('course_role', null, {});
        await queryInterface.bulkDelete('user_info', null, {});
        await queryInterface.bulkDelete('courses', null, {});
    }
};
