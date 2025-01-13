'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove old column
    await queryInterface.removeColumn('interviews', 'task_name');

    // Add new columns
    await queryInterface.addColumn('interviews', 'task_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'tasks',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add foreign key for host
    await queryInterface.addConstraint('interviews', {
      fields: ['host'],
      type: 'foreign key',
      name: 'fkey_host',
      references: {
        table: 'user_info',
        field: 'username'
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT'
    });

    // Add foreign key for group_id
    await queryInterface.addConstraint('interviews', {
      fields: ['group_id'],
      type: 'foreign key',
      name: 'fkey_group_id',
      references: {
        table: 'groups',
        field: 'group_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Ensure correct data types for time and date
    await queryInterface.changeColumn('interviews', 'time', {
      type: Sequelize.TIME
    });

    await queryInterface.changeColumn('interviews', 'date', {
      type: Sequelize.DATE
    });
  },

  async down(queryInterface, Sequelize) {
    // Add the 'task_name' column back and allow null values temporarily
    await queryInterface.addColumn('interviews', 'task_name', {
        type: Sequelize.STRING,
        allowNull: true // Allow nulls temporarily
    });

    // Populate 'task_name' using data from the 'tasks' table
    await queryInterface.sequelize.query(`
        UPDATE interviews
        SET task_name = (SELECT task FROM tasks WHERE tasks.id = interviews.task_id)
    `);

    // Alter 'task_name' to NOT NULL after populating
    await queryInterface.changeColumn('interviews', 'task_name', {
        type: Sequelize.STRING,
        allowNull: false
    });

    // Remove 'task_id' and 'course_id'
    await queryInterface.removeColumn('interviews', 'task_id');
}
};

