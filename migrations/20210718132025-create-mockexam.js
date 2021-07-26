'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mockexams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userid: {
        type: Sequelize.STRING
      },
      grade: {
        type: Sequelize.TINYINT
      },
      korea: {
        type: Sequelize.INTEGER
      },
      english: {
        type: Sequelize.INTEGER
      },
      math: {
        type: Sequelize.INTEGER
      },
      history: {
        type: Sequelize.INTEGER
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('mockexams');
  }
};