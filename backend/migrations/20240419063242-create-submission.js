'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('submissions', {
      submission_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'groups',
          key: 'group_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      task: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      commit_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      token_used: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      timestamp: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addConstraint('submissions', {
      fields: ['group_id'],
      type: 'foreign key',
      name: 'fkey_course_id',
      references: {
        table: 'groups',
        field: 'group_id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('submissions');
  }
};
