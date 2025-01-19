'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('course_role', 'token_count', {
      type: Sequelize.INTEGER,
      allowNull: true, // Or false, depending on your requirements
      defaultValue: 0, // Default value, if any
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('course_role', 'token_count');
  }
};
