//数据库配置文件
module.exports= {
    db: {
        url: 'mongodb://localhost/',
        port: '27017',
        database: 'platform'
    },
    app: {
        port: 3456
    },
    session: {
        secret: 'platform',
        key: 'paltform',
        maxAge: 25920000000
    }
};