var express = require( 'express' );
var app = require( '../../app' );
var router = express.Router();
var config = require( '../../lib/config' );

var userModel = require( '../models/proModel' ).userModel;
var proModel = require( '../models/proModel' ).proModel;
var culturalModel = require( '../models/proModel' ).culturalModel;

var pageQuery = require( '../middlewares/pageQuery' );
var log4js = require( '../middlewares/log4js' );

var checkNotLogin = require( '../middlewares/check' ).checkNotLogin;
var checkLogin = require( '../middlewares/check' ).checkLogin;

var logger = log4js.logger();
var debuglog = log4js.debuglog();

var path = require('path');
var fs = require('fs');
var archiver = require('archiver');

var moment = require( 'moment' );
// moment(Date.now()).format('YYYY-MM-DD');

/**
 * 主页
 */
router.get( '/', function ( req, res, next ) {
    res.redirect( '/home' );
} );
router.get( '/home', function ( req, res, next ) {
    var data = [];
    culturalModel.find({
        isPublish: true
    }, function(err, mes) {
        if(err){
            next(err);
        }
        data = mes;
        
        res.render( 'home', {
            user: req.session.user,
            datas: data
        } );
    })

} );

/**
 * 新建项目页面
 */
router.get( '/personal/:personalId', checkLogin, function ( req, res, next ) {
    var page = req.query.page ? parseInt( req.query.page ) : 1;
    pageQuery( page, req.params.personalId, function ( err, data ) {
        if ( err ) {
            next( err );
            return;
        }

        // data.content.proDate = moment(data.content.proDate).format('yy-mm-dd');

        res.render( 'personal', {
            page: page,
            pages: data.pages,
            content: data.content,
            count: data.count,
            isFirstpage: 1,
            isLastage: page * 9 >= data.count
        } );
    } );

} );

/**
 * 登录页面
 */
router.get( '/signin', checkNotLogin, function ( req, res, next ) {
    res.render( 'signin', {
        user: false
    } );
} );

/**
 * 登出页面
 */
router.get( '/signout', checkLogin, function ( req, res, next ) {

    req.session.user = null;
    res.redirect( '/home' );
} );

/**
 * 注册页面
 */
router.get( '/register', checkNotLogin, function ( req, res, next ) {
    res.render( 'register', {
        user: false
    } );
} );

/**
 * 上传页面
 */
router.get( '/upload/:projectId', checkLogin, checkLogin, function ( req, res, next ) {
    var page = req.query.page ? parseInt( req.query.page ) : 1; //查询页
    culturalModel.find( {
        projectId: req.params.projectId
    }, function ( err, mes ) {
        if ( err ) {
            next( err );
            return;
        }
        if ( !mes ) {
            res.redirect( 'back' );
        } else {
            var pageSys = {
                isFirstpage: ( page - 1 ) == 0,
                isLastage: page * 16 >= mes.length,
                page: page,
                limit: 16,
                count: mes.length
            };
            pageSys.pages = Math.ceil( mes.length / pageSys.limit );
            pageSys.page = Math.min( pageSys.pages, pageSys.page ) || 1;
            var data = [];
            var length = ( pageSys.page ) * pageSys.limit > pageSys.count ? pageSys.count : ( pageSys.page * pageSys.limit );
            for ( var i = 0 + ( pageSys.page - 1 ) * pageSys.limit; i < length; i++ ) {
                var doc = {};
                doc = mes[ i ];
                data.push( doc );
            }

            res.render( 'personalupload', {
                data: data,
                pageSys: pageSys
            } );
        }
    } );
} );

/**
 * 修改页面
 * 初始读取数据库中默认参数，返回至前端
 */
router.get( '/editor/:culturalId', checkLogin, function ( req, res, next ) {
    var _id = req.params.culturalId;
    culturalModel.find( {
        _id: _id
    }, function( err, doc ) {
        if ( err ) {
            next();
        }

        var publish = {};      
        publish = doc[0];
        // console.log(publish);

        res.render( 'editor', { publish: publish } );
    } );
    // res.render( 'editor' );
} );

/**
 * 预览页面
 * 
 * 
 */
router.get( '/view/:culturalId', checkLogin, function ( req, res, next ) {
    var _id = req.params.culturalId;
    culturalModel.find( {
        _id: _id,
        isPublish: true
    }, function( err, doc ) {
        if ( err ) {
            next();
        }

        var publish = {};      
        publish = doc[0];
        // console.log(publish);

        res.render( 'preview', { publish: publish } );
    } );
    // res.render( 'editor' );
} );


/**
 * 下载
 */
// router.get( '/downLoad', checkLogin, function(req, res, next) {
//        //打包文件
//        var projectId = '5ab8b737b2f14a4a44fc1d60';
//        var fileNames = ['bitong.html'];
//        console.log(fileNames, projectId);
//        var pathFile = 'dist/' + projectId + '/' + fileNames[0];
//        var zipName = 'package.zip';
//        res.setHeader('Content-Disposition','attachement;fo;ename=' + zipName);
//        var archive = archiver.create('zip',{});
//        archive.file(pathFile,{name:fileNames[0]});
//        archive.directory('dist/public/','public');
//        archive.finalize();
//        archive.pipe(res);
    
// });

router.get('/pub/:culturalId', function(req, res, next){
    var culturalId = req.params.culturalId;

    culturalModel.find({
        _id: culturalId,
        isPublish: true
    }, function(err, mes){
        if(err){
            next(err);
        }
        console.log(mes);
        if(!mes) {
            next(new Error('404'));
        } else {
            res.render('preview.ejs',{ publish: mes[0] })
        }
    })
})


module.exports = router;