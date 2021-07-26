var mysql = require('mysql');

const config = mysql.createPool({
    host : 'database-1.covogqeft4w5.ap-northeast-2.rds.amazonaws.com',
    user : 'admin',
    password : 'admin0207',
    database : 'sookmyung',
    multipleStatements: true
});

module.exports = config;