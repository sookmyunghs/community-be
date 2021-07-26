'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('category', {
      category_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      category_name: {
        type: Sequelize.STRING
      },
      manager: {
        type: Sequelize.STRING
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('category');
  }
};