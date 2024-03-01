'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      task: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      long_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      weight: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      hidden: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      min_member: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      max_member: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      max_token: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      hide_interview: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      hide_file: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      change_group: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      interview_group: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      task_group_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // references: {
        //   model: 'taskgroups',
        //   key: 'id'
        // }
      },
      starter_code_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addConstraint('tasks', {
      fields: ['task_group_id'],
      type: 'foreign key',
      name: 'fkey_taskgroup_id',
      references: {
        table: 'taskgroups',
        field: 'task_group_id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tasks');
  }
};
