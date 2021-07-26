var express = require('express');
var router = express.Router();
const models = require('../models');
var moment = require("moment")
var request = require('request')
let jwt = require("jsonwebtoken");
let secretObj = require("../config/jwt");

router.post('/create', async function(req, res, next) {
    const token = req.headers.authorization.split('Bearer ')[1]
    let decoded = jwt.verify(token, secretObj.secret);    
    let userid = decoded.id     
    let result = await models.user.findOne({
                    where: { id: userid }
                    })     
    let body = req.body
    let author = result.nickname
    let content = '회원님의 게시물에 '+author+'님이 댓글을 남겼습니다.'
    let title = '댓글알림'
  if(req.body.isAnonymous === true){
      author= '익명'
  }
  if(req.body.type==='reReply'){
      content = '회원님의 댓글에 '+author+'님이 대댓글을 남겼습니다.'
      title='대댓글알림'
  }else{
      content = '회원님의 게시물에 '+author+'님이 댓글을 남겼습니다.'
      title='댓글알림'
  }
  
  
  
  
  
  var endpoint=result.dataValues.upstateAt      
        let endpoint7=moment(endpoint).add("7","d").format("YYYY-MM-DD")
        let endpoint15=moment(endpoint).add("15","d").format("YYYY-MM-DD")
        let endpoint30=moment(endpoint).add("30","d").format("YYYY-MM-DD")
        
        if(result.dataValues.state===100){
            console.log("강제탈퇴된유저");
            res.send('forced withdrawal')
            return false;
        }else if(result.dataValues.state===7&&new Date()<new Date(endpoint7)){
            console.log("7paused");
            res.send(endpoint7);
            return false;
        }else if(result.dataValues.state===15&&new Date()<new Date(endpoint15)){
            console.log("15paused");
            res.send(endpoint15);
            return false;
        }else if(result.dataValues.state===30&&new Date()<new Date(endpoint30)){
            console.log("30paused");
            res.send(endpoint30);
            return false;
        }
 
    models.replys.create({
        postid:body.postid,
        parentcomment:body.parentcomment,
        author:author,
        userid:userid,
        content:body.content
    })
        .then( result => {
            res.send("okay");
        })
        .catch( err => {
            res.send("fail")
        })

       models.notification.create({
        title:title,
        content:content,
        link:'/ViewPost?id='+body.postid,
        read:0,
        receiver:body.receiver,
    })
    .then( result => {
            console.log("데이터 추가 완료");
            //console.log(notiToken)
            
        })
        .catch( err => {
            console.log(err);
            
        })
     
     let notiToken = await models.notiToken.findOne({
                    where: { userid: body.receiver }
         })
         
        let notitoken = notiToken.dataValues.token
        console.log('notitoken:'+notitoken)   
        
       const option = {
	method: 'POST',
	url: 'https://fcm.googleapis.com/fcm/send',
	json: {
		'to': notitoken,
		'notification': {
			'title': title,
			'body': content,
			'click_action': 'https://smhs.vercel.app'+'/ViewPost?id='+body.postid, //이 부분에 원하는 url을 넣습니다.
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

router.get('/select', function(req, res, next) {
    let postid = req.query.postid
    models.replys.findAll({
    where:{postid:postid,parentcomment:0}, 
    order: [['id', 'ASC'],[ {model: models.replys, as: 'ReComment'}, 'createdAt', 'ASC' ]],
    include: [{
        model: models.replys,
        as: 'ReComment'
    }]
    })
    .then( result => {
            
            res.send(result);
    })
    .catch( err => {
            
            res.send(err)
     })

})

router.delete('/delete',function(req,res,next){
    let body= req.body
    console.log(body)
    models.replys.update({parentcomment: -1},{
        where: {id: body.commentid}
 }).then(function(result) {
     res.send('ok')
 }).catch(function(err) {
     res.send(err)
 });
 
})

router.post('/singo',async function(req,res,next){
    console.log(req.body)
    let body = req.body
    const token = req.headers.authorization.split('Bearer ')[1]
  let decoded = jwt.verify(token, secretObj.secret);    
  let userid = decoded.id         
    let reporter = await models.reportreply.findOne({
    where: [{reporter: userid},{replyid:body.commentid}]
    });
    if(reporter){
        res.send('이미 신고하셨습니다.')
        return;
    }
    let singoNum = await models.reportreply.findAll({
    where: {replyid:body.commentid}
    }); 
    
    if(singoNum.length>=4){
        models.replys.update({parentcomment: -2},{
        where: {id: body.commentid}
        }).then(function(result) {
        res.send('신고했습니다.')
        }).catch(function(err) {
        res.send(err)
        });
        
        models.notification.create({
        title:'신고알림',
        content:'신고 다수누적으로 인해 글쓰기, 댓글활동이 7일 중지되었습니다. 신고된댓글:'+body.title,
        read:0,
        receiver:body.author,
        })
        
        models.user.update({state: 7,upstateAt:new Date()},{
        where: {id: body.author}
        })
        
        }else{
        models.reportreply.create(
        {
            replyid: body.commentid,
            reporter:userid
        }
        ).then(function(result) {
        res.send('신고했습니다.')
        console.log('신고완료')
        }).catch(function(err) {
        res.send(err)
        console.log(err)
        });    
        }
})

module.exports = router;