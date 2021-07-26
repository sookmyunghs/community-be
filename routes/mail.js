var express = require('express');
var router = express.Router();
const models = require('../models');
const Sequelize = require("sequelize");
const db = require('../config/sqlconfig');
const request = require('request')
let jwt = require("jsonwebtoken");
let secretObj = require("../config/jwt");

router.post('/send',async function(req,res,next){
    let body = req.body
    const usertoken = req.headers.authorization.split('Bearer ')[1]
     let decoded = jwt.verify(usertoken, secretObj.secret);
     let userid = decoded.id
     let userdb = await models.user.findOne({
                    where: { id: userid }
                    })     
                    
    let author = userdb.nickname
  
  if(body.isAnonymous === true){
      author= '익명'
      console.log('anonymous mail')
  }
  
  let result=await models.user.findOne({
  where: {id:body.receiver}
    });
    
    if(result){
    models.mail.create({
        sender:userid,
        senderNick:author,
        receiver:body.receiver,
        text:body.text,
        read:0,
    })
    .then( result => {
            console.log("데이터 추가 완료");
            res.send('okay')
        })
        .catch( err => {
            console.log(err);
            res.send('error')
        })
    }else{
        res.send('cannot find receiver')
    }
    
    let notiToken = await models.notiToken.findOne({
                    where: { userid: body.receiver }})
         
        let token = notiToken.dataValues.token
        console.log('notitoken:'+token)   
        
       const option = {
	method: 'POST',
	url: 'https://fcm.googleapis.com/fcm/send',
	json: {
		'to': token,
		'notification': {
			'title': author+'님이 쪽지를 보냈습니다.',
			'body': body.text,
			'click_action': 'http://localhost:3000'+'/mail', //이 부분에 원하는 url을 넣습니다.
		}
	},
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'key=AAAATr4HM-8:APA91bEIHlrkayFO_4dLwexMlL0W1NGB77AmUpns9kHsmF68-b1iBvuswhmQnWue59NEl_2u3agEBuM_XFJ5RP-okDDLYtVwyshESw6E10BaMPdRU1PP54Pxo0BktgKARWYhrRH6nJBM'
	}
} 
    request(option, (err, res, body) => {
	if(err) console.log(err); //에러가 발생할 경우 에러를 출력
	else console.log(body); //제대로 요청이 되었을 경우 response의 데이터를 출력
})
    
})

router.post('/selectSender',async function(req,res,next){
    const token = req.headers.authorization.split('Bearer ')[1]
     let decoded = jwt.verify(token, secretObj.secret);
     let userid = decoded.id
     
    let sql = 'SELECT * FROM mails WHERE id IN (SELECT MAX(id) FROM mails WHERE receiver=? GROUP BY sender,senderNick ) ORDER BY createdAt DESC;'
    
    
    db.query(sql,[userid],function(err, results){
        if(results){
            res.send(results)
        }else{
            res.send(err)
        }
    })
})

router.post('/select/:pagenum', function(req, res, next) {
  let pageNum = req.params.pagenum  
  const token = req.headers.authorization.split('Bearer ')[1]
     let decoded = jwt.verify(token, secretObj.secret);
     let userid = decoded.id
  let body=req.body
   let offset = 0;

    if(pageNum > 1){
    offset = 20 * (pageNum - 1);
    }
    if(body.senderNick==='익명'){
    models.mail.findAll({
    where:{
        [Sequelize.Op.or]: [
                  {sender: userid,receiver:body.sender,senderNick:'익명'}, 
                  {sender: body.sender,receiver:userid,senderNick:'익명'}
                  ]
    },    
    offset: offset,
    limit: 20,
    order: [['id', 'DESC']]
    })
    .then( result => {
            res.send(result);
    })
    .catch( err => {
            console.log(err);
            res.send("fail")
     })
}else{
    models.mail.findAll({
    where:{
        [Sequelize.Op.or]: [
                  {sender: userid,receiver:body.sender,senderNick:{[Sequelize.Op.not]: '익명'}}, 
                  {sender: body.sender,receiver:userid,senderNick:{[Sequelize.Op.not]: '익명'}}
                  ]
    },    
    offset: offset,
    limit: 20,
    order: [['id', 'DESC']]
    })
    .then( result => {
            res.send(result);
    })
    .catch( err => {
            console.log(err);
            res.send("fail")
     })
}
});

router.post('/readMail',function(req,res,next){
    let body = req.body
    const token = req.headers.authorization.split('Bearer ')[1]
     let decoded = jwt.verify(token, secretObj.secret);
     let userid = decoded.id
    models.mail.update({read: 1}, {
        where: {
            sender: body.sender,
            senderNick:body.senderNick,
            receiver:userid,
            read:0
        }})
        .then( result => {
            res.send('ok');
    })
    .catch( err => {
            console.log(err);
            res.send("fail")
     })
})

router.post('/resend',async function(req,res,next){
    const usertoken = req.headers.authorization.split('Bearer ')[1]
     let decoded = jwt.verify(usertoken, secretObj.secret);
     let userid = decoded.id
     let result = await models.user.findOne({
                    where: { id: userid }
                    })     
                    
    let body = req.body
    
    
    let author=result.nickname
    if(body.senderNick==='익명'){
        author='익명'
    }
    models.mail.create({
        sender:userid,
        senderNick:author,
        receiver:body.receiver,
        text:body.text,
        read:0,
    })
    .then( result => {
            res.send('okay')
        })
        .catch( err => {
            console.log(err);
            res.send('error')
        })
        
        let notiToken = await models.notiToken.findOne({
                    where: { userid: body.receiver }})
        if(notiToken){ 
        let token = notiToken.dataValues.token
        
        
       const option = {
	method: 'POST',
	url: 'https://fcm.googleapis.com/fcm/send',
	json: {
		'to': token,
		'notification': {
			'title': author+'님이 쪽지를 보냈습니다.',
			'body': body.text,
			'click_action': 'http://localhost:3000'+'/mail', //이 부분에 원하는 url을 넣습니다.
		}
	},
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'key=AAAATr4HM-8:APA91bEIHlrkayFO_4dLwexMlL0W1NGB77AmUpns9kHsmF68-b1iBvuswhmQnWue59NEl_2u3agEBuM_XFJ5RP-okDDLYtVwyshESw6E10BaMPdRU1PP54Pxo0BktgKARWYhrRH6nJBM'
	}
} 
    request(option, (err, res, body) => {
	if(err) console.log(err); //에러가 발생할 경우 에러를 출력
	else console.log(body); //제대로 요청이 되었을 경우 response의 데이터를 출력
})
}
})

module.exports = router;
