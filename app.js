var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var hbs= require('express-handlebars')
const hb =hbs.create({})

var app = express();
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

// var fileUpload = require('express-fileupload')
var session = require('express-session')

hb.handlebars.registerHelper('eq', function (a, b) {
  return a == b;
});

hb.handlebars.registerHelper('eqn', function (a) {
  return a == null;
});

hb.handlebars.registerHelper('gtr', function (a,b) {
  return a > b ;
});

hb.handlebars.registerHelper('ifAnd', function(v1, v2, options) {
  if(v1 && v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(fileUpload({
//   useTempFiles : true,
//   tempFileDir : __dirname + '/public/temp/'
// }))
app.use(session({secret:"Key",cookie:{maxAge:6000000}}))

app.use('/', indexRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // console.log(err)
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
