var scene, camera, renderer, container, controls, mixer, dirLight;;
var aviao;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
var RAIO = 10000;
var flag = true;
var mixers = [];
var mesh_flamingo;
var birds, bird;
var boid, boids;
var stats;

window.onload = function init(){

    // Scene
    scene = new THREE.Scene();

    // Create a WebGL renderer, camera and a scene
    renderer = setupRenderer();

    // Container
    container = setupContainer(renderer);
    
    // create a point light
    const pointLight =
      new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 0;
    pointLight.position.y = 250;
    pointLight.position.z = 0;

    // add to the scene
    scene.add(pointLight);
 
    var loader = new THREE.TextureLoader();     
    loader.load('images/skyhor.jpg', function(texture){
        var material = new THREE.MeshPhongMaterial({ map: texture });
        var skyGeo = new THREE.SphereGeometry(RAIO, 36, 36);
        var sky = new THREE.Mesh(skyGeo, material);
        sky.material.fog = true;
        sky.material.side = THREE.BackSide;
        scene.add(sky);
    } );

    var loader = new THREE.TextureLoader();
    loader.load('images/grass.png', function(texture){
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10,10);
        var geometry = new THREE.CircleGeometry( 8600, 32000);
        var material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
        var circle = new THREE.Mesh( geometry, material );
        circle.rotation.x = Math.PI / 2;
        circle.position.y = -5000;
        scene.add( circle );
    } );

    var _this = this;
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/');
    mtlLoader.load('F-35_Lightning_II.mtl', function (materials){
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/');
        objLoader.load('F-35_Lightning_II.obj', function (obj){
            obj.rotation.x = - Math.PI / 2;
            obj.scale.set( 2, 2, 2 );
            _this.aviao = obj;
            scene.add(obj);
        });
    });

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/');
    mtlLoader.load('tree_oak.mtl', function (materials){
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/');
        objLoader.load('tree_oak.obj', function (obj){
            obj.position.y = -5000;
            obj.position.x = 2000;
            obj.scale.set( 100, 100, 100 );
            scene.add(obj);
        });
    });

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/');
    mtlLoader.load('trike.mtl', function (materials){
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/');
        objLoader.load('trike.obj', function (obj){
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = - Math.PI / 3;
            obj.position.y = -5000;
            obj.position.x = -2000;
            obj.scale.set( 100, 100, 100 );
            _this.objeto1 = obj;
            scene.add(obj);
        });
    });

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/');
    mtlLoader.load('VH-BumbleBee.mtl', function (materials){
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/');
        objLoader.load('VH-BumbleBee.obj', function (obj){
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = 3*Math.PI/2;
            obj.position.y = -5000;
            obj.position.x = -2000;
            obj.position.z = -2000;
            obj.scale.set( 0.5, 0.5, 0.5 );
            _this.objeto1 = obj;
            scene.add(obj);
        });
    });

    // Camera
    camera = setupCamera();

    THREEx.WindowResize(renderer,camera);
    THREEx.FullScreen.bindKey({charCode : 'm'.charCodeAt(0)});

    // manipulate camera
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.userPan = false;
    controls.userZoom = false;
    controls.maxDistance = 300;

    var axes = new THREE.AxisHelper(10000);
    //scene.add( axes );

    //light
    dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 1.75, 1 );
    dirLight.position.multiplyScalar( 50 );
    scene.add( dirLight );
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    var d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;

    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;

    // MODEL - flamingo

    var loader = new THREE.JSONLoader();
    loader.load( './flamingo.js', function( geometry ) {
        var material = new THREE.MeshLambertMaterial( { color: 0xffffff, morphTargets: true, vertexColors: THREE.FaceColors, shading: THREE.FlatShading } );
        mesh_flamingo = new THREE.Mesh( geometry, material );
        var s = 0.08;
        mesh_flamingo.scale.set( s, s, s );
        mesh_flamingo.position.y = 15;
        mesh_flamingo.rotation.y = -1;
        mesh_flamingo.castShadow = true;
        mesh_flamingo.receiveShadow = true;
        scene.add( mesh_flamingo );
        mixer = new THREE.AnimationMixer( mesh_flamingo );
        mixer.clipAction( geometry.animations[ 0 ] ).setDuration( 1 ).play();
        mixers.push( mixer );
    } );

    // birds
    birds = [];
    boids = [];
    for ( var i = 0; i < 500; i ++ ) {
        boid = boids[ i ] = new Boid();
        boid.position.x = Math.random() * 400 - 200;
        boid.position.y = Math.random() * 400 - 200;
        boid.position.z = Math.random() * 400 - 200;
        boid.velocity.x = Math.random() * 2 - 1;
        boid.velocity.y = Math.random() * 2 - 1;
        boid.velocity.z = Math.random() * 2 - 1;
        boid.setAvoidWalls( true );
        boid.setWorldSize( 2000, 2000, 1000 );

        bird = birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color:Math.random() * 0xffffff, side: THREE.DoubleSide } ) );
        bird.phase = Math.floor( Math.random() * 62.83 );
        scene.add( bird );
    }

    //audio
    var listener = new THREE.AudioListener();
    camera.add( listener );
    var audioLoader = new THREE.AudioLoader();
    // global ambient audio

    var sound = new THREE.Audio( listener );
    audioLoader.load( 'sound/soundairplane.ogg', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });

    var SoundControls = function() {
        this.Ambient =  sound4.getVolume();
    };

    animate();
}


