var express = require( 'express' );
var app = require( '../../app' );
var router = express.Router();
var config = require( '../../lib/config' );
var Promise = require( 'bluebird' );
var ejs = require( 'ejs' );
var template = require( 'ejs-template-loader' );
var gulp = require( 'gulp' );
var ejsg = require( 'gulp-ejs' );
var rename = require( 'gulp-rename' );
var deleteFolder = require( 'folder-delete' );

var fs = require( 'fs' );
var path = require( 'path' );
var multiparty = require( 'multiparty' );

var userModel = require( '../models/proModel' ).userModel;
var proModel = require( '../models/proModel' ).proModel;
var culturalModel = require( '../models/proModel' ).culturalModel;

var checkNotLogin = require( '../middlewares/check' ).checkNotLogin;
var checkLogin = require( '../middlewares/check' ).checkLogin;

var ziphandler = require( '../middlewares/ziphandler' );
var decompress = require( 'decompress' );
var fileManage = require( '../middlewares/fileManage' );

var pageQuery = require( '../middlewares/log4js' );
var log4js = require( '../middlewares/log4js' );

var moment = require( 'moment' );
// moment(Date.now()).format('YYYY-MM-DD'); 服务器端格式化时间

var logger = log4js.logger();
var debuglog = log4js.debuglog();
/* GET users listing. */

/**
 * 注册账户
 */
