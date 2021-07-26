'use strict';

module.exports = (sequelize, DataTypes) => {
  var replys = sequelize.define('replys', {
    postid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parentcomment: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
  
  replys.associate = function(models){
    replys.belongsTo(models.posts, {
      foreignKey: "postid",
       as:'comments'
    });
    replys.hasMany(models.replys, {
      foreignKey: "parentcomment",
       as:'ReComment'
    });
  };

  return replys;
};