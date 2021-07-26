var express = require('express');
var router = express.Router();
const models = require('../models');
let jwt = require("jsonwebtoken");
let secretObj = require("../config/jwt");


router.post('/like', async function(req, res, next) {
    let type = req.body.type
    let postid = req.body.postid
    const token = req.headers.authorization.split('Bearer ')[1]
  let decoded = jwt.verify(token, secretObj.secret);    
  let userid = decoded.id         
  console.log(req.body)
   if(type=="insert"){
    let result = await models.likes.findOne({
    where: [{liker: userid},{postId:postid}]
    });
    console.log(result)
        if(result){
            models.posts.increment({like:-1}, {where: {id: postid}})
            models.likes.destroy({
        where: [
            {liker:userid},
            {postId:postid}
         ]
        })
         .then( result => {
            res.send("already");
        })
        .catch( err => {
            console.log(err);
            res.send("fail")
        })
        
        }else{
        models.posts.increment({like:+1}, {where: {id: postid}})
            models.likes.create({
        postId:req.body.postid,
        liker:userid
         })
          .then( result => {
            console.log("데이터 추가 완료");
            res.send("insert");
        })
        .catch( err => {
            console.log(err);
            res.send("fail")
        })
        }
    }
})

router.post('/scrab', async function(req, res, next) {
    let type = req.body.type
    let postid = req.body.postid
    const token = req.headers.authorization.split('Bearer ')[1]
    let decoded = jwt.verify(token, secretObj.secret);    
    let userid = decoded.id         
   if(type=="insert"){
    let result = await models.stars.findOne({
    where: [{starer: userid},{postId:postid}]
    });
    console.log(result)
        if(result){
            models.posts.increment({star:-1}, {where: {id: postid}})
            models.stars.destroy({
        where: [
            {starer:userid},
            {postId:postid}
         ]
        })
         .then( result => {
            res.send("already");
        })
        .catch( err => {
            console.log(err);
            res.send("fail")
        })
        
        }else{
            models.posts.increment({star:+1}, {where: {id: postid}})
            models.stars.create({
        postId:req.body.postid,
        starer:userid
         })
          .then( result => {
            console.log("데이터 추가 완료");
            res.send("insert");
        })
        .catch( err => {
            console.log(err);
            res.send("fail")
        })
        }
    }
})

router.post('/selectInfo', async function(req, res, next) {
    let postid = req.body.postid
    const token = req.headers.authorization.split('Bearer ')[1]
    let decoded = jwt.verify(token, secretObj.secret);    
    let userid = decoded.id         
    console.log(token)
    let like = await models.likes.findOne({
    where: [{liker: userid},{postId:postid}]
    });
    let scrab = await models.stars.findOne({
    where: [{starer: userid},{postId:postid}]
    });
    console.log(like)
    if(like&&scrab){
        console.log('both')
        res.send('both')
    }else if(like){
        console.log('like')
        res.send('like')
    }else if(scrab){
        console.log('scrab')
        res.send('scrab')
    }else{
        console.log('any')
        res.send('any')
    }
    
})

router.delete('/delete',function(req,res,next){
    models.posts.update({category: 0},{
        where: {id: req.body.postid}
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
    let reporter = await models.singo.findOne({
    where: [{reporter: userid},{postId:body.postid}]
    });
    if(reporter){
        res.send('이미 신고하셨습니다.')
        return;
    }
    let singoNum = await models.singo.findAll({
    where: {postId:body.postid}
    }); 
    
    if(singoNum.length>=4){
        models.posts.update({category: 0},{
        where: {id: body.postid}
        }).then(function(result) {
        res.send('신고했습니다.')
        }).catch(function(err) {
        res.send(err)
        });
        
        models.notification.create({
        title:'신고알림',
        content:'신고 다수누적으로 인해 글쓰기, 댓글활동이 7일 중지되었습니다. 신고된게시물:'+body.title,
        read:0,
        receiver:body.author,
        })
        
        models.user.update({state: 7,upstateAt:new Date()},{
        where: {id: body.author}
        })
        
        }else{
        models.singo.create(
        {
            postid: body.postid,
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