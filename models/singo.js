'use strict';
module.exports = (sequelize, DataTypes) => {
  var singo = sequelize.define('singo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      postid: {
        type: DataTypes.STRING
      },
      reporter: {
        type: DataTypes.STRING
      }
  },
  {
        timestamps: false,
        freezeTableName: true,
        tableName : "singo"
    });
  
  return singo;
};