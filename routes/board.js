var express = require('express');
var router = express.Router();
const models = require('../models');
const path = require("path");
const multer = require("multer");
const multerS3 = require('multer-s3');
const AWS = require("aws-sdk");
const moment = require("moment");
AWS.config.loadFromPath(__dirname + "/../config/awsconfig.json");
const Sequelize = require("sequelize");
const db = require('../config/sqlconfig');
let jwt = require("jsonwebtoken");
let secretObj = require("../config/jwt");

let s3 = new AWS.S3();

let upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "studybot",
    key: function (req, file, cb) {
      let extension = path.extname(file.originalname);
      cb(null, Date.now().toString() + extension)
    },
    acl: 'public-read-write',
  })
})


router.post('/create', upload.single("imgFile"), async function(req, res, next) {
    
   const token = req.headers.authorization.split('Bearer ')[1]
  let decoded = jwt.verify(token, secretObj.secret);    
  let userid = decoded.id         
  
  let result = await models.user.findOne({
                    where: { id: userid }
                    })     
  
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
  
  let body = req.body;    
  let file = req.file
  let author = result.nickname
  let category = body.category
  
  if(req.body.isCheck === 'true'){
      author= '익명'
      console.log('anonymous post')
  }
  if(req.body.category === 'grade'){
      category= result.grade
      console.log('grade post')
  }
  if(file){
  models.posts.create({
        author:author,
        userid:userid,
        category:category,
        title: body.title,
        description: body.description,
        image:file.key
    })
        .then( result => {
            console.log("데이터 추가 완료");
            res.send("okay");
        })
        .catch( err => {
            console.log(err);
            res.send("fail")
        })
  }else{
      models.posts.create({
        author:author,
        userid:userid,
        category:category,
        title: body.title,
        description: body.description
    })
        .then( result => {
            console.log("데이터 추가 완료");
            res.send("okay");
        })
        .catch( err => {
            console.log(err);
            res.send("fail")
        })
  }
});

router.get('/read', function(req, res, next) {
  let query = req.query;    
 
  let sql= `select posts.id, posts.userid,posts.author,posts.category,posts.title,posts.description,posts.image,posts.like,posts.star,posts.createdAt,users.image as pfimg from posts left join users on posts.userid = users.id WHERE posts.id=?`
  db.query(sql,[query.id],function(err, results){
        if(results){
            res.send(results[0])
        }else{
            console.log(err)
            res.send(results[0])
        }
    })

});

router.get('/notiread', function(req, res, next) {
  let query = req.query;    
 
  models.posts.findOne({
        where: { id: query.id,category:10 }
    })
        .then( result => {
            
            res.send(result);
        })
        .catch( err => {
            console.log(err);
            res.send("fail")
        })
});

