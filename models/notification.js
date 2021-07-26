'use strict';
module.exports = (sequelize, DataTypes) => {
  var notification = sequelize.define('notification', {
    receiver: {
        allowNull: false,
        type: DataTypes.STRING
      },
      sender: {
        type: DataTypes.STRING
      },
      title: {
        type: DataTypes.STRING
      },
      content: {
        type: DataTypes.TEXT
      },
      link: {
        type: DataTypes.STRING
      },
      read: {
        type: DataTypes.INTEGER
      }
  });
  return notification;
};