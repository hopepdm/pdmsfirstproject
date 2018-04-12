/*
展示文物
 */

var container, camera, scene, renderer, android, dragRotateControls, lightList = {},
    light1, light2, light3, ambientLight;
var h1, h2, h3
var objScele = 1,
    geometrys, sigleObj;
var intensity;
var currentLight = 'light1'; //初始化为1号灯
var currentMat = 'color'; //初始化选中属性
function initScene(obj) {
    sigleObj = obj;
    var modelpath = obj.objurl;
    camera = new THREE.OrthographicCamera(-window.innerWidth * 0.5, window.innerWidth * 0.5, window.innerHeight * 0.5, -window.innerHeight * 0.5, sigleObj.near, sigleObj.far);
    camera.position.set(0, 0, 0);

    scene = new THREE.Scene();
    scene.add(camera);

    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var manager = new THREE.LoadingManager();
    manager.onLoad = function() {
        // $("#loaderdiv").hide();
    };

    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            // console.log(percentComplete);

            // $("#bar")[0].style.width = Math.round(percentComplete, 2) + "%";
            // $("#bar").html(Math.round(percentComplete, 2) + "%");
            // if (Math.round(percentComplete, 2) == 100) {
            //     $("#loaderdiv").hide();
            // }
        }
    }

    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(200, 200, 1000).normalize();


    var arrs = modelpath.split(".");
    if (arrs[1] == "js") {
        var binaryLoader = new THREE.BinaryLoader(manager);
        binaryLoader.setCrossOrigin('');
        binaryLoader.load(modelpath, addModelToScene);
    } else if (arrs[1] == "obj") {
        var s = arrs[0].lastIndexOf('/');
        var basePath = arrs[0].substring(0, s + 1);
        var modelName = arrs[0].substring(s + 1);

        var mtlLoader = new THREE.MTLLoader(manager);
        mtlLoader.setCrossOrigin('');
        mtlLoader.setPath(basePath);
        mtlLoader.load(modelName + '.mtl', function(materials) {
            materials.preload();
            var objLoader = new THREE.OBJLoader(manager);
            objLoader.setMaterials(materials);
            objLoader.setPath(basePath);
            objLoader.load(modelName + '.obj', function(object) {
                if (sigleObj.modelRotation) {
                    object.rotation.x = sigleObj.modelRotation.x;
                    object.rotation.y = sigleObj.modelRotation.y;
                    object.rotation.z = sigleObj.modelRotation.z;
                }
                if (sigleObj.modelPosition) {
                    object.position.x = sigleObj.modelPosition.x;
                    object.position.y = sigleObj.modelPosition.y;
                    object.position.z = sigleObj.modelPosition.z;
                }
                scene.add(object);
                Tool.setModel(object);
                android = object;
                // console.log(android);
                //geometrys = object.children[0].geometry;
                //geometrys.computeBoundingBox();
                adjustSceneParam();
                onWindowResize();
            }, onProgress);
        });
    }

    var controls = {
        灯光亮度: 50,
        灯光颜色: '#ff0000',
        背景: '#ff0000',
        材质固有色: '#ff0000',
        反射率: 0.5,
        光滑度: 0.5,
        透明度: 0.5,
        DoubleSide: false,
        zoomLevel: 1,
        相机位置: camera.position,
        复位: false
    }

    var cameraDistance = 4;
    var frontVisualAngle = new THREE.Vector3(0, 0, cameraDistance);
    var backVisualAngle = new THREE.Vector3(0, 0, -cameraDistance);
    var leftVisualAngle = new THREE.Vector3(-cameraDistance, 0, 0);
    var rightVisualAngle = new THREE.Vector3(cameraDistance, 0, 0);
    var upVisualAngle = new THREE.Vector3(0, cameraDistance, 0);
    var downVisualAngle = new THREE.Vector3(0, -cameraDistance, 0);
    var innerVisualAngle = new THREE.Vector3(0, 0, 0.1);


    //GUI控制界面
    var gui = new dat.GUI();
    gui.domElement.style = 'position: absolute; top: 62px; right: 5px;';
    var sceneFolder = gui.addFolder('场景属性');
    sceneFolder.open();
    sceneFolder.add(controls, '灯光亮度', 1, 100).step(1);
    sceneFolder.addColor(controls, '灯光颜色');
    sceneFolder.add(controls, '背景', {红皂: '#4f5355', 碧玉石: '#569597', 玉石蓝: '#507883'})

    var materialsFolder = gui.addFolder('材质属性');
    materialsFolder.open();
    materialsFolder.addColor(controls, '材质固有色');
    materialsFolder.add(controls, '反射率', 0, 1).step(0.01);
    materialsFolder.add(controls, '光滑度', 0, 1).step(0.01);
    materialsFolder.add(controls, '透明度', 0, 1).step(0.01);
    materialsFolder.add(controls, 'DoubleSide');

    var positionFolder = gui.addFolder('位置属性');
    positionFolder.open();
    positionFolder.add(controls, 'zoomLevel',[1, 2, 3]);
    positionFolder.add(controls, '相机位置', {
        前: frontVisualAngle,
        后: backVisualAngle,
        左: leftVisualAngle,
        右: rightVisualAngle,
        上: upVisualAngle,
        下: downVisualAngle,
        inner: innerVisualAngle
    });
    positionFolder.add(controls, '复位');


    // renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true
    });
    renderer.setClearColor(0x4f5355, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize($('.viewer').width(), $('.viewer').height());
    // console.log(scene);

    document.getElementsByClassName('viewer')[0].appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    animate();

}

