'use strict';
const {DataTypes} = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('taskgroups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      task_group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: false,
      },
      max_token: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint('taskgroups', {
      fields: ['course_id'],
      type: 'foreign key',
      name: 'fkey_course_id',
      references: {
        table: 'courses',
        field: 'course_id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('taskgroups');
  }
};