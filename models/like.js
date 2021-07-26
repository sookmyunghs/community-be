'use strict';
module.exports = (sequelize, DataTypes) => {
  var likes = sequelize.define('likes', {
    postId: {
        type: DataTypes.INTEGER
      },
      liker: {
        type: DataTypes.STRING
      }
  });
  
  likes.associate = function(models){
    likes.belongsTo(models.posts, {
      foreignKey: "postId",
       as:'likes'
    })
  };
  
  return likes;
};