function addModelToScene(geometry, materials) {
    var material = new THREE.MultiMaterial(materials);
    android = new THREE.Mesh(geometry, material);
    if (sigleObj.modelRotation) {
        android.rotation = sigleObj.modelRotation;
    }
    if (sigleObj.modelPosition) {
        android.position = sigleObj.modelPosition;
    }
    scene.add(android);

    //geometrys = geometry;
    //geometrys.computeBoundingBox();

    onWindowResize();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    dragRotateControls = new THREE.DragRotateControls(camera, android);
}

function adjustSceneParam() {
    var box3 = new THREE.Box3().setFromObject(android);
    var size = box3.size();

    var width = size.x;
    var posi = 0.8;
    var height = (window.innerHeight / window.innerWidth) * width;
    if (height < size.y) {
        height = size.y;
        width = (window.innerWidth / window.innerHeight) * height;
    }
    var hw = height > width ? height : width;
    objScele = hw / 70;
    camera.left = -width * posi;
    camera.right = width * posi;
    camera.top = height * posi;
    camera.bottom = -height * posi;
    camera.position.set(0, 0, 1.75 * hw);

    //根据尺寸调整灯光位置
    // light1 = new THREE.SpotLight(0xffffff);
    light1 = new THREE.DirectionalLight(0xffffff)
    light1.position.set(-25, 25, -12.5);
    light1.target = android;
    // light1.distance = 10;
    light1.angle = 0.6;
    light1.intensity = 1;
    h1 = new THREE.DirectionalLightHelper(light1, 5);
    scene.add(h1);
    scene.add(light1)
    lightList.light1 = light1;

    // light2 = new THREE.SpotLight(0xff0000);
    light2 = new THREE.DirectionalLight(0xffffff)

    light2.position.set(25, -25, 5);
    light2.target = android
    light2.angle = 0.6;
    light2.intensity = 1;
    h2 = new THREE.DirectionalLightHelper(light2, 5);
    scene.add(h2);
    scene.add(light2)
    lightList.light2 = light2;


    // light3 = new THREE.SpotLight(0xf0f500);
    light3 = new THREE.DirectionalLight(0xffffff)
    h3 = new THREE.DirectionalLightHelper(light3, 5);
    scene.add(h3);
    light3.position.set(0, -25, 12.5);
    light3.target = android;
    light3.angle = 0.6;
    light3.intensity = 1;
    // h3 = new THREE.SpotLightHelper(light3);
    // scene.add(h3)
    scene.add(light3)
    lightList.light3 = light3;


    ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight)



    //
    // currentLight = 'light1';



}



