/**
 * 修改页面展示及控制面板
 *
 */
var scene,
    camera,
    cameraDistance = 3,
    objScele,
    renderer,
    android,
    geometrys,
    singleObj,
    dragRotateControls,

    //光源参数
    ambientLight,
    lightColor,
    lightIntensity,
    intensity,
    light1,
    light2,
    light3,
    light4,
    light5,
    light6,

    //面板参数
    materialColor,
    specularColor,
    materialShininess,
    materialOpacity,
    roamBoolean = false,
    isWireFrame,
    backGroundColor,
    bgColor,
    controls,
    cameraPosition;

    backGroundColor = {
        '红皂': 0x4f5355,
        '碧玉石': 0x569597,
        '玉石蓝': 0x507883
    };

function initScene(obj) {
    console.log('DCT-culturalplaftform-beta:1.0.1');
    singleObj = obj;
    bgColor = singleObj.background || '红皂';
    materialColor = singleObj.diffuseColor;
    specularColor = singleObj.specularColor;
    isWireFrame = singleObj.wireframeState;
    materialOpacity = singleObj.diffuseColor;
    materialShininess = singleObj.shininess;
    
    var modelPath = singleObj.objurl;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, singleObj.near, singleObj.far);
    //camera.position.set(0, 0, 0.1);
    //camera.lookAt(new THREE.Vector3(0, 0, 0));
    //camera.up.set(0, 1, 0);
    scene.add(camera);

    //添加模型
    universalLoader(singleObj.objurl, singleObj.fileName, function(object){
                android = object;

                android.rotation.x = singleObj.modelRotation.x || 0.0;
                android.rotation.y = singleObj.modelRotation.y || 0.0;
                android.rotation.z = singleObj.modelRotation.z || 0.0;

                android.position.x = 0.0;
                android.position.y = 0.0;
                android.position.z = 0.0;

                // for (var i = 0; i < android.children.length; i++) {
                //     if (android.children[i].material.type == 'MultiMaterial') {
                //         for (var j = 0; j < android.children[i].material.materials.length; j++) {
                //             android.children[i].material.materials[j].color.setHex(singleObj.diffuseColor);
                //             android.children[i].material.materials[j].specular.setHex(singleObj.specularColor);
                //             android.children[i].material.materials[j].shininess = singleObj.shininess;
                //             android.children[i].material.materials[j].opacity = singleObj.opacity;

                //             android.children[i].material.materials[j].wireframe = singleObj.wireframeState;
                //             if (android.children[i].material.materials[j].wireframe) {
                //                 android.children[i].material.materials[j].emissive.setHex(0xFFFFFF);
                //             } else {
                //                 android.children[i].material.materials[j].emissive.setHex(0x000000);
                //             }
                //         }
                //     } else {
                //         android.children[i].material.color.setHex(singleObj.diffuseColor);
                //         android.children[i].material.specular.setHex(singleObj.specularColor);
                //         android.children[i].material.shininess = singleObj.shininess;
                //         android.children[i].material.opacity = singleObj.opacity;

                //         android.children[i].material.wireframe = singleObj.wireframeState;
                //         if (android.children[i].material.wireframe) {
                //             android.children[i].material.emissive.setHex(0xFFFFFF);
                //         } else {
                //             android.children[i].material.emissive.setHex(0x000000);
                //         }
                //     }
                // }
                  //设置器物初始状态
                  object.traverse( function ( ele ) {

                    if ( ele instanceof THREE.Mesh ) {
                        if ( ele.material.type == 'MultiMaterial' ) {
                            ele.material.materials.map( function ( obj, index ) {
                                obj.color.setHex( singleObj.diffuseColor );
                                obj.specular.setHex( singleObj.specularColor );
                                obj.opacity = singleObj.opacity;
                                obj.shininess = singleObj.shininess;
                                obj.wireframe = singleObj.wireframeState;
                                obj.shading = THREE.Smoothshading;
                                obj.needUpdate = true;
                                if ( singleObj.wireframeState ) {
                                    obj.emissive.setHex( 0xeeeeee );
                                    obj.wireframe = true;
                                } else {
                                    obj.emissive.setHex( 0x000000 );
                                    obj.wireframe = false;
                                }
                            } );
                        } else {
                            ele.material.color.setHex( singleObj.diffuseColor );
                            ele.material.specular.setHex( singleObj.specularColor );
                            ele.material.opacity = singleObj.opacity;
                            ele.material.shininess = singleObj.shininess;
                            ele.material.wireframe = singleObj.wireframeState;
                            ele.material.shading = THREE.Smoothshading;
                            ele.material.needUpdate = true;
                            if ( singleObj.wireframeState ) {
                                ele.material.emissive.setHex( 0xeeeeee );
                                ele.material.wireframe = true;
                            } else {
                                ele.material.emissive.setHex( 0x000000 );
                                ele.material.wireframe = false;
                            }
            
                        }

                    }


                } );
               
            
                

                scene.add(android);


                adjustSceneParam();
                dragRotateControls = new THREE.OrbitControls( camera, renderer.domElement, android );

                dragRotateControls.enablePan = false;
                dragRotateControls.zoomSpeed = singleObj.zoomSpeed;
                dragRotateControls.rotateSpeed = singleObj.rotateSpeed;
                
                // 辅助线
                // var helperGrid = new THREE.GridHelper( 1,0.2, 0xFF0000, 0xFFFFFF );
                // helperGrid.position.set(0, -1, 0);
                // scene.add( helperGrid );

                // var arrowHelper = new THREE.AxisHelper(1);
                // scene.add( arrowHelper );
                //
                // 控制面板
                buildGui(singleObj);

                if(singleObj.view) {
                    $('.dg').hide();
                }
         

                onWindowResize();
    }, onProgress);

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
    }; //onProgress end



    // renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        logarithmicDepthBuffer: true,
        preserveDrawingBuffer: true
    });
    renderer.setClearColor(backGroundColor[bgColor], 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // console.log(scene);

    document.querySelector('.viewer').appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    animate();

} // initScene end

