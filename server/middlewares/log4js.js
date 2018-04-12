var log4js = require('log4js');
var configure = require('../../lib/logconfig');

log4js.configure(configure); //配置文件

//网络日志
exports.useLog = function() {
    return log4js.connectLogger(log4js.getLogger('http'));
};

//运行日志
exports.logger = function() {
    return log4js.getLogger('runninglog');

};
//开发调试日志
exports.debuglog = function(){
  return log4js.getLogger('debuglog');

};
