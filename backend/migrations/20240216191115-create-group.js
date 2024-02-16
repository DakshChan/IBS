'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('groups', {
      group_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      extension: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      gitlab_group_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gitlab_project_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gitlab_url: {
        type: Sequelize.STRING,
        allowNull: true
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

    await queryInterface.addConstraint('groups', {
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('groups');
  }
};