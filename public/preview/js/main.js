/**
 * Created by Hope_pdm / Huang xianglong
 * 本代码适用于单器物展示，可以自定义背景和load界面及控制界面
 * 
 */
var container, camera, scene, renderer, android, dragRotateControls, aspect;

var sigleObj, autoRotate = false;

var isOuter = true,
    hw;

var utilityStats = {
    version: '1.0.1',
    openLoding: false, //开启加载界面
    openMenu: false, //开启控制界面
};

/**
 * 检测是否是移动端
 * 
 * @returns 
 */
function isMobile() {
    return ( navigator.userAgent.match( /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i ) );
}


/**
 * 解析obj模型文件路径，返回一个对象，包含该模型的路径，后缀，文件名等
 * 
 * @param {any} obj 
 * @returns 
 */
function pathParser( obj ) {
    var modelpath = obj.objurl;
    var arrs = modelpath.split( "." );
    var ext = arrs[ 1 ];
    var s = arrs[ 0 ].lastIndexOf( '/' );
    var basePath = arrs[ 0 ].substring( 0, s + 1 );
    var modelName = arrs[ 0 ].substring( s + 1 );

    return {
        modelpath: modelpath,
        ext: ext,
        basePath: basePath,
        modelName: modelName
    };
}

/**
 * 根据文件名判断文物类型
 * 洞窟、配殿、器物
 * @param {any} obj
 *  
 */
function checkType( obj ) {
    var fileName = obj.fileName.split( '' );
    console.log( fileName );
    fileName.splice( 0, 1 );
    if ( fileName.join( '' ) >= 43 ) {
        isOuter = false;
    } else {
        isOuter = true;
    }
}

/**
 * 主函数，生成场景
 * 
 * @param {any} obj 
 */
