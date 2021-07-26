'use strict';
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salt:{
      type: DataTypes.STRING
    },
    grade: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    userclass: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    image:{
      type: DataTypes.STRING
    },
    card:{
      type: DataTypes.STRING
    },
    state:{
      type: DataTypes.TINYINT,
    },
    upstateAt:{
        type: DataTypes.DATE
    },
    VerifiedAt:{
        type: DataTypes.DATE
    },
    nickUpdatedAt:{
        type: DataTypes.DATE
    }
  });

  return user;
};