router.post( '/register', checkNotLogin, function ( req, res, next ) {

    req.session.user = null;
    var userName = req.body.userName;
    var passWord = req.body.passWord;

    //校验参数
    try {
        if(!(userName.length >= 3 && userName.length <= 15)){
            throw new Error('用户名在3-15个字符之间');
        }
        if(passWord.length < 3){
            throw new Error('密码至少3个字符');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/register');
    }

    console.log( 'register/34' + req.body );
    var user = {
        name: req.body.userName,
        password: req.body.passWord,
        date: Date.now()
    };

    var userManage = new userModel( user );

    //创建新用户
    userManage.save( function ( err, mes ) {
        if ( err ) {
            logger.error( 'register/43' + err );
            next( err );
        }
        console.log(mes + 'mes');
        if(mes){
            delete mes.password;

            req.session.user = [ mes ];
            //注册成功重定向
            res.redirect( '/home' );
        }
        
        
    } ).catch(function(e) {
        
        if(e.message.match('E11000')) {
            req.flash('error', '用户名已占用');
            return res.redirect('/register');
        }
        //next(e);
    });

} );

/**
 * 登录账户
 */
router.post( '/signin', checkNotLogin, function ( req, res, next ) {
    var name = req.body.userName;
    var password = req.body.passWord;

    userModel.find( {
        name: name
    }, function ( err, mes ) {
        if ( err ) {
            next(err);
        }
        console.log( password );
        console.log( 'post/89' );

        if ( !mes[ 0 ] ) {
            req.flash('error', '用户名或密码错误');
            return res.redirect( 'back' );
        } else if ( mes[ 0 ].password != password ) {
            req.flash('error', '用户名或密码错误');
            return res.redirect( 'back' );
        }

        delete mes.password;
        req.session.user = mes;
        res.redirect( '/' );
    } );
} );

/**
 * 新建项目
 */
router.post( '/personal/:userId/project', checkLogin, function ( req, res, next ) {
    var userId = req.params.userId;
    var proName = req.body.proName;
    var proDescription = req.body.proDescription;
    var proDate = Date.now();
    var proManage;

    console.log( req.session.user[ 0 ]._id );
    userModel.find({
        _id: req.session.user[0]._id
    }, function(err, mes) {
        if(err) {
            next(mes);
        }

        proManage = new proModel( {
            userId: userId,
            proName: proName,
            proDescription: proDescription,
            proDate: proDate,
            userName: mes[0].name
        } );

    }).then(function(){
        proManage.save( function ( err, mes ) {
            if ( err ) {
                logger.error( 'personal/98' + err );
                next( err );
            }
        } ).then( function () {
            proModel.find( {
                proName: proName,
                proDescription: proDescription,
                proDate: proDate
            }, function ( errs, mess ) {
                var projectPath = './dist/' + mess[ 0 ]._id;
                fileManage.createFolder( projectPath );
                res.redirect( '/personal/' + req.params.userId );
            } );
        } );
    })
} );

/**
 * 上传文物
 */
router.post( '/upload/:projectId', function ( req, res, next ) {
    var projectId = req.params.projectId; //项目所属字段

    //设置文件上传路径
    var form = new multiparty.Form( {
        uploadDir: './.temp/'
    } );
    form.parse( req, function ( err, fields, files ) {
        if ( err ) {
            next( err );
            return;
        }
        var file = files.model[ 0 ]; //取得文件
        var realPath = form.uploadDir + file.originalFilename; //获取文件名
        fs.renameSync( file.path, realPath ); //同步重命名文件

        var projectPath = './dist/' + projectId;


        ziphandler.decompress( {
            input: realPath,
            output: projectPath
        }, function ( filelist ) {
            var culturalCount = filelist.length;
            var userName, proDescription, proName;
            
            proModel.find( {
                _id: projectId
            }, function(err, mes) {
                if(err){
                    next(err);
                }

                userName = mes[0].userName;
                proDescription = mes[0].proDescription;
                proName = mes[0].proName;

            }).then( function () {
                proModel.update( {
                    _id: projectId
                }, {
                    '$inc': {
                        'culturalCount': culturalCount
                    }
                }, function ( err ) {
                    if ( err ) {
                        next( err );
                        return;
                    }
                    var culturalManage = [];
                    for ( var i = 0; i < culturalCount; i++ ) {
                        culturalManage[ i ] = new culturalModel( {
                            projectId: projectId,
                            fileName: filelist[ i ].fileName,
                            pageName: filelist[ i ].pageName,
                            fileExt: filelist[ i ].fileExt,
                            filePath: filelist[ i ].filePath,
                            date: Date.now(),
                            userName: userName,
                            proName: proName,
                            proDescription: proDescription
                        } );
                        culturalManage[ i ].save();
                    }
                } );
            });
        
            res.send( 'upload success' );

        } );

    } );

} );

/**
 * 发布
 */
router.post( '/publish', function ( req, res, next ) {
    var _id = req.body.id;
    var projectId;
    Promise.promisifyAll( culturalModel );
    culturalModel.find( {
        _id: _id
    }, function ( err, mes ) {
        if ( err ) {
            next( err );
        }
        projectId = mes[ 0 ].projectId;
        gulp.src( './views/template.ejs' )
            .pipe( ejsg( {
                publish: mes[ 0 ],
                user: req.session.user
            }, {}, {
                ext: '.html'
            } ) )
            .pipe( rename( mes[ 0 ].pageName + '.html' ) )
            .pipe( gulp.dest( "./dist/" + mes[ 0 ].projectId ) );
        Promise.resolve( next );
    } ).then(
        function ( next ) {
            culturalModel.update( {
                _id: _id
            }, {
                '$set': {
                    'isPublish': true
                }
            }, function ( errs, mess ) {
                proModel.update( { _id: projectId }, {
                    '$inc': {
                        'publishedCount': 1
                    }
                }, function(errss) {
                    res.end();
                } )
                
            } );

        }
    );

} );

/**
 * 编辑
 */
router.post( '/culturalUp', function ( req, res, next ) {
    var _id = req.body.id;
    var pageName = req.body.pageName;
    var pageTitle = req.body.pageTitle;
    culturalModel.update( {
        _id: _id
    }, {
        '$set': {
            'pageName': pageName,
            'pageTitle': pageTitle
        }
    }, function ( err, mes ) {
        if ( err ) {
            next( err );
        }
        res.end();
    } );

} );
/**
 * 删除文物
 */
router.post( '/delete', function ( req, res, next ) {
    var _id = req.body.id;
    var isPublish = req.body.isPublish;
    var projectId;
    Promise.promisifyAll( culturalModel );
    if ( isPublish == 'true' ) {
        culturalModel.find( {
            _id: _id
        }, function ( err, mes ) {
            projectId = mes[ 0 ].projectId;
            var filePath = './dist/' + mes[ 0 ].projectId + '/' + mes[ 0 ].pageName + '.html';
            fileManage.deleteFile( filePath );
            Promise.resolve( next );
        } ).then( function ( next ) {
            culturalModel.update( {
                _id: _id
            }, {
                '$set': {
                    'isPublish': false
                }
            }, function ( err ) {
                if ( err ) {
                    next( err );
                }
                proModel.update( { _id: projectId }, {
                    '$inc': {
                        'publishedCount': -1
                    }
                }, function(errss) {
                    res.end();
                } )
            } );
        } );
    } else {
        culturalModel.find( {
            _id: _id
        }, function ( err, mes ) {
            if ( err ) {
                next( err );
            }
            projectId = mes[ 0 ].projectId;
            var culturalPath = './dist/' + mes[ 0 ].projectId + '/' + mes[ 0 ].fileName;
            fileManage.deleteFolder( culturalPath );
            Promise.resolve( next );
        } ).then( function ( next ) {
            culturalModel.remove( {
                _id: _id
            }, function ( errs ) {
                if ( errs ) {
                    next( errs );
                }
                proModel.update( { _id: projectId }, {
                    '$inc': {
                        'culturalCount': -1
                    }
                }, function(errss) {
                    res.end();
                } )
            } );
        } );
    }
} );

/**
 * 删除项目  ///始终有问题
 */
router.post( '/deleteProject', function ( req, res, next ) {
    var projectId = req.body.id;
    var proPath;
    culturalModel.remove( {
        projectId: projectId
    }, function ( errss ) {
        if ( errss ) {
            next( errss );
        }
        
    } ).then(function() {
       
        proPath = './dist/' + projectId; 

        proModel.remove( {
            _id: projectId
        }, function ( errs ) {
            if ( errs ) {
                next( errs );
            } 
            res.end();
            
        } );
    }).catch(function(err) {
        res.end();
        next(err);
    })
    // .then(function() {
    //     if(fs.statSync(proPath).isDirectory()){
                
    //         fileManage.deleteFolder(proPath);

    //         res.end();
    //     } else {
    //         res.end();
    //     }
    // })
    

} );


/**
 * 保存
 * 将当前参数保存至数据库
 */
router.post( '/saveJson', function ( req, res, next ) {
    var culturlaId = req.body.id;
    var canvasBase64 = req.body.base64;
    Promise.promisifyAll(culturalModel);
    culturalModel.find({
        _id: culturlaId
    }, function (err, doc) {
        if (err) {
            next( err );    
        }
        var fileName = doc[0]._id;
        var projectPath = path.join('public/culimage',fileName + '.png');
        
        var strs = new Buffer( canvasBase64, 'base64' );
        fs.writeFileSync(projectPath, strs);
      
        // Promise.resolve( next );
    }).then(function( ) {
        culturalModel.update({
            _id: culturlaId
        }, {
            '$set': {
                rotateSpeed: req.body.rotateSpeed,
                zoomSpeed: req.body.zoomSpeed,
                culturalInfo: {
                    position:{
                        x: req.body.modelPosition.x,
                        y: req.body.modelPosition.y,
                        z: req.body.modelPosition.z
                    },
                    rotation:{
                        x: req.body.modelRotation.x,
                        y: req.body.modelRotation.y,
                        z: req.body.modelRotation.z
                    },     
                },
                lightColor: req.body.lightSet.color,
                intensity: req.body.lightSet.intensity,
                wireframeState:  req.body.wireframeState,
                opacity:  req.body.opacity,
                shininess: req.body.shininess,
                diffuseColor: req.body.diffuseColor,
                specularColor:  req.body.specularColor,
                background: req.body.background
            }
        }, function(errs) {
            if(errs) {
                next(errs);
            }
            
            res.end();
        })
    }).catch(function(error) {
        console.log(error.message);
    })

});

/**
 * 下载
 */

module.exports = router;