'use strict';
const {DataTypes} = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_info', {
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {  // this is only used for mocking/development env. this is not a real id
        primaryKey: false,
        unique: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });



  },
  async down(queryInterface, Sequelize) {
    // Remove the foreign key constraint
    await queryInterface.dropTable('user_info');
    await queryInterface.dropAllTables();}
};