'use strict';
module.exports = (sequelize, DataTypes) => {
  var notiToken = sequelize.define('notiToken', {
    userid: DataTypes.STRING,
    token: DataTypes.STRING
  });
  return notiToken;
};
