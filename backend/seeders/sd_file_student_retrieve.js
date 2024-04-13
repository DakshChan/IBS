'use strict';

const bcrypt = require('bcryptjs');
const {ROLES, GROUP_STATUS} = require("../helpers/constants");
const fs = require("fs");

module.exports = {
    async up(queryInterface, Sequelize) {
        // Seed an instructor user
        await queryInterface.bulkInsert('user_info', [
            {
                username: 'instructor',
                password: bcrypt.hashSync('password', 8),
                email: 'instructor@example.com',
                admin: false
            },
            {
                username: 'domi',
                password: bcrypt.hashSync('password', 8),
                email: 'domi@example.com',
                admin: false
            },
            {
                username: 'andrew',
                password: bcrypt.hashSync('password', 8),
                email: 'andrew@example.com',
                admin: false
            }
        ]);

        // Seed a course
        await queryInterface.bulkInsert('courses', [{
            course_code: 'MAT157',
            course_session: '2023S',
            gitlab_group_id: '123',
            default_token_count: 10,
            token_length: 6,
            hidden: false
        }]);

        // Seed course roles
        await queryInterface.bulkInsert('course_role', [
            {
                username: 'instructor',
                course_id: 1,
                role: ROLES.instructor
            },
            {
                username: 'domi',
                course_id: 1,
                role: ROLES.student
            },
            {
                username: 'andrew',
                course_id: 1,
                role: ROLES.student
            }
        ]);

        await queryInterface.bulkInsert('taskgroups', [
            {
                id: 1,
                task_group_id: 1,
                course_id: 1,
                max_token: 10,
                name: "ProblemSets",
                createdAt: new Date(),
                updatedAt: new Date()
            }]);

        const tasks = await queryInterface.bulkInsert(`tasks`, [
            {
                course_id: 1,
                task: "PS1",
                long_name: "Problem Set 1",
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
                task: "PS2",
                long_name: "Problem Set 2",
                due_date: new Date('2023-12-31'),
                weight: 10,
                hidden: false,
                min_member: 1,
                max_member: 4,
                max_token: 3,
                change_group: true,
                hide_interview: false,
                hide_file: true,
                interview_group: null,
                task_group_id: 1,
                starter_code_url: null
            }
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
                username: 'domi',
                group_id: groups[0].group_id,
                status: GROUP_STATUS.confirmed
            }
        ]);

        const file_dir = `${__dirname}/../files/course_1/PS1`;
        if (fs.existsSync(file_dir)) {
            fs.rmSync(file_dir, { recursive: true, force: true });
        }

        fs.cpSync(`${__dirname}/../tests/test-data/file/student/PS1`, `${__dirname}/../files/course_1/PS1`, { recursive: true });
    },

    async down(queryInterface, Sequelize) {
        // Cleanup the seeded data
        await queryInterface.bulkDelete('user_info', null, {});
        await queryInterface.bulkDelete('courses', null, {});
        await queryInterface.bulkDelete('course_role', null, {});
        await queryInterface.bulkDelete('tasks', null, {}); // Adjust according to your schema

        const file_dir = `${__dirname}/../files/course_1/PS1`;
        if (fs.existsSync(file_dir)) {
            fs.rmSync(file_dir, { recursive: true, force: true });
        }
    }
};