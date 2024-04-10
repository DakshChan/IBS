'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('courses', {
      // id: {
      //   allowNull: false,
      //   autoIncrement: true,
      //   type: Sequelize.INTEGER,
      // },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },
      course_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      course_session: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gitlab_group_id: {
        type: Sequelize.STRING,
        unique: true,
      },
      default_token_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      token_length: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      hidden: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    // Adding unique constraint for course_code and course_session
    await queryInterface.addIndex('courses', ['course_code', 'course_session'], {
      unique: true,
      name: 'unique_course_code_and_session'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropAllTables();
  }
};