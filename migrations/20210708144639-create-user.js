'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nickname: {
        type: Sequelize.STRING,
        allowNull: false
      },
        id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      salt:{
        type: Sequelize.STRING
      },
      grade: {
      type: Sequelize.TINYINT,
      allowNull: false
     },
    userclass: {
      type: Sequelize.TINYINT,
      allowNull: false
    },
      image:{
        type: Sequelize.STRING
      },
      card:{
        type: Sequelize.STRING
      },
      state:{
         type: Sequelize.TINYINT,
         defaultValue: 0
      },
      upstateAt:{
        type: Sequelize.DATE
      },
      VerifiedAt:{
        type: Sequelize.DATE
      },
      nickUpdatedAt: {
        type: Sequelize.DATE
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};