var Boid = function() {

                var vector = new THREE.Vector3(),
                _acceleration, _width = 500, _height = 500, _depth = 200, _goal, _neighborhoodRadius = 100,
                _maxSpeed = 4, _maxSteerForce = 0.1, _avoidWalls = false;

                this.position = new THREE.Vector3();
                this.velocity = new THREE.Vector3();
                _acceleration = new THREE.Vector3();

                this.setGoal = function ( target ) {

                    _goal = target;

                };

                this.setAvoidWalls = function ( value ) {

                    _avoidWalls = value;

                };

                this.setWorldSize = function ( width, height, depth ) {

                    _width = width;
                    _height = height;
                    _depth = depth;

                };

                this.run = function ( boids ) {

                    if ( _avoidWalls ) {

                        vector.set( - _width, this.position.y, this.position.z );
                        vector = this.avoid( vector );
                        vector.multiplyScalar( 5 );
                        _acceleration.add( vector );

                        vector.set( _width, this.position.y, this.position.z );
                        vector = this.avoid( vector );
                        vector.multiplyScalar( 5 );
                        _acceleration.add( vector );

                        vector.set( this.position.x, - _height, this.position.z );
                        vector = this.avoid( vector );
                        vector.multiplyScalar( 5 );
                        _acceleration.add( vector );

                        vector.set( this.position.x, _height, this.position.z );
                        vector = this.avoid( vector );
                        vector.multiplyScalar( 5 );
                        _acceleration.add( vector );

                        vector.set( this.position.x, this.position.y, - _depth );
                        vector = this.avoid( vector );
                        vector.multiplyScalar( 5 );
                        _acceleration.add( vector );

                        vector.set( this.position.x, this.position.y, _depth );
                        vector = this.avoid( vector );
                        vector.multiplyScalar( 5 );
                        _acceleration.add( vector );

                    }/* else {

                        this.checkBounds();

                    }
                    */

                    if ( Math.random() > 0.5 ) {

                        this.flock( boids );

                    }

                    this.move();

                };

                this.flock = function ( boids ) {

                    if ( _goal ) {

                        _acceleration.add( this.reach( _goal, 0.005 ) );

                    }

                    _acceleration.add( this.alignment( boids ) );
                    _acceleration.add( this.cohesion( boids ) );
                    _acceleration.add( this.separation( boids ) );

                };

                this.move = function () {

                    this.velocity.add( _acceleration );

                    var l = this.velocity.length();

                    if ( l > _maxSpeed ) {

                        this.velocity.divideScalar( l / _maxSpeed );

                    }

                    this.position.add( this.velocity );
                    _acceleration.set( 0, 0, 0 );

                };

                this.checkBounds = function () {

                    if ( this.position.x >   _width ) this.position.x = - _width;
                    if ( this.position.x < - _width ) this.position.x =   _width;
                    if ( this.position.y >   _height ) this.position.y = - _height;
                    if ( this.position.y < - _height ) this.position.y =  _height;
                    if ( this.position.z >  _depth ) this.position.z = - _depth;
                    if ( this.position.z < - _depth ) this.position.z =  _depth;

                };

                //

                this.avoid = function ( target ) {

                    var steer = new THREE.Vector3();

                    steer.copy( this.position );
                    steer.sub( target );

                    steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );

                    return steer;

                };

                this.repulse = function ( target ) {

                    var distance = this.position.distanceTo( target );

                    if ( distance < 150 ) {

                        var steer = new THREE.Vector3();

                        steer.subVectors( this.position, target );
                        steer.multiplyScalar( 0.5 / distance );

                        _acceleration.add( steer );

                    }

                };

                this.reach = function ( target, amount ) {

                    var steer = new THREE.Vector3();

                    steer.subVectors( target, this.position );
                    steer.multiplyScalar( amount );

                    return steer;

                };

                this.alignment = function ( boids ) {

                    var boid, velSum = new THREE.Vector3(),
                    count = 0;

                    for ( var i = 0, il = boids.length; i < il; i++ ) {

                        if ( Math.random() > 0.6 ) continue;

                        boid = boids[ i ];

                        distance = boid.position.distanceTo( this.position );

                        if ( distance > 0 && distance <= _neighborhoodRadius ) {

                            velSum.add( boid.velocity );
                            count++;

                        }

                    }

                    if ( count > 0 ) {

                        velSum.divideScalar( count );

                        var l = velSum.length();

                        if ( l > _maxSteerForce ) {

                            velSum.divideScalar( l / _maxSteerForce );

                        }

                    }

                    return velSum;

                };

                this.cohesion = function ( boids ) {

                    var boid, distance,
                    posSum = new THREE.Vector3(),
                    steer = new THREE.Vector3(),
                    count = 0;

                    for ( var i = 0, il = boids.length; i < il; i ++ ) {

                        if ( Math.random() > 0.6 ) continue;

                        boid = boids[ i ];
                        distance = boid.position.distanceTo( this.position );

                        if ( distance > 0 && distance <= _neighborhoodRadius ) {

                            posSum.add( boid.position );
                            count++;

                        }

                    }

                    if ( count > 0 ) {

                        posSum.divideScalar( count );

                    }

                    steer.subVectors( posSum, this.position );

                    var l = steer.length();

                    if ( l > _maxSteerForce ) {

                        steer.divideScalar( l / _maxSteerForce );

                    }

                    return steer;

                };

                this.separation = function ( boids ) {

                    var boid, distance,
                    posSum = new THREE.Vector3(),
                    repulse = new THREE.Vector3();

                    for ( var i = 0, il = boids.length; i < il; i ++ ) {

                        if ( Math.random() > 0.6 ) continue;

                        boid = boids[ i ];
                        distance = boid.position.distanceTo( this.position );

                        if ( distance > 0 && distance <= _neighborhoodRadius ) {

                            repulse.subVectors( this.position, boid.position );
                            repulse.normalize();
                            repulse.divideScalar( distance );
                            posSum.add( repulse );

                        }

                    }

                    return posSum;

                }

            }


