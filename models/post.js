'use strict';
module.exports = (sequelize, DataTypes) => {
  var posts = sequelize.define('posts', {
    userid: {
        allowNull: false,  
        type: DataTypes.STRING,
      },
      author: {
        allowNull: false,  
        type: DataTypes.STRING,
      },
      category: {
        allowNull: true,   
        type: DataTypes.INTEGER,
      },
      title: {
        allowNull: false,   
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,   
        type: DataTypes.TEXT,
      },
      image: {
        allowNull: true,   
        type: DataTypes.STRING,
      },
      like: {
        allowNull: false,   
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      star: {
        allowNull: false,   
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
  });
  
  posts.associate = function (models) {
    posts.hasMany(models.replys);
    posts.hasMany(models.likes);
    posts.hasMany(models.stars);
  };
  
  return posts;
};