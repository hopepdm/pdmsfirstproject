npm install express-generator -g 安装express应用生成器

express rethreeplatform 生成项目demo，删除不必要的文件同时添加新的文件，构成新项目。

路由：

app.get('/', function(req, res) {
    res.send('hello world');
});

get/post/put/delete
静态资源存放多个目录时，可以多次调用express.static中间件，node会根据添加顺序进行查找。

app.use('/static', express.static('public'));//增加虚拟目录，访问时http://localhost:3000/static/images/···。

路由中间件和非路由中间件的next()是不同的，源码就不同。如果请求终止，next()依然执行。如果删掉next()依然会执行。

理解express路由中间件之后，那么访问某个路由时就很简单了。这个时候，Router中间件就起作用了。app.use会自动索引路由，当该路由相关回调正确执行时，请求终止，否则会抛出错误404或其他。

ejs模板demo
变量：<%= variable %>

js代码：<% for(var i; i < variable.length; i++>) %>    //此处变量无需<%=  %>

导入外部ejs：<%- include('footer') %>


req.query： 处理 get 请求，获取 get 请求参数
req.params： 处理 /:xxx 形式的 get 或 post 请求，获取请求参数
req.body： 处理 post 请求，获取 post 请求体
req.param()： 处理 get 和 post 请求，但查找优先级由高到低为 req.params→req.body→req.query

检测用户登录状态的核心是session。通过判断session中的user和清空session = null来登出用户。而为了更好的实现用户管理权限，以check session的形式完成检测中间件。

```javascript
function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录！')；
        res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录！');
        res.redirect('back');
    }
    next();
}
```

功能及路由设计如下：

注册
注册页：GET /signup
注册：POST /signup
登录
登录页：GET /signin
登录：POST /signin
登出：GET /signout
查看
主页：GET /posts
个人主页：GET /posts?author=xxx
查看文物：GET /posts/:postId
发表文物
发表文物页：GET /posts/create
发表文物：POST /posts
修改文物
修改文物页：GET /posts/:postId/edit
修改文物：POST /posts/:postId/edit

错误1：converting circular structure to json
因为循环引用json格式导致

req.session.user似乎是个数组对象？

check中间件需因项目而异，session的管理很重要，清理要及时，否则会导致注册，登录失败