function animate() {
    //页面初始化时，lightControl.geyPosition 返回false;

    if (lightControl.getPosition(Tool.getCurrentLight())) {
        lightList[Tool.getCurrentLight()].position.copy(lightControl.getPosition(Tool.getCurrentLight()));
    }
    requestAnimationFrame(animate);
    if (dragRotateControls) dragRotateControls.update();
    renderer.render(scene, camera);
    if (h1) h1.update()
    if (h2) h2.update()
    if (h3) h3.update()

}


// /*********************************工具栏*******************************/
// // todo:这里太多事件  需要利用冒泡把事件注册在父元素上
//
// $('.viewer canvas').attr('width', $('.viewer').width());
// $('.viewer canvas').attr('height', $('.viewer').height());
//
// var selector = '[data-rangeslider]';
// var $inputRange = $(selector);
// $inputRange.rangeslider({
//     polyfill: false
// });
//
//
//
//
//
// //灯光控制器开关
// //todo:两个场景的位置映射有问题
// function showLightControl() {
//     var visiable = $('.light_set').css('display') == 'block';
//     // console.log(visiable);
//     if (visiable) {
//         var lights = getSceneAttr(scene);
//         lightControl.create(lights);
//     } else {
//         lightControl.dispose();
//     }
// }
//
//
// $('.menu_tag').click(function() {
//     $('.menu_wrap').show()
// })
// $('.menu_close').click(function() {
//     $(this).parent().parent().hide()
// })
// //这里暂时只能在每次打开菜单时渲染 因为菜单没打开时，元素相当于没有，
// //所有的事件注册会失败，无法实现旋转   (应该是这样的。。)
// //另一种情况是dom隐藏时宽高为0 旋转时获取的坐标不对
// $('[data-light]').click(function() {
//     $('.light_set').fadeToggle(function() {
//
//         showLightControl();
//     }).siblings().not('.menu_wrap').hide();
// })
// $('[data-material]').click(function() {
//     $('.material_set').fadeToggle(function() {
//         showLightControl();
//     }).siblings().not('.menu_wrap').hide();
//
// })
// $('[data-position]').click(function() {
//     $('.position_set').fadeToggle(function() {
//         showLightControl();
//     }).siblings().not('.menu_wrap').hide();
//
// })
// $('[data-other]').click(function() {
//     $('.other_set').fadeToggle(function() {
//         showLightControl();
//     }).siblings().not('.menu_wrap').hide();
//
// })
//
// /**
//  * 灯光属性的设置
//  */
//
// $('.light1').click(function() {
//     $(this).addClass('active');
//     $(this).siblings().removeClass('active');
//     lightControl.attachLight('light1');
//     currentLight = 'light1';
//     //改变灯 拾色器也要对应
//     $('#lightcol').colpickSetColor(lightList[currentLight].color.getHexString())
//
// })
//
// $('.light2').click(function() {
//     $(this).addClass('active')
//     $(this).siblings().removeClass('active')
//     lightControl.attachLight('light2');
//     currentLight = 'light2';
//     $('#lightcol').colpickSetColor(lightList[currentLight].color.getHexString())
// })
// $('.light3').click(function() {
//     $(this).addClass('active')
//     $(this).siblings().removeClass('active')
//     lightControl.attachLight('light3')
//     currentLight = 'light3';
//     $('#lightcol').colpickSetColor(lightList[currentLight].color.getHexString())
// })
//
// $('.light_intensity input[type="range"]').on('input', function() {
//     lightList[currentLight].intensity = lightControl.changeIntensity($(this).val())
// })
// //禁用这个灯（强度为0）
// $('.light_intensity label').click(function() {
//     var val = $('.light_intensity input[type="range"]').val()
//     if ($(this).hasClass('true')) {
//         $(this).removeClass('true').addClass('false')
//
//         lightList[currentLight].intensity = 0;
//         lightControl.changeIntensity(0)
//     } else {
//         $(this).removeClass('false').addClass('true')
//
//         lightList[currentLight].intensity = val;
//         lightControl.changeIntensity(val)
//     }
// })
// $('#lightcol').colpick({
//     flat: true,
//     layout: 'hex',
//     submit: 0,
//     color: 'ffffff',
//     onChange: function(hsb, hex, rgb, el, bySetColor) {
//         console.log(currentLight);
//         lightControl.changeColor('0x' + hex);
//         lightList[currentLight].color.setHex('0x' + hex);
//         // $('.lights .active').css('background-color','#'+hex);
//
//     }
// });
//
// /**
//  * 材质属性的设置
//  */
// /**
// 材质颜色：color:表示材质本身的颜色,ambient:材质环境色（被废弃）,specular:镜面反射色
// emissive:材质发射的色，不受其他色的影响，shininess:高光亮度，
// opacity:透明度 在transparent为true时才会起作用
//  */
//
// $('.color').click(function() {
//     $(this).addClass('active');
//     $(this).siblings().removeClass('active');
//     $('.material_color .tool_name').text('材质固有色');
//     currentMat = 'color'; //注意要先改变当前属性，在改变颜色
//     $('#matcol').colpickSetColor(getModelMatAttr(android, ['color']).color.getHexString());
//
//
// })
// $('.emissive').click(function() {
//     $(this).addClass('active');
//     $(this).siblings().removeClass('active');
//     $('.material_color .tool_name').text('材质反射色');
//     currentMat = 'emissive';
//     $('#matcol').colpickSetColor(getModelMatAttr(android, ['emissive']).emissive.getHexString())
//
// })
// $('.specular').click(function() {
//     $(this).addClass('active');
//     $(this).siblings().removeClass('active');
//     $('.material_color .tool_name').text('镜面反射色');
//     currentMat = 'specular';
//     $('#matcol').colpickSetColor(getModelMatAttr(android, ['specular']).specular.getHexString())
//
// })
// $('.material_opacity input[type="range"]').on('input', function() {
//
//     changeModelMat(android, 'opacity', $(this).val())
// })
// $('.material_specularity input[type="range"]').on('input', function() {
//     changeModelMat(android, 'shininess', $(this).val())
// })
//
// $('#matcol').colpick({
//     flat: true,
//     layout: 'hex',
//     submit: 0,
//     color: 'ffffff',
//     onChange: function(hsb, hex, rgb, el, bySetColor) {
//         console.log(currentMat);
//         $('.materials .active').css('background-color', '#' + hex);
//         changeModelMat(android, currentMat, new THREE.Color().setHex('0x' + hex))
//     }
// })
// /**
//  * [材质两种情况要分开处理
//  * 1. group->children->mesh->material->MeshPhongMaterial
//  * 2. group->children->mesh->material->MultiMaterial->materials->MeshPhongMaterial]
//  * 透明度需要在transparent为true时起作用
//  * @method changeModelMat
//  * @param  {[type]}            model [需要改变的模型]
//  * @param  {[type]}            type  [需要改变的属性]
//  * @param  {[type]}            val   [需要改变的值]
//  * @return {[type]}                  [description]
//  */
// function changeModelMat(model, type, val) {
//     if (!model) return;
//     var children = model.children;
//     var len = children.length;
//     for (var i = 0; i < len; i++) {
//         var mat = children[i].material;
//         var matType = mat.type; //material 的type值
//         if (matType == 'MeshPhongMaterial') {
//             if (type == 'opacity') mat.transparent = true;
//             mat[type] = val;
//         } else if (matType == 'MultiMaterial') {
//             var materials = mat.materials; //获取一个MultiMaterial的所有MeshPhongMaterial
//             for (var j = 0; j < materials.length; j++) {
//                 if (type == 'opacity') materials[j].transparent = true;
//                 materials[j][type] = val;
//             }
//         }
//     }
//
// }
// /**
//  * [getSceneAttr description]
//  * @method getSceneAttr
//  * @param  {[object]}     scene [场景对象]
//  * @return {[object]}           [返回所有的灯光信息(颜色、亮度、位置)]
//  */
//
// function getSceneAttr(scene) {
//     var children = scene.children;
//     var len = children.length;
//     var n = 1;
//     var attrs = {};
//     for (var i = 0; i < len; i++) {
//         if (children[i] instanceof THREE.DirectionalLight) {
//             var light = attrs['light' + n] = {};
//             light.color = children[i].color;
//             light.intensity = children[i].intensity;
//             light.position = children[i].position;
//             n++;
//         } else if (children[i] instanceof THREE.AmbientLight) {
//             attrs.ambientLight = {};
//             attrs.ambientLight.color = children[i].color;
//             attrs.ambientLight.intensity = children[i].intensity;
//         }
//     }
//
//     return attrs;
// }
// /**
//  * [getModelAttr 返回需要的材质属性值]
//  * @method getModelAttr
//  * @param  {[object]}     model [模型]
//  * @param  {[array]}      type  [需要得到的属性数组,为空时返回所有属性]
//  * @return {[object]}           [属性]
//  */
// function getModelMatAttr(model, type) {
//     var attr = {};
//     if (model instanceof THREE.Group) {
//         attr.matrix = model.matrix; //获取模型组的旋转矩阵
//         var mat = model.children[0].material; //获取材质属性，所有的材质属性都应该保持一致
//         var matType = mat.type;
//         if (matType == 'MeshPhongMaterial') {
//             attr.color = mat.color; //固有色
//             attr.specular = mat.specular; //高亮色
//             attr.emissive = mat.emissive; //材质反射色
//             attr.opacity = mat.opacity; //透明度
//             attr.shininess = mat.shininess; //高亮亮度
//         } else if (matType == 'MultiMaterial') {
//             mat = mat.materials[0];
//             attr.color = mat.color; //固有色
//             attr.specular = mat.specular; //高亮色
//             attr.emissive = mat.emissive; //材质反射色
//             attr.opacity = mat.opacity; //透明度
//             attr.shininess = mat.shininess; //高亮亮度
//         }
//
//     }
//     if (!type) return attr;
//     var obj = {};
//     for (var i = 0; i < type.length; i++) {
//         obj[type[i]] = attr[type[i]]
//     }
//     return obj;
// }

// 编辑文物页面
// todo:这里太多事件  需要利用冒泡把事件注册在父元素上

//发布确认操作
$(function() {
    $('.publish_file').on('click', function() {
        var id = $(this).attr('data-id');
        var $modal = $('.publish_confirm');
        var $content = $('.modal_content');
        var $close = $('.close');
        $($modal).slideDown(300, function() {
            $($content).animate({ 'opacity': '1' }, 800);
        });
        $($close).on('click', function() {
            $($modal).animate({ 'width': '0', 'opacity': '0' }, 500, function() {
                $(this).css({ 'width': '100%', 'display': 'none', 'opacity': '1' });
            });
        });
        $('.abort').on('click', function() {
            $.ajax({
                type: 'post',
                url: '/api/publish',
                data: {
                    id: id
                },
                //dataType: 'json',
                success: function() {
                    console.log('ok');
                },
                error: function() {
                    console.log('err');
                }
            });
        });
        $('.cancel').on('click', function() {
            $($modal).animate({ 'width': '0', 'opacity': '0' }, 500, function() {
                $(this).css({ 'width': '100%', 'display': 'none', 'opacity': '1' });
            })
        });

    })
})
