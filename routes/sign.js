var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const models = require('../models');
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

router.post('/up', async function(req, res, next) {
  let body = req.body;
  console.log(body)
  let inputPassword = body.password;
  let salt = Math.round((new Date().valueOf() * Math.random())) + "";
  let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");
  
   let userCheck=await models.user.findAll({
  where: {
    [Op.or]: [{id: body.id}, {email: body.email}]
    }
    });
  if(userCheck[0]){
      console.log(userCheck[0])
      if(userCheck[0].dataValues.id===body.id){
         res.send('alreadyid') 
         console.log('alreadyid')
      }else if(userCheck[0].dataValues.email===body.email){
         res.send('alreadyemail') 
         console.log('alreadyemail')
      }
      return false
  }      
  models.user.create({
        name: body.name,
        nickname: body.username,
        id: body.id,
        email: body.email,
        password: hashPassword,
        salt: String(salt),
        grade: Number(body.grade),
        userclass: Number(body.classNm)
    })
        .then( result => {
            console.log("데이터 추가 완료");
            res.send('ok');
        })
        .catch( err => {
            console.log(err);
            res.send(err)
        })
    
});

module.exports = router;
