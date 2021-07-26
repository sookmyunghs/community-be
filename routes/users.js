var express = require('express');
var router = express.Router();
const models = require('../models');
const crypto = require('crypto');
const Sequelize = require("sequelize");
const moment = require('moment')
const db = require('../config/sqlconfig');
const request = require('request')
let jwt = require("jsonwebtoken");
let secretObj = require("../config/jwt");

router.post('/', async function(req, res, next) {
    const token = req.headers.authorization.split('Bearer ')[1]
     let decoded = jwt.verify(token, secretObj.secret);
     let userid = decoded.id
     let user = await models.user.findOne({
        where: { id: userid }
    })
 
   let userinfo = {
       name:user.name,
       nickname:user.nickname,
       id:user.id,
       grade:user.grade,
       classNm:user.userclass,
       image:user.image,
       email:user.email
   }
  res.send(userinfo);
});

router.post('/noti', function(req, res, next) {
    const token = req.headers.authorization.split('Bearer ')[1]
     let decoded = jwt.verify(token, secretObj.secret);
     let userid = decoded.id
   let sql = 'SELECT * FROM notifications WHERE id IN (SELECT MAX(id) FROM notifications GROUP BY receiver,link ) AND receiver=?  OR receiver=? ORDER BY createdAt DESC LIMIT 20;'
  
    db.query(sql,[userid,'*'],function(err, results){
        if(results){
            res.send(results)
            console.log(results)
        }else{
            res.send(err)
        }
    })
});

router.post('/notiread', function(req, res, next) {
   let notiId = req.body.notiId;
   models.notification.update({read: 1}, {where: {id: notiId}})
});

router.post('/changepassword', async function(req, res, next) {
   const token = req.headers.authorization.split('Bearer ')[1]
    let decoded = jwt.verify(token, secretObj.secret);    
    let userid = decoded.id     
  let newPassword = req.body.password1;
  let newsalt = Math.round((new Date().valueOf() * Math.random())) + "";
  let newhashPassword = crypto.createHash("sha512").update(newPassword + newsalt).digest("hex");
  
   models.user.findOne({
        where: { id: userid }
    })
        .then( result => {
     if(result){       
    let dbPassword = result.dataValues.password;
    let inputPassword = req.body.password3;
    let salt = result.dataValues.salt;
    let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");

      if(dbPassword === hashPassword){
         console.log('correct')
          models.user.update({password: newhashPassword,salt:newsalt}, {where: {id: userid}})
          res.send('success')
      }else{
        console.log("결과 없음");
        res.send('현재패스워드가 일치하지 않습니다.')
      }
     }else{
         console.log("결과 없음");
         
     }
     
        })
        .catch( err => {
            console.log(err);
    })
 
});

router.post('/changeEmail', async function(req, res, next) {
   const token = req.headers.authorization.split('Bearer ')[1]
    let decoded = jwt.verify(token, secretObj.secret);    
    let userid = decoded.id     
  let newEmail = req.body.email;
  
   models.user.findOne({
        where: { id: userid }
    })
        .then( result => {
     if(result){       
    let dbPassword = result.dataValues.password;
    let inputPassword = req.body.password;
    let salt = result.dataValues.salt;
    let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");

      if(dbPassword === hashPassword){
         console.log('correct')
          models.user.update({email: newEmail}, {where: {id: userid}})
          res.send('success') 
      }else{
        console.log("결과 없음");
        res.send('계정 비밀번호가 일치하지 않습니다.')
      }
     }else{
         console.log("결과 없음");
         
     }
     
        })
        .catch( err => {
            console.log(err);
    })
 
});
router.post('/changeuserinfo', async function(req, res, next) {
   const token = req.headers.authorization.split('Bearer ')[1]
    let decoded = jwt.verify(token, secretObj.secret);    
    let userid = decoded.id     
   let body = req.body
   console.log(req.body)
   models.user.findOne({
        where: { id: userid }
    })
        .then( result => {
     if(result){       
    let dbPassword = result.dataValues.password;
    let inputPassword = body.password;
    let salt = result.dataValues.salt;
    let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");

      if(dbPassword === hashPassword){
         console.log('correct')
          models.user.update({grade: body.grade,userclass:body.classNm}, {where: {id: userid}})
          res.send('success') 
      }else{
        console.log("결과 없음");
        res.send('계정 비밀번호가 일치하지 않습니다.')
      }
     }else{
         console.log("결과 없음");
         
     }
     
        })
        .catch( err => {
            console.log(err);
    })
 
});

router.post('/changeNick', async function(req, res, next) {
   const token = req.headers.authorization.split('Bearer ')[1]
    let decoded = jwt.verify(token, secretObj.secret);    
    let userid = decoded.id     
   let body = req.body
   console.log(req.body)
   
   models.user.findAll({
        where: {
            nickUpdatedAt:{
              [Sequelize.Op.lt]: new Date(`${moment().add(1,"days").format("YYYY-MM-DD")}`),
              [Sequelize.Op.gte]: new Date(`${moment().subtract(30,"days").format("YYYY-MM-DD")}`)  
            },
            id:userid
    }
    }).then( result => {
     if(result[0]){      
         res.send('already change')
     }else{
         //change Nick
         models.user.update({nickname: body.nickname,nickUpdatedAt:new Date()}, {where: {id: userid}})
         .then( result => {
        res.send('change')
     }).catch( err => {
        console.log(err);
    })//end
     }
     }).catch( err => {
        console.log(err);
    })

});

