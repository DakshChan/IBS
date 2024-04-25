'use strict';
const { DataTypes } = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_user', {
      task_id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('confirmed', 'pending'),
        allowNull: false
      },
      token_count: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    });

    await queryInterface.addConstraint('group_user', {
      fields: ['task_id'],
      type: 'foreign key',
      name: 'fkey_task_id',
      references: {
        table: 'tasks',
        field: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    });

    await queryInterface.addConstraint('group_user', {
      fields: ['group_id'],
      type: 'foreign key',
      name: 'fkey_group_id',
      references: {
        table: 'groups',
        field: 'group_id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    });

    await queryInterface.addConstraint('group_user', {
      fields: ['username'],
      type: 'foreign key',
      name: 'fkey_username_id',
      references: {
        table: 'user_info',
        field: 'username',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_user');
  }
};