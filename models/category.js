'use strict';
module.exports = (sequelize, DataTypes) => {
  var category = sequelize.define('category', {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      category_name: {
        type: DataTypes.STRING
      },
      manager: {
        type: DataTypes.STRING
      }
  },
  {
        timestamps: false,
        freezeTableName: true,
        tableName : "category"
    });
  
  return category;
};