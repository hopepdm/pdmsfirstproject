var decompress = require('decompress');
var archiver = require('archiver');
var fs = require('fs');
var path = require('path');


module.exports = {
    /**
     * [compress description]
     * @method compress
     * @param  {[string]} options
     * {input 需要压缩的文件
     * output 压缩后的文件路径
     * name  压缩生成文件的名字
     * type:需要压缩的文件类型String,Stream,File,Directory
     * }
     * @return {[type]}         [description]
     */
    compress: function(options, cb) {
        var input = options.input;
        var output = options.output;
        var name = options.name;
        var type = options.type;
        if (!type) {
            var err = new Error("type is necessary");
            cb(err);
        }
        var outputs = fs.createWriteStream(output);
        var archive = archiver('zip', {
            store: true
        });
        archive.on('error', function(err) {
            return cb(err);
        });
        archive.pipe(outputs);
        switch (type) {
            case 'Stream':
                archive.append(input, {
                    name: name
                });
                break;
            case 'File':
                archive.file(input, {
                    name: name
                });
                break;
            case 'Directory':
                archive.directory(input);
                break;
            case "String":
                archive.append(input, {
                    name: name
                });
        }
        archive.finalize();
    },
    /**
     * [decompress description]
     * @method decompress
     * @param  {[type]}   options [description]
     * @param  {Function} cb      [返回所有的文件数组]
     * @return {[Function]}           [cb]
     */
    decompress: function(options, cb) {
        var input = options.input;
        var output = options.output;
        decompress(input, output).then(function(files) {
            var culturalList = [];
            // console.log(files);
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var cultural = {};
                if (path.extname(file.path) == '.obj') { //获取文件后缀名
                    cultural.fileName = path.basename(file.path, '.obj');
                    cultural.pageName = path.basename(file.path, '.obj');
                    cultural.fileExt = '.obj';
                    cultural.filePath = file.path;

                } else if (path.extname(file.path) == '.js') {
                    cultural.fileName = path.basename(file.path, '.js');
                    cultural.pageName = path.basename(file.path, '.js');
                    cultural.fileExt = '.js';
                    cultural.filePath = file.path;
                }

                if (cultural.fileName) culturalList.push(cultural);
            }
            return cb(culturalList);
        });
    }

};