function addModelToScene(geometry, materials) {
    var material = new THREE.MultiMaterial(materials);
    android = new THREE.Mesh(geometry, material);

    android.rotation.x = singleObj.modelRotation.x || 0;
    android.rotation.y = singleObj.modelRotation.y || 0;
    android.rotation.z = singleObj.modelRotation.z || 0;
    android.position = singleObj.modelPosition || new THREE.Vector3(0, 0, 0);

    scene.add(android);

    //geometrys = geometry;
    //geometrys.computeBoundingBox();
    adjustSceneParam();
    buildGui();
   
    onWindowResize();
} // addModelToScene end

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //dragRotateControls = new THREE.DragRotateControls(camera, android, renderer.domElement);

} // onWindowResize end

function adjustSceneParam() {

    var box3 = new THREE.Box3().setFromObject( android );
    var size = box3.getSize();
    var width = size.x;

    hw = Math.max( size.x, size.y, size.z );

    camera.position.set(0, 0.5 * hw, 1.75 * hw);

    // 光源
    if (singleObj.ambient) {
        ambientLight = new THREE.AmbientLight(0xffffff);
        scene.add(ambientLight);
    }

    lightColor = singleObj.lightSet.color;
    lightIntensity = singleObj.lightSet.intensity;

    light1 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light1.position.set(hw, hw, hw);
    light1.target = android;
    // var h1 = new THREE.DirectionalLightHelper(light1, 0.5);
    // scene.add(h1)
    camera.add(light1);

    // light2 = new THREE.DirectionalLight(lightColor, lightIntensity);
    // light2.position.set(0, 0, -cameraDistance);
    // light2.target = android;
    // scene.add(light2);

    // light3 = new THREE.DirectionalLight(lightColor, lightIntensity);
    // light3.position.set(0, cameraDistance, 0);
    // light3.target = android;
    // scene.add(light3);

    // light4 = new THREE.DirectionalLight(lightColor, lightIntensity);
    // light4.position.set(0, -cameraDistance, 0);
    // light4.target = android;
    // scene.add(light4);

    // light5 = new THREE.DirectionalLight(lightColor, lightIntensity);
    // light5.position.set(cameraDistance, 0, 0);
    // light5.target = android;
    // scene.add(light5);

    // light6 = new THREE.DirectionalLight(lightColor, lightIntensity);
    // light6.position.set(-cameraDistance, 0, 0);
    // light6.target = android;

    // scene.add(light6);


} // adjustSceneParam end

