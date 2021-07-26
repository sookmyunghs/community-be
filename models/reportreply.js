'use strict';
module.exports = (sequelize, DataTypes) => {
  var reportreply = sequelize.define('reportreply', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      replyid: {
        type: DataTypes.INTEGER
      },
      reporter: {
        type: DataTypes.STRING
      }
  },
  {
        timestamps: false,
        freezeTableName: true,
        tableName : "reportreply"
    });
  
  return reportreply;
};