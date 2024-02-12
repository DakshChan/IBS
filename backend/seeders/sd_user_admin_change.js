const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('user_info', [
            {
                username: 'demouser1',
                password: bcrypt.hashSync('password', 8), // Replace 'password' with the user's password
                email: 'demouser1@example.com',
                admin: false,
            },
            {
                username: 'demouser2',
                password: bcrypt.hashSync('password', 8), // Replace 'password' with the user's password
                email: 'demouser2@example.com',
                admin: false,
            },
            {
                username: 'demouser3',
                password: bcrypt.hashSync('password', 8), // Replace 'password' with the user's password
                email: 'demouser3@example.com',
                admin: false,
            },
            {
                username: 'demouser4',
                password: bcrypt.hashSync('password', 8), // Replace 'password' with the user's password
                email: 'demouser4@example.com',
                admin: false,
            },
            {
                username: 'adminuser',
                password: bcrypt.hashSync('adminpassword', 8),
                email: 'admin@example.com',
                admin: true, // Set admin to true for the admin user
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('user_info', null, {});
    }
};
