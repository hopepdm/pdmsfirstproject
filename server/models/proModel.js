var mongoose = require('mongoose');


var userSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    password: String,
    date: Date
});

var userModel = mongoose.model('user', userSchema);

var proSchema = new mongoose.Schema({
    proName: String,
    userName:String,
    proDescription: { type: String, default: '新项目' },
    proDate: Date,
    userId: String,
    publishedCount: { type: Number, default: 0 },
    culturalCount: { type: Number, default: 0 }
});

var proModel = mongoose.model('project', proSchema);

var culturalSchema = new mongoose.Schema({
    projectId: String,
    userName: String,
    proName: String,
    proDescription: { type: String, default: '新项目' },
    cultrualName: String,
    isPublish: { type: Boolean, default: false },
    pageTitle: { type: String, default: '三维文物展示' },
    pageName: { type: String, default: 'index'},
    fileExt: String,    //模型文件后缀
    fileName: String,   //模型文件名
    filePath: String,   //模型文件路径
    date: Date,
    zoomSpeed: { type: Number, default: 1.0 },
    rotateSpeed: { type: Number, default: 1.0 },
    culturalInfo: {
        position: {
            x: { type: Number, default: 0.0 },
            y: { type: Number, default: 0.0 },
            z: { type: Number, default: 0.0 }
        },
        rotation: {
            x: { type: Number, default: 0.0 },
            y: { type: Number, default: 0.0 },
            z: { type: Number, default: 0.0 }
        }
    },
    materialType: { type: String, default: 'MeshPhongMaterial'},
    intensity: { type: Number, default: 1 },
    lightColor: { type: Number, default: 0xFFFFFF },
    background: { type: String, default: '红皂' },
    diffuseColor: { type: Number, default: 0x959595 },
    specularColor: { type: Number, default: 0x000000 },
    opacity: { type: Number, default: 1 },
    shininess: { type: Number, default: 10 },
    wireframeState: { type:Boolean, default: false }
});
var culturalModel = mongoose.model('cultural', culturalSchema);

exports.userModel = userModel;
exports.proModel = proModel;
exports.culturalModel = culturalModel;