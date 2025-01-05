'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // rename column to task_id
    // await queryInterface.renameColumn('submissions', 'task', 'task_id');
    /**
     * FK to submission table, links task_id from tasks table to task_id in submission table
     */
    await queryInterface.addConstraint('submissions', {
      fields: ['task'],
      type: 'foreign key',
      name: 'fk_task_submissions',
      references: {
        table: 'tasks',
        field: 'id',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    });
    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Remove FK constraint from submission table
     */
    await queryInterface.removeConstraint('submissions', 'fk_task_submissions');
  }
};
