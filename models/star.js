'use strict';
module.exports = (sequelize, DataTypes) => {
  var stars = sequelize.define('stars', {
    postId: {
        type: DataTypes.INTEGER
      },
      starer: {
        type: DataTypes.STRING
      }
  });
  
  stars.associate = function(models){
    stars.belongsTo(models.posts, {
      foreignKey: "postId",
       as:'stars'
    })
  };
  
  return stars;
};