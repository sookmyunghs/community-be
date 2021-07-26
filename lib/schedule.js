const schedule = require('node-schedule');
const models = require('../models');
const Sequelize = require("sequelize");
const request = require('request')
const moment = require('moment')

module.exports = {

  test: () => {
    schedule.scheduleJob('0 30 18 * * *', async()=>{
        let livehit = await models.posts.findOne({
          where: {
            createdAt:{
              [Sequelize.Op.gte]: new Date(`${moment().subtract(1,"days").format("YYYY-MM-DD")}`),
              [Sequelize.Op.lt]: new Date(`${moment().add(1,"days").format("YYYY-MM-DD")}`)  
            },
            category:100
            },
        order: [['like','DESC'] ],
        limit:1
      })
      console.log(livehit)
      const option = {
	method: 'POST',
	url: 'https://fcm.googleapis.com/fcm/send',
	json: {
		'to': '/topics/user',
		'notification': {
			'title': '🔥오늘의 인기게시물🔥',
			'body': '오늘의 인기게시물 을 확인해보세요. '+livehit.title+':'+livehit.description,
			"image": 'https://mblogthumb-phinf.pstatic.net/MjAyMTA3MjVfMjcg/MDAxNjI3MTQ2NDM1OTU5.2B7NR3ChOb0rc0wA7lOFhbwaBs8HBi3XmD1S6icSY1sg.9wVkuBCs-XY9KxhuoNmAwuGkjrS2C5PZ0S77R3EqQ7og.PNG.ondojung/%EB%AC%B4%EC%A0%9C2_20210725020523.png?type=w800',
			'click_action': 'https://smhs.vercel.app/ViewPost?id='+livehit.id, //이 부분에 원하는 url을 넣습니다.
		}
	},
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'key=AAAATr4HM-8:APA91bEIHlrkayFO_4dLwexMlL0W1NGB77AmUpns9kHsmF68-b1iBvuswhmQnWue59NEl_2u3agEBuM_XFJ5RP-okDDLYtVwyshESw6E10BaMPdRU1PP54Pxo0BktgKARWYhrRH6nJBM'
	}
} 

    request(option, (err, res, body) => {
	if(err){
	console.log(err)
	res.send(err); //에러가 발생할 경우 에러를 출력
	}else{
	 console.log(body); 
	}
	
})
    models.notification.create({
        title:'인기게시물알림',
        content:'오늘의 인기게시물 을 확인해보세요.'+livehit.title+livehit.description,
        link:'/ViewPost?id='+livehit.id,
        read:0,
        receiver:'*',
    })

    })

   	},
   	noticlear: () => {
    schedule.scheduleJob('00 18 17 * * 7', async()=>{
        models.notification.destroy({
        where: {
        read:1
    }
    })

    })
   	}
  }