router.get('/select/:category/:pagenum', function(req, res, next) {
  let pageNum = req.params.pagenum  
  let category = req.params.category  
 
let offset = 0;

    if(pageNum > 1){
    offset = 20 * (pageNum - 1);
    }
    models.posts.findAll({
    include: [
        {model: models.replys},
        {model: models.likes}
        ]
        ,    
    where:{category:category},    
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

});

router.get('/notiselect/:pagenum', function(req, res, next) {
  let pageNum = req.params.pagenum  
 
let offset = 0;

    if(pageNum > 1){
    offset = 20 * (pageNum - 1);
    }
    models.posts.findAll({
    where:{category:10},    
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

});

router.get('/grade', async function(req, res, next) {
  let pageNum = req.params.pagenum  
  
  const token = req.headers.authorization.split('Bearer ')[1]
     let decoded = jwt.verify(token, secretObj.secret);
     let userid = decoded.id
  let user = await models.user.findOne({
                    where: { id: userid }
                    })    
   let category = user.grade                   
let offset = 0;

    if(pageNum > 1){
    offset = 20 * (pageNum - 1);
    }
    models.posts.findAll({
    include: [
        {model: models.replys},
        {model: models.likes}
        ]
        ,    
    where:{category:category},    
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

});

router.get('/select2/:category/:pagenum', function(req, res, next) {
  let pageNum = req.params.pagenum  
  let category = req.params.category  
  const token = req.headers.authorization.split('Bearer ')[1]
  let decoded = jwt.verify(token, secretObj.secret);    
  let userid = decoded.id
let offset = 0;
    
    if(pageNum > 1){
    offset = 20 * (pageNum - 1);
    }
   if(category==='100'){
       console.log(req.params)
    models.posts.findAll({
    include: [
        {model: models.replys},
        {model: models.likes}
        ]
        ,    
    where:{userid:userid},    
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
}if(category==='200'){
       console.log(req.params)
    models.posts.findAll({
    include: [
        {model: models.replys},
        {model: models.likes},
        {
            model: models.stars,
            where: { starer: userid }
        }
        ],
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
}if(category==='300'){
       console.log(req.params)
    models.posts.findAll({
    include: [
        {model: models.replys},
        {
            model: models.likes,
            where: { liker: userid }
        }
        ],
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
}if(category==='400'){
    models.posts.findAll({
          where: {
            like:{[Sequelize.Op.gte]: 10,},
            },
        include: [
        {model: models.replys},
        {model: models.likes}
        ],
        order: [['createdAt','DESC'] ]
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

router.post('/setProfileImg',upload.single("imgFile"), function(req, res, next) {
    const token = req.headers.authorization.split('Bearer ')[1]
     let decoded = jwt.verify(token, secretObj.secret);
     let userid = decoded.id
    
    models.user.update({image: req.file.key}, {where: {id: userid}})
    .then( result => {
            
            res.send('success');
    })
    .catch( err => {
            console.log(err);
            res.send("fail")
     })
})

router.post('/setCardImg',upload.single("imgFile"), function(req, res, next) {
    
    const token = req.headers.authorization.split('Bearer ')[1]
     let decoded = jwt.verify(token, secretObj.secret);
     let userid = decoded.id
    console.log(req.file)
    models.user.update({card: req.file.key}, {where: {id: userid}})
    .then( result => {
            
            res.send('success');
    })
    .catch( err => {
            console.log(err);
            res.send("fail")
     })
})

router.post('/livehit', function(req, res, next) {
    models.posts.findAll({
          where: {
            createdAt:{
              [Sequelize.Op.gte]: new Date(`${moment().subtract(1,"days").format("YYYY-MM-DD")}`),
              [Sequelize.Op.lt]: new Date(`${moment().add(1,"days").format("YYYY-MM-DD")}`)  
            },
            category:100
            },
        include: [
        {model: models.replys},
        ],
        order: [['like','DESC'] ],
        limit:2
      })
      .then( result => {
            
            res.send(result);
    })
    .catch( err => {
            console.log(err);
            res.send("fail")
     })
})

router.post('/scrabhit', function(req, res, next) {
    models.posts.findAll({
          where: {
            createdAt:{
             [Sequelize.Op.lt]: new Date(`${moment().add(1,"days").format("YYYY-MM-DD")}`),
              [Sequelize.Op.gte]: new Date(`${moment().subtract(30,"days").format("YYYY-MM-DD")}`)  
            },
            category:100
            },
        include: [
        {model: models.replys},
        ],
        order: [['star','DESC'] ],
        limit:5
      })
      .then( result => {
            
            res.send(result);
    })
    .catch( err => {
            console.log(err);
            res.send("fail")
     })
})

router.get('/summary', function(req, res, next) {
    let sql = 'SELECT * FROM posts WHERE id IN (SELECT MAX(id) FROM posts GROUP BY category ) ORDER BY createdAt asc;'
    
    db.query(sql,function(err, results){
        if(results){
            res.send(results)
        }else{
            res.send(err)
        }
    })
})

router.get('/boardlist', function(req, res, next) {
    models.category.findAll({
          where: {
            category_id:{[Sequelize.Op.notIn]: [1,2,3,100,200,300,400]},
            },
        order: [['category_id','ASC'] ]
      })
      .then( result => {
            res.send(result);
    })
    .catch( err => {
            console.log(err);
            res.send("fail")
     })
})

module.exports = router;

