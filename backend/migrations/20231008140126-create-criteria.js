'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('criteria', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      criteria: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      task_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      total: {
        type: Sequelize.NUMERIC,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // await queryInterface.addConstraint('criteria', {
    //   fields: ['task_name'],
    //   type: 'foreign key',
    //   name: 'fkey_task_name',
    //   references: {
    //     table: 'tasks',
    //     field: 'task',
    //   },
    //   onDelete: 'RESTRICT',
    //   onUpdate: 'RESTRICT',
    // });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropAllTables();
  }
};