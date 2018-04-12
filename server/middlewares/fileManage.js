/**
 * 文件创建删除中间件
 * 待完善
 */

var fs = require( 'fs' );
var p = require( 'path' );

module.exports = {

    /**
     * [deleteAll description]
     * @type {[type]}
     */
    createFolder: function ( path ) {
        if ( !fs.existsSync( path ) ) {
            fs.mkdirSync( path );
        }
        console.log( 'createFolder success' );
    },

    /**
     * delete Folder
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    deleteFolder: function ( path ) {
        var _this = this;
        var files = [];
        var _path = p.join( path );
        if ( fs.existsSync( _path ) ) {
            files = fs.readdirSync( _path );
            console.log( files + '文件');
            files.forEach( function ( file, index ) {
                var curPath = p.join( _path, file );
                if ( fs.statSync( curPath ).isDirectory() ) {
                    _this.deleteFolder( curPath );
                } else {
                    fs.unlinkSync( curPath );
                }
            } );
            //fs.rmdirSync( path );
        }
        fs.rmdirSync( path );
        // var files = [];
        // if( fs.existsSync(path)) {
        //     files = fs.readdirSync(path);
        //     //清楚所有子文件及子文件夹下的文件
        //     files.forEach(function (file, index) {
        //         var curPath = p.join(path, file);
        //         if()
        //     });
        // }
        console.log( 'deleteFolder success' );
    },

    /**
     * [description]
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    deleteProjectFolder: function ( path ) {
        var _this = this;
        var files = [];
        if ( fs.existsSync( path ) ) {
            files = fs.readdirSync( path );
            files.forEach( function ( file, index ) {
                var curPath = p.join( path, file );
                if ( fs.statSync( curPath ).isDirectory() ) {
                    _this.deleteFolder( curPath );
                }
            } );

        }
        //fs.rmdirSync(path);
        console.log( 'deleteProjectFolder success' );
    },

    /**
     * delete File
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    deleteFile: function ( path ) {
        if ( fs.existsSync( path ) ) {
            fs.unlinkSync( path );
        }
        console.log( 'deleteFile success' );
    }
};