// Set the scene size.
var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight;

function setupCamera(){
    var camera;

    // Set some camera attributes.
    var VIEW_ANGLE = 45,
        ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
        NEAR = 0.1,
        FAR = 100000;

    // create camera in (0,0,0)
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

    // lookAt camera
    camera.position.set(0,100,100);
    camera.lookAt(0,0,0);

    return camera;
}

function setupRenderer(){
    var renderer;

    renderer = new THREE.WebGLRenderer();

    // Start the renderer.
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    return renderer;
}

function setupContainer(renderer){
    var container;
    // Get the DOM element to attach to
    container = document.querySelector('#container');

    // Attach the renderer-supplied DOM element.
    container.appendChild(renderer.domElement);
    return container;
}

function animate(){
    requestAnimationFrame(animate);
    render();
    update();
}

function render(){
    renderer.render(scene, camera);

    for ( var i = 0, il = birds.length; i < il; i++ ) {
     boid = boids[ i ];
     boid.run( boids );

     bird = birds[ i ];
     bird.position.copy( boids[ i ].position );

     color = bird.material.color;
     color.r = color.g = color.b = ( 500 - bird.position.z ) / 1000;

     bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
     bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

     bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
     bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = Math.sin( bird.phase ) * 5;
    }
}

function update(){
    var delta = clock.getDelta(); // seconds.
    var moveDistance = 50 * delta; // 200 pixels per second
    var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second
    
    var rotation_matrix = new THREE.Matrix4().identity();
    if ( keyboard.pressed("D") ){
        aviao.rotateY(rotateAngle);
    }
    if ( keyboard.pressed("A") ){
        aviao.rotateY(-rotateAngle);
    }
    if ( keyboard.pressed("W") ){
        aviao.rotateX(rotateAngle);
    }
    if ( keyboard.pressed("S") ){
        aviao.rotateX(-rotateAngle);
    }
    if ( keyboard.pressed("space") ){
        moveDistance *= 100;
    }

    aviao.translateY(moveDistance);

    var distCentro = aviao.position.distanceTo(new THREE.Vector3(0,0,0));
    if((distCentro > RAIO - 200) && flag == true){
        aviao.position.set(-aviao.position.x,-aviao.position.y,-aviao.position.z);
        flag = false;
    }
    if(!flag && (distCentro <= RAIO - 200)){
        flag = true;
    }

    for ( var i = 0; i < mixers.length; i ++ ) {
        mixers[i].update( delta );
    }
    //mesh_flamingo.translateZ(1)


    controls.center = aviao.position;
    
    controls.update();
}