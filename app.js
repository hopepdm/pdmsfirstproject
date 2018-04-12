/**
 * projec：三维展示平台
 * create by wdk/pdm
 */

var path = require( 'path' );
var favicon = require( 'serve-favicon' );
var log4js = require( './server/middlewares/log4js' );
var session = require( 'express-session' );
var MongoStore = require( 'connect-mongo' )( session );
var bodyParser = require( 'body-parser' );
var ejs = require( 'ejs' );
var express = require( 'express' );

var flash = require('connect-flash');

//数据库配置与连接
var config = require( './lib/config' );
var mongoose = require( 'mongoose' );
mongoose.Promise = global.Promise;

var getMain = require( './server/routes/get' );
var postMain = require( './server/routes/post' );

var app = express();

// app.use(express.json({limit: '1mb'}));

// 设置视图模板路径和模板引擎
app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'ejs' );
app.set( 'view cache', false ); //生产环境打开

var logger = log4js.logger();


//设置静态文件路径
app.use( express.static( path.join( __dirname, '/public' ) ) );
//数据库压缩文件入口
app.use( express.static( path.join( __dirname, '/dist' ) ) );

app.use(flash());

//创建session
app.use( session( {
  resave: true, //强制更新session
  saveUninitialized: false, //即使用户未登录，强制创建一个session
  secret: 'config.session.secret', //通过设置secret来计算has值并放在cookie中，使产生的signedCookie防篡改
  cookie: {
    maxAge: config.session.maxAge
  },
  store: new MongoStore( {
    url: config.db.url
  } )
} ) );

app.use( log4js.useLog() );

//请求体json解析
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( {
  extended: true,
  limit: '10mb'
} ) );

//添加模板必须的变量
app.use( function ( req, res, next ) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
} );

app.use( '/', getMain );
app.use( '/re', postMain );

// catch 404 and forward to error handler
app.use( function ( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  //res.send('404 notfound');
  next( err );
} );

// error handler，开发环境下的错误处理器，将错误信息显示到浏览器中
app.use( function ( err, req, res, next ) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get( 'env' ) === 'development' ? err : {};

  // render the error page
  res.status( err.status || 500 );
  res.render( 'error', {
    err: err
  } );
} );

if ( module.parent ) {
  module.exports = app;
} else {
  //监听端口，启动程序
  mongoose.connect( config.db.url + config.db.database, {
    useMongoClient: true
  }, function ( err ) {
    if ( err ) {
      looger.error( "数据库链接失败：", err );
      return;
    } else {
      logger.info( "数据库连接成功" );
      app.listen( config.app.port, function () {
        logger.info( "listening:" + config.app.port );
      } );
    }
  } );
}