router.post('/getId',function(req,res,next){
    const token = req.headers.authorization.split('Bearer ')[1]
    let decoded = jwt.verify(token, secretObj.secret);    
    let userid = decoded.id     
    
    res.send(userid)
})
/**SELECT * FROM (SELECT userid, korea,english,math,history,
       PERCENT_RANK() OVER (ORDER BY korea desc) as ko_rank,
PERCENT_RANK() OVER (ORDER BY english desc) as en_rank,
       PERCENT_RANK() OVER (ORDER BY math desc) as ma_rank,
      PERCENT_RANK() OVER (ORDER BY history desc) as hi_rank 
FROM mockexams) a
WHERE a.userid='admin'**/
router.post('/mockexam',function(req,res,next){
    let body=req.body
    
    models.mockexam.create({
        userid:req.user.id,
        korea:body.korea,
        english:body.english,
        math:body.math,
        history:body.history,
    })
        .then( result => {
            console.log("모의고사 데이터 추가 완료");
            res.send("okay");
        })
        .catch( err => {
            console.log(err);
            res.send("fail")
        })
    console.log(req.body)
})

router.post('/examdata',async function(req,res,next){
    let query = `
	SELECT * FROM (SELECT userid, korea,english,math,history,
       PERCENT_RANK() OVER (ORDER BY korea desc) as ko_rank,
PERCENT_RANK() OVER (ORDER BY english desc) as en_rank,
       PERCENT_RANK() OVER (ORDER BY math desc) as ma_rank,
      PERCENT_RANK() OVER (ORDER BY history desc) as hi_rank 
FROM mockexams) a
WHERE a.userid=?
`;
    let query2 =`
    SELECT * FROM (SELECT userid,
       RANK() OVER (ORDER BY korea desc) as ko_rank,
RANK() OVER (ORDER BY english desc) as en_rank,
       RANK() OVER (ORDER BY math desc) as ma_rank,
      RANK() OVER (ORDER BY history desc) as hi_rank 
FROM mockexams) a
WHERE a.userid=?
    `
    
db.query(query,[req.user.id],function(err, results){
        if(results){
        
            db.query(query2,[req.user.id],function(err, results2){
        if(results2){
            let obj3 = {percent:{...results},rank:{...results2}};
            res.send(obj3)
            console.log(obj3)
        }
    })

        }else{
            res.send(err)
        }
    })

})

var admin = require('firebase-admin');

var serviceAccount = require(__dirname + "/../config/web-push-9fefc-firebase-adminsdk-hdkju-d870052b1e.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

router.post('/setNotiToken',async function(req,res,next){
    const token = req.headers.authorization.split('Bearer ')[1]
    let decoded = jwt.verify(token, secretObj.secret);    
    let userid = decoded.id     
    
    let isUser = await models.notiToken.findOne({
        userid:userid,
    })
    
    if(!isUser){
    models.notiToken.create({
        userid:userid,
        token:req.body.token
    })
    }else{
        models.notiToken.update(
            {token: req.body.token},
            {where: {userid: userid}
            })
    }
    
    admin.messaging().subscribeToTopic(req.body.token, 'user')
  .then((response) => {
    console.log('Successfully subscribed to topic:', response);
  })
  .catch((error) => {
    console.log('Error subscribing to topic:', error);
  });
  
})




router.post('/sendNoti',function(req,res,next){
   var fcm_target_token = "fdb7pqrjyPUgdgYQbErc72:APA91bGgZuxUrswKUgPjsU9F_STwOB-C-hNNB04vJ0-cYb20RYnU1bGGYd3Oje2vhxa1mYL3oaJgLazmD5M91GqTEnbowWOr3J56r4PXehyODPw_x2ekboZK2st6wuyzix-UD-Qd_V4b";
var fcm_message = {

  notification: {
    title: '시범 데이터 발송',
    body: '클라우드 메시지 전송이 잘 되는지 확인하기 위한, 메시지 입니다.'
  },
  data:{
    fileno:'44',
    style:'good 입니다요~'
  },
  token:fcm_target_token

};



// 메시지를 보내는 부분 입니다.
admin.messaging().send(fcm_message)
  .then(function( response ){
    console.log('보내기 성공 메시지:' + response);
  })
  .catch(function( error ){
    console.log( '보내기 실패 메시지:' + error );
  });
    
})

router.post('/withdrawal',function(req,res,next){
    const token = req.headers.authorization.split('Bearer ')[1]
    let decoded = jwt.verify(token, secretObj.secret);    
    let userid = decoded.id  
    let body = req.body
    console.log(userid)
    models.user.findOne({
        where: { id: userid }
    })
        .then( result => {
     if(result){       
    let dbPassword = result.dataValues.password;
    let inputPassword = body.password;
    let salt = result.dataValues.salt;
    let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");

      if(dbPassword === hashPassword){
          models.user.update(
            {state: 100},
            {where: {id: userid}
            })  
            res.send('ok')
      }else{
        console.log("결과 없음");
        res.send("incorrect")
      }
     }else{
         console.log("결과 없음");
         res.send('incorrect')
     }
     
        })
})

module.exports = router;
