'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },   
      userid: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      author: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      category: {
        allowNull: true,   
        type: Sequelize.INTEGER,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      image: {
        allowNull: true,   
        type: Sequelize.STRING,
      },
      like: {
        allowNull: false,  
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      star: {
        allowNull: false,  
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('posts');
  }
};