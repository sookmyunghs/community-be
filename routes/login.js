var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const models = require('../models');

let jwt = require("jsonwebtoken");
let secretObj = require("../config/jwt");


router.post("/", function(req,res,next){
let body=req.body
  let token = jwt.sign({
        id: body.username   // 토큰의 내용(payload)
      },
      secretObj.secret ,    // 비밀 키
      {
        expiresIn: '365d'    // 유효 시간은 5분
      })

    models.user.findOne({
        where: { id: body.username }
    })
        .then( result => {
     if(result&&result.state!==100){       
    let dbPassword = result.dataValues.password;
    let inputPassword = body.password;
    let salt = result.dataValues.salt;
    let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");

      if(dbPassword === hashPassword){
                console.log(result);
                res.json({
                token: token,
                grade:result.grade,
                classNM:result.userclass
                })
                console.log(token)
      }else{
        console.log("결과 없음");
        res.send("incorrect")
      }
     }else{
         console.log("결과 없음");
         res.send('incorrect')
     }
     
        })
        .catch( err => {
            console.log(err);
        })
})

router.post("/verify", function(req, res, next){
  const token = req.headers.authorization.split('Bearer ')[1]

  let decoded = jwt.verify(token, secretObj.secret);
  if(decoded){
    console.log(decoded)  
    res.send("ok")
  }
  else{
    res.send("권한이 없습니다.")
  }
})


module.exports = router;