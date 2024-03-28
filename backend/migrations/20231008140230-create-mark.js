'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('marks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      criteria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      task_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      mark: {
        type: Sequelize.NUMERIC,
        allowNull: false,
      },
      old_mark: {
        type: Sequelize.NUMERIC,
      },
      hidden: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addConstraint('marks', {
      fields: ['criteria_id'],
      type: 'foreign key',
      name: 'criteria_id',
      references: {
        table: 'criteria',
        field: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    });

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropAllTables();
  }
};