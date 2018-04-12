//验证用户是否登陆

    exports.checkLogin = function (req, res, next) {
        if (!req.session.user) {
            //req.flash('error', '未登陆');
            return res.redirect('/signin');
        }
        next();
    };

    exports.checkNotLogin = function (req, res, next) {
        if(req.session.user) {
            //req.flash('error', '已登录');
            console.log('check.js/14' + req.session.user);
            return res.render('home',{
                user: req.session.user
            });    //重定向返回之前页面
        }
        next();
    }; 

    //是否需要优化？