function initScene( obj ) {
    file = pathParser( obj );

    var backGroundColor = {
        '红皂': 0x4f5355,
        '碧玉石': 0x569597,
        '玉石蓝': 0x507883
    };
    // checkType( obj ); //通过检测文件名判断相机位置，里/外
    sigleObj = obj;
    var modelpath = file.modelpath;
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, sigleObj.near, sigleObj.far );
    //camera.position.z = 2;
    scene = new THREE.Scene();

    scene.add(camera);

    var manager = new THREE.LoadingManager();
    // manager.onLoad = function() {
    //   $("#loaderdiv").hide();
    // };

    //异步回调进程函数，表示加载进程及后续操作
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            if ( utilityStats.openLoding ) {
                $( ".loading" ).show();
            }
            var percentComplete = xhr.loaded / xhr.total * 100;

            var num = 0.01 * percentComplete;

            $( "#num" ).css( "left", num * 200 - 21 );
            $( "#num" ).html( Math.round( percentComplete, 2 ) + "%" );
            $( "#left" ).css( "left", ( num - 1 ) * 200 );
            if ( Math.round( percentComplete, 2 ) == 100 ) {
                if ( utilityStats.openMenu ) {
                    $( '.autoplay' ).show();
                    $( '.tool' ).show();
                }

                if ( utilityStats.openLoding ) {
                    $( ".loading" ).hide();
                }
            }
        }
    };



    //加载模型
    if ( file.ext === 'js' ) {
        var binaryLoader = new THREE.BinaryLoader( manager );
        binaryLoader.setCrossOrigin( '' );
        binaryLoader.load( modelpath, addModelToScene );
    } else if ( file.ext === "obj" ) {

        var basePath = file.basePath;
        var modelName = file.modelName;

        var mtlLoader = new THREE.MTLLoader( manager );
        mtlLoader.setCrossOrigin( '' );
        mtlLoader.setPath( basePath );
        mtlLoader.load( modelName + '.mtl', function ( materials ) {
            materials.preload();
            var objLoader = new THREE.OBJLoader( manager );
            objLoader.setMaterials( materials );
            objLoader.setPath( basePath );
            objLoader.load( modelName + '.obj', function ( object ) {
                if ( sigleObj.modelRotation ) {
                    object.rotation.x = sigleObj.modelRotation.x;
                    object.rotation.y = sigleObj.modelRotation.y;
                    object.rotation.z = sigleObj.modelRotation.z;
                }
                if ( sigleObj.modelPosition ) {
                    object.position.x = sigleObj.modelPosition.x;
                    object.position.y = sigleObj.modelPosition.y;
                    object.position.z = sigleObj.modelPosition.z;
                }
                object.position.set( 0, 0, 0 );

                //设置器物初始状态
                object.traverse( function ( ele ) {

                    if ( ele instanceof THREE.Mesh ) {
                        if ( ele.material.type == 'MultiMaterial' ) {
                            ele.material.materials.map( function ( obj, index ) {
                                obj.color.setHex( sigleObj.diffuseColor );
                                obj.specular.setHex( sigleObj.specularColor );
                                obj.opacity = sigleObj.opacity;
                                obj.shininess = sigleObj.shininess;
                                obj.wireframe = sigleObj.wireframeState;
                                obj.shading = THREE.Smoothshading;
                                obj.needUpdate = true;
                                if ( sigleObj.wireframeState ) {
                                    obj.emissive.setHex( 0xeeeeee );
                                    obj.wireframe = true;
                                }
                            } );
                        } else {
                            ele.material.color.setHex( sigleObj.diffuseColor );
                            ele.material.specular.setHex( sigleObj.specularColor );
                            ele.material.opacity = sigleObj.opacity;
                            ele.material.shininess = sigleObj.shininess;
                            ele.material.wireframe = sigleObj.wireframeState;
                            ele.material.shading = THREE.Smoothshading;
                            ele.material.needUpdate = true;
                            if ( sigleObj.wireframeState ) {
                                ele.material.emissive.setHex( 0xeeeeee );
                                ele.material.wireframe = true;
                            }
                            ele.material.shading = THREE.SmoothShading;
                            ele.material.needUpdate = true;
                        }

                    }


                } );

                scene.add( object );

                android = object;
                // var colorMaterial = 0xe3c5ac;
                // if ( android.children.length != 0 && android.children[ 0 ].material.hasOwnProperty( 'color' ) ) {
                //   android.children.forEach( function ( ele ) {
                //     ele.material.color.setHex( colorMaterial );
                //   } );
                // }

                adjustSceneParam();

                // //添加光照
                // addLight();

                dragRotateControls = new THREE.OrbitControls( camera, renderer.domElement, android );
                dragRotateControls.zoomSpeed = sigleObj.zoomSpeed;
                dragRotateControls.rotateSpeed = sigleObj.rotateSpeed;
                if ( isOuter ) {
                    dragRotateControls.enableZoom = true;
                    dragRotateControls.enablePan = true;
                    dragRotateControls.minDistance = hw / 2;
                    dragRotateControls.maxDistance = 3 * hw;
                } else {
                    dragRotateControls.enableZoom = false; //禁止缩放
                    dragRotateControls.enablePan = false;
                    dragRotateControls.minPolarAngle = Math.PI / 4; // 俯视角
                    dragRotateControls.maxPolarAngle = Math.PI; // 仰视角

                }
                // dragRotateControls.minDistance = 2;
                // dragRotateControls.maxDistance = 1;
                // dragRotateControls.minZoom = -2;
                // dragRotateControls.maxZoom = 2;
            }, onProgress );
        } );
    }

    // renderer
    renderer = new THREE.WebGLRenderer( {
        antialias: true,
        logarithmicDepthBuffer: true, //使用深度缓冲，避免z-fighting
        alpha: true
    } );
    renderer.setClearColor( backGroundColor[ sigleObj.background ], 1.0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    container = document.createElement( 'div' );
    document.body.appendChild( container );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
    animate();
}

/**
 * 将mesh对象加入场景中
 * 
 * @param {any} geometry 
 * @param {any} materials 
 */