function animate() {
    renderer.render(scene, camera);
    // if (roamBoolean) {
        
    //     window.open(document.location.origin + '/preview/' + document.location.pathname.split('\/')[2]);
    //     roamBoolean = false;
    // }

    if (dragRotateControls) dragRotateControls.update();
    requestAnimationFrame(animate);


}


/**
 * 常用模型加载器封装
 * @argument urls string 模型路径
 * @argument onLoad function 模型处理函数
 */
function universalLoader(urls, fileName, onLoad, onProgress, onError) {
    if( typeof(urls) === 'string' ) {
        var url = urls;
        var path = urls.split('/');
        path.pop();
        path = path.join('/');
        console.log(path)

        //load per type
        if( (fileName + '.obj').match(/\.obj$/i) ) {
            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath(path + '/');
            mtlLoader.load(fileName+'.mtl', function(materials) {
                materials.preload();

                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.setPath(path +'/');
                objLoader.load(fileName + '.obj', function( object) {
                    onLoad(object);
                }, onProgress, onError );
            });
        } else if((fileName + '.js').match(/\.js$/i) ) {
            var loadr = new THREE.JSONLoader();
            loader.load(url, function(geometry, materials) {
                var material;
                if(materials.length > 1) {
                    material = new THREE.MeshFaceMaterial(materials);
                } else {
                    material = materials[0];
                }
                var mesh = new THREE.Mesh(geometry, material)
                onLoad(mesh);
            }, onProgress, onError );
        }

    } else {
        console.log('路径错误');
    }
   
}

/**
 * 控制面板
 * @return {[type]} [description]
 */
function buildGui(singleObj) {


    var frontVisualAngle = new THREE.Vector3(0, 0, cameraDistance);
    var backVisualAngle = new THREE.Vector3(0, 0, -cameraDistance);
    var leftVisualAngle = new THREE.Vector3(-cameraDistance, 0, 0);
    var rightVisualAngle = new THREE.Vector3(cameraDistance, 0, 0);
    var upVisualAngle = new THREE.Vector3(0, cameraDistance, 0);
    var downVisualAngle = new THREE.Vector3(0, -cameraDistance, 0);
    var innerVisualAngle = new THREE.Vector3(0, 0, 0.1);

    cameraPosition = {
        前: frontVisualAngle,
        后: backVisualAngle,
        左: leftVisualAngle,
        右: rightVisualAngle,
        上: upVisualAngle,
        下: downVisualAngle,
        inner: innerVisualAngle
    };
    //改变透明度的前提需要 transparent 值为 true
    for (var i = 0; i < android.children.length; i++) {
        if (android.children[i].material.type == 'MultiMaterial') {
            for (var j = 0; j < android.children[i].material.materials.length; j++) {
                android.children[i].material.materials[j].transparent = true;
            }
        } else {
            android.children[i].material.transparent = true;
        }
    }

    // //判断材质类型并获取初始值
    // if (android.children[0].material.type == 'MultiMaterial') {
    //     materialColor = android.children[0].material.materials[0].color;
    //     specularColor = android.children[0].material.materials[0].specular;
    //     materialShininess = android.children[0].material.materials[0].shininess;
    //     materialOpacity = android.children[0].material.materials[0].opacity;


    // } else {
    //     materialColor = android.children[0].material.color;
    //     specularColor = android.children[0].material.specular;
    //     materialShininess = android.children[0].material.shininess;
    //     materialOpacity = android.children[0].material.opacity;
    // }

    controls = {
        '灯光亮度': singleObj.lightSet.intensity,
        '灯光颜色': singleObj.lightSet.color,
        '背景': singleObj.background,
        '材质固有色': singleObj.diffuseColor,
        '高亮色': singleObj.specularColor,
        '光滑度': singleObj.shininess,
        '透明度': singleObj.opacity,
        '线框显示': singleObj.wireframeState,
        '缩放速度': singleObj.zoomSpeed,
        '旋转速度': singleObj.rotateSpeed,
        '预览': function() {
            roamBoolean = !roamBoolean;
            //漫游的逻辑写在 animate 中
            if ( roamBoolean ) {
                $('.dg').fadeOut();
                $('.header').fadeOut();
                document.addEventListener('keydown', function(event){
                    event = event || window.event;
                    if(event.keyCode === 81) {
                        $('.dg').fadeIn();
                        $('.header').fadeIn();
                        roamBoolean = !roamBoolean;
                    }
                })
            }

        },
        '保存': function () {
            //保存当前配置并截取当前画布的图片保存
            //save json

            //save base64
            var str = document.querySelector('canvas').toDataURL('image/png', 0.5).replace('data:image/png;base64,', '');
            var uid = document.location.pathname.split('\/')[2];
            $.ajax({
                type: 'post',
                url: '/re/saveJson',
                data: {
                    id: uid,
                    base64: str,
                    rotateSpeed: singleObj.rotateSpeed,
                    zoomSpeed: singleObj.zoomSpeed,
                    modelPosition: {
                        x: camera.position.x,
                        y: camera.position.y,
                        z: camera.position.z
                    },
                    modelRotation: {
                        x: android.rotation.x,
                        y: android.rotation.y,
                        z: android.rotation.z
                    },
                    lightSet: {
                        intensity: light1.intensity, 
                        color: light1.color.getHex()
                    },
                    wireframeState: isWireFrame,
                    opacity: materialOpacity,
                    shininess: materialShininess,
                    diffuseColor: materialColor,
                    specularColor: specularColor,
                    background: bgColor
                },
                success: function() {
                    alert('保存成功');
                },
                error: function() {
                    alert('保存失败');
                }
            })

        },
        reSet: function() {
            console.log('1');
            android.rotation.x = singleObj.modelRotation.x || 0;
            android.rotation.y = singleObj.modelRotation.y || 0;
            android.rotation.z = singleObj.modelRotation.z || 0;
            android.position.x = singleObj.modelPosition.x || 0;
            android.position.y = singleObj.modelPosition.y || 0;
            android.position.z = singleObj.modelPosition.z || 0;

        },
        publish: function() {
            var $modal = $('.publish_confirm');
            var $abort = $('.publish_confirm .abort');
            var $cancel = $('.publish_confirm .cancel');
            var $close = $('.publish_confirm .close');
            var uid = $('.confirm_name').attr('data-id');
            console.log(uid);
            $modal.slideDown(300, function() {
                $('.modal_content').animate({
                    'opacity': '1'
                }, 800);
            });

            $abort.on('click', function() {
                $.ajax({
                    type: 'post',
                    url: '/re/publish',
                    data: {
                        id: uid

                    },
                    //dataType: 'json',
                    success: function() {
                        alert('发布成功');
                    },
                    error: function() {
                        console.log('发布失败');
                    }
                });
                $modal.animate({
                    'width': '0',
                    'opacity': '0'
                }, 500, function() {
                    $(this).css({
                        'width': '100%',
                        'display': 'none',
                        'opacity': '1'
                    });
                });
                //window.location.reload();
            });

            $cancel.on('click', function() {
                $modal.animate({
                    'width': '0',
                    'opacity': '0'
                }, 500, function() {
                    $(this).css({
                        'width': '100%',
                        'display': 'none',
                        'opacity': '1'
                    });
                });
            });

            $close.on('click', function() {
                $modal.animate({
                    'width': '0',
                    'opacity': '0'
                }, 500, function() {
                    $(this).css({
                        'width': '100%',
                        'display': 'none',
                        'opacity': '1'
                    });
                });
            });
        }
    };


    //GUI控制界面
    var gui = new dat.GUI();
    gui.domElement.style = 'position: absolute; top: 62px; left: 4px;';
    var sceneFolder = gui.addFolder('场景属性');
    sceneFolder.open();
    sceneFolder.add(controls, '灯光亮度', 0, 5).step(0.1).onChange(function(val) {
        light1.intensity = val;
        // light2.intensity = val;
        // light3.intensity = val;
        // light4.intensity = val;
        // light5.intensity = val;
        // light6.intensity = val;


    });
    sceneFolder.addColor(controls, '灯光颜色').onChange(function(val) {
        light1.color.setHex(val);
        // light2.color.setHex(val);
        // light3.color.setHex(val);
        // light4.color.setHex(val);
        // light5.color.setHex(val);
        // light6.color.setHex(val);
    });
    sceneFolder.add(controls, '背景', Object.keys(backGroundColor)).onChange(function(val) {
        renderer.setClearColor(backGroundColor[val]);
        bgColor = val;
    });

    var materialsFolder = gui.addFolder('材质属性');
    materialsFolder.open();
    materialsFolder.addColor(controls, '材质固有色').onChange(function(val) {
        for (var i = 0; i < android.children.length; i++) {
            if (android.children[i].material.type == 'MultiMaterial') {
                for (var j = 0; j < android.children[i].material.materials.length; j++) {
                    android.children[i].material.materials[j].color.setHex(val);
                }
            } else {
                android.children[i].material.color.setHex(val);
            }
        }
        materialColor = val;
    });
    materialsFolder.addColor(controls, '高亮色').onChange(function(val) {
        for (var i = 0; i < android.children.length; i++) {
            if (android.children[i].material.type == 'MultiMaterial') {
                for (var j = 0; j < android.children[i].material.materials.length; j++) {
                    android.children[i].material.materials[j].specular.setHex(val);
                }
            } else {
                android.children[i].material.specular.setHex(val);
            }
        }
        specularColor = val;
    });
    materialsFolder.add(controls, '光滑度', 1, 100).step(1).onChange(function(val) {

        for (var i = 0; i < android.children.length; i++) {
            if (android.children[i].material.type == 'MultiMaterial') {
                for (var j = 0; j < android.children[i].material.materials.length; j++) {
                    android.children[i].material.materials[j].shininess = val;
                }
            } else {
                android.children[i].material.shininess = val;
            }
        }
        materialShininess = val;

    });
    materialsFolder.add(controls, '透明度', 0, 1).step(0.01).onChange(function(val) {
        for (var i = 0; i < android.children.length; i++) {
            if (android.children[i].material.type == 'MultiMaterial') {
                for (var j = 0; j < android.children[i].material.materials.length; j++) {
                    android.children[i].material.materials[j].opacity = val;
                }
            } else {
                android.children[i].material.opacity = val;
            }
        }
        materialOpacity = val;

    });
    materialsFolder.add(controls, '线框显示').onChange(function(val) {
        for (var i = 0; i < android.children.length; i++) {
            if (android.children[i].material.type == 'MultiMaterial') {
                for (var j = 0; j < android.children[i].material.materials.length; j++) {
                    android.children[i].material.materials[j].wireframe = val;
                    if (android.children[i].material.materials[j].wireframe) {
                        android.children[i].material.materials[j].emissive.setHex(0xFFFFFF);
                    } else {
                        android.children[i].material.materials[j].emissive.setHex(0x000000);
                    }
                }
            } else {
                android.children[i].material.wireframe = val;
                if (android.children[i].material.wireframe) {
                    android.children[i].material.emissive.setHex(0xFFFFFF);
                } else {
                    android.children[i].material.emissive.setHex(0x000000);
                }
            }
        }
        isWireFrame = val;

    });

    var positionFolder = gui.addFolder('位置属性');
    positionFolder.open();
    positionFolder.add(controls, '缩放速度', 0.2, 2.0).step(0.01).onChange(function(val) {
        dragRotateControls.zoomSpeed = val;
    
    });
    positionFolder.add(controls, '旋转速度', 0.1, 2.0).step(0.01).onChange(function(val) {
        dragRotateControls.rotateSpeed = val;
    });
    positionFolder.add(controls, '预览');
    positionFolder.add( controls, '保存');
    positionFolder.add(controls, 'reSet').name('复位');
    gui.add(controls, 'publish').name('发布');
}