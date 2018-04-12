var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var nodemon = require('gulp-nodemon');
var gulpless = require('gulp-less');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');


/**
 *启动express服务器
 */
gulp.task('nodemon', function(cb) {
    var flag = false;
    return nodemon({
        script: './app.js',
        ignore: ['.vscode/', '.idea/', 'node_modules/']
    }).on('start', function() {
        if (!flag) {
            cb();
            flag = true;
        }
    });

});
/**
 * 编译less
 */
gulp.task('less', function() {

    return gulp.src('less/**.less')
        .pipe(gulpless())
        .pipe(gulp.dest('public/style'))
        .pipe(reload({
            stream: true
        }));
});
/**
 * watch the less file change
 */
gulp.task('auto', function() {
    gulp.watch('less/**.less', ['less']);
});
/**
 *同步刷新浏览器
 */


gulp.task('browserSync', ['nodemon'], function() {

    browserSync.init(null, {
        proxy: 'http://localhost:3456',
        files: ['less/*.less',"public/**/*.*", "views/**/*.*", "server/**/*.*", 'config/**/*.*'],
        port: 8080
    });


});


gulp.task('default', [ 'browserSync', 'less'],function(){
    gulp.watch(['less/**/*.less'],['less']);
});