function addModelToScene( geometry, materials ) {
    var material = new THREE.MultiMaterial( materials );
    android = new THREE.Mesh( geometry, material );
    if ( sigleObj.modelRotation ) {
        android.rotation = sigleObj.modelRotation;
    }
    if ( sigleObj.modelPosition ) {
        android.position = sigleObj.modelPosition;
    }
    scene.add( android );

    adjustSceneParam();
    dragRotateControls = new THREE.DragRotateControls( camera, android );
}

/**
 * 重置窗口
 * 
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

/**
 * 通过包围盒子判断模型的长宽高，自适应设置相机位置
 * 
 */
function adjustSceneParam() {

    var box3 = new THREE.Box3().setFromObject( android );
    var size = box3.getSize();
    var width = size.x;

    hw = Math.max( size.x, size.y, size.z );

    if ( isOuter ) {
        if(sigleObj.modelPosition.x == 0 ){
            camera.position.set( 0, 0.5 * hw, 1.75 * hw );
        } else {
            camera.position.set(sigleObj.modelPosition.x, sigleObj.modelPosition.y, sigleObj.modelPosition.z);
        }
        
    } else {
        camera.position.set( 0, 0, 0.1 );
    }

     // 光源
     if ( sigleObj.ambient ) {
        ambientLight = new THREE.AmbientLight( 0xffffff );
        scene.add( ambientLight );
    }

    lightColor = sigleObj.lightSet.color;
    lightIntensity = sigleObj.lightSet.intensity;

    light1 = new THREE.DirectionalLight( lightColor, lightIntensity );
    //light1.position.set( hw, hw, hw );
    light1.target = android;
    // var h1 = new THREE.DirectionalLightHelper(light1, 0.5);
    // scene.add(h1)
    camera.add( light1 );




}

function addLight() {
    // 光源
    if ( sigleObj.ambient ) {
        ambientLight = new THREE.AmbientLight( 0xffffff );
        scene.add( ambientLight );
    }

    lightColor = sigleObj.lightSet.color;
    lightIntensity = sigleObj.lightSet.intensity;

    light1 = new THREE.DirectionalLight( lightColor, lightIntensity );
    light1.position.set( hw, hw, hw );
    light1.target = android;
    // var h1 = new THREE.DirectionalLightHelper(light1, 0.5);
    // scene.add(h1)
    scene.add( light1 );

    // light2 = new THREE.DirectionalLight( lightColor, lightIntensity * 1.5 );
    // light2.position.set( -hw, hw, -hw );
    // light2.target = android;
    // // var h1 = new THREE.DirectionalLightHelper(light1, 0.5);
    // // scene.add(h1)
    // scene.add( light2 );

    // light2 = new THREE.DirectionalLight( lightColor, lightIntensity );
    // light2.position.set( 0, 0, -hw );
    // light2.target = android;
    // scene.add( light2 );

    // light3 = new THREE.DirectionalLight( lightColor, lightIntensity );
    // light3.position.set( 0, hw, 0 );
    // light3.target = android;
    // scene.add( light3 );

    // light4 = new THREE.DirectionalLight( lightColor, lightIntensity );
    // light4.position.set( 0, -hw, 0 );
    // light4.target = android;
    // scene.add( light4 );

    // light5 = new THREE.DirectionalLight( lightColor, lightIntensity );
    // light5.position.set( hw, 0, 0 );
    // light5.target = android;
    // scene.add( light5 );

    // light6 = new THREE.DirectionalLight( lightColor, lightIntensity );
    // light6.position.set( -hw, 0, 0 );
    // light6.target = android;

    // scene.add( light6 );

}

function animate() {

    requestAnimationFrame( animate );

    if ( dragRotateControls ) {
        dragRotateControls.update();
        if ( autoRotate ) {
            dragRotateControls.autoRotate1();
        }
    }

    render();
}

function render() {
    renderer.render( scene, camera );
}

