var scene, camera, renderer, container, controls;

window.onload = function init(){

    // Scene
    scene = new THREE.Scene();
    
    // Camera
    camera = setupCamera();

    // Create a WebGL renderer, camera and a scene
    renderer = setupRenderer();

    // Container
    container = setupContainer(renderer);


    THREEx.WindowResize(renderer,camera);
    THREEx.FullScreen.bindKey({charCode : 'm'.charCodeAt(0)});

    // manipulate camera
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    
    // create a point light
    const pointLight =
      new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 0;
    pointLight.position.y = 250;
    pointLight.position.z = 0;

    // add to the scene
    scene.add(pointLight);

    // create the sphere's material
    const sphereMaterial =
      new THREE.MeshLambertMaterial(
        {
          color: 0xCC0000
        });

    // Set up the sphere vars
    const RADIUS = 50;
    const SEGMENTS = 16;
    const RINGS = 16;

    // Create a new mesh with
    // sphere geometry - we will cover
    // the sphereMaterial next!
    const sphere = new THREE.Mesh(

      new THREE.SphereGeometry(
        RADIUS,
        SEGMENTS,
        RINGS),

      sphereMaterial);

    // Move the Sphere back in Z so we
    // can see it.
    sphere.position.z = -400;

    // Finally, add the sphere to the scene.
    scene.add(sphere);

    // FLOOR
    var loader = new THREE.TextureLoader();
    loader.load('images/checkerboard.jpg', function(texture){
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10,10);
        var floorMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
        var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = Math.PI / 2;
        scene.add(floor);
    } );

     
    loader.load('images/skyhor.jpg', function(texture){
        var material = new THREE.MeshPhongMaterial({ map: texture });
        var skyGeo = new THREE.SphereGeometry(10000, 36, 36);
        var sky = new THREE.Mesh(skyGeo, material);
        sky.material.side = THREE.BackSide;
        scene.add(sky);
    } );

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/');
    mtlLoader.load('F-35_Lightning_II.mtl', function (materials){
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/');
        objLoader.load('F-35_Lightning_II.obj', function (obj){
            obj.rotation.x = - Math.PI / 2;
            scene.add(obj);
        });
    });

    animate();
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
    camera.position.set(0,150,400);
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
}

function update(){
    controls.update();
}