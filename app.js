var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');  
var cors = require('cors');
const schedule = require('./lib/schedule')
schedule.test()
schedule.noticlear()

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var boardRouter = require('./routes/board');
var replyRouter = require('./routes/reply');
var postRouter = require('./routes/post');
var loginRouter = require('./routes/login');
var signRouter = require('./routes/sign');
var mailRouter = require('./routes/mail');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// CORS 설정
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var bodyParser = require('body-parser'); 

app.use(bodyParser.urlencoded({extended:true})); 
app.use(bodyParser.json());

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/board', boardRouter);
app.use('/api/reply', replyRouter);
app.use('/api/post', postRouter);
app.use('/api/login', loginRouter);
app.use('/api/sign', signRouter);
app.use('/api/mail',  mailRouter);

/*const models = require("./models/index.js");

models.sequelize.sync().then( () => {
    console.log(" DB 연결 성공");
}).catch(err => {
    console.log("연결 실패");
    console.log(err);
})
**/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3001,()=>{
    console.log('listening 3001ssks');
});

module.exports = app;