var $lis = $( '.tool li' );
var $ul = $( '.tool ul' );
$( '.tool .switch' ).click( function ( event ) {
    event.preventDefault();
    event.stopPropagation();

    if ( $( this ).hasClass( 'close' ) ) {
        $( this ).removeClass( 'close' ).addClass( 'open' );
        $ul.show();
        $lis.each( function ( index, item ) {
            $( item ).animate( {
                bottom: ( index + 1 ) * 25 + index * 28 + 'px',
                opacity: 1
            }, 300, 'swing', function () {
                $( item ).animate( {
                    bottom: ( index + 1 ) * 20 + index * 28 + 'px'
                }, 200 );
            } );
        } );
    } else if ( $( this ).hasClass( 'open' ) ) {
        $( this ).removeClass( 'open' ).addClass( 'close' );
        $lis.each( function ( index, item ) {
            $( item ).animate( {
                bottom: '0px',
                opacity: 0
            }, 200, function () {
                $ul.hide();
            } );
        } );
    }

} );
$( '.tool .switch' ).on( 'touchstart', function ( event ) {
    event.preventDefault();
    event.stopPropagation();

    if ( $( this ).hasClass( 'close' ) ) {
        $( this ).removeClass( 'close' ).addClass( 'open' );
        $ul.show();
        $lis.each( function ( index, item ) {
            $( item ).animate( {
                bottom: ( index + 1 ) * 25 + index * 28 + 'px',
                opacity: 1
            }, 300, 'swing', function () {
                $( item ).animate( {
                    bottom: ( index + 1 ) * 20 + index * 28 + 'px'
                }, 200 );
            } );
        } );
    } else if ( $( this ).hasClass( 'open' ) ) {
        $( this ).removeClass( 'open' ).addClass( 'close' );
        $lis.each( function ( index, item ) {
            $( item ).animate( {
                bottom: '0px',
                opacity: 0
            }, 200, function () {
                $ul.hide();
            } );
        } );
    }

} );
$ul.on( 'click', function ( event ) {
    event.preventDefault();
    event.stopPropagation();
    dragRotateControls.reset();
    var name = $( event.target ).attr( 'name' );
    dragRotateControls.rotateTo( name );

    //console.log( $( event.target ).attr( 'name' ) );
} );
$ul.on( 'touchstart', function ( event ) {
    event.preventDefault();
    event.stopPropagation();
    dragRotateControls.reset();
    var name = $( event.target ).attr( 'name' );
    dragRotateControls.rotateTo( name );

    //console.log( $( event.target ).attr( 'name' ) );
} );
$( '#autoplay' ).on( 'click', function ( event ) {
    event.preventDefault();
    event.stopPropagation();
    if ( $( this ).hasClass( 'stop' ) ) {
        $( this ).removeClass( 'stop' ).addClass( 'play' );
        autoRotate = true;
    } else {
        $( this ).removeClass( 'play' ).addClass( 'stop' );
        autoRotate = false;
    }

} );
$( '#autoplay' ).on( 'touchstart', function ( event ) {
    event.preventDefault();
    event.stopPropagation();
    if ( $( this ).hasClass( 'stop' ) ) {
        $( this ).removeClass( 'stop' ).addClass( 'play' );
        autoRotate = true;
    } else {
        $( this ).removeClass( 'play' ).addClass( 'stop' );
        autoRotate = false;
    }

} );
//reset event
$( '.tool' )[ 0 ].addEventListener( 'mousemove', function ( event ) {
    event.preventDefault();
    event.stopPropagation();
} );
$( '.tool' )[ 0 ].addEventListener( 'touchmove', function ( event ) {
    event.preventDefault();
    event.stopPropagation();
} );
$( '#autoplay' )[ 0 ].addEventListener( 'mousemove', function ( event ) {
    event.preventDefault();
    event.stopPropagation();
} );
$( '#autoplay' )[ 0 ].addEventListener( 'touchmove', function ( event ) {
    event.preventDefault();
    event.stopPropagation();
} );