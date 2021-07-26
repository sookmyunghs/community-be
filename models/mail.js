'use strict';
module.exports = (sequelize, DataTypes) => {
  var mail = sequelize.define('mail', {
    sender: {
      type:DataTypes.STRING
    },
    senderNick: {
      type:DataTypes.STRING
    },
    receiver: {
      type:DataTypes.STRING
    },
    text: {
      type:DataTypes.TEXT
    },
    read: {
        type: DataTypes.INTEGER
    }
  });
  return mail;
};