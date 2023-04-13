import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import * as dat from 'lil-gui';

import './style.scss';

/* 
 * DEBUG
 */
const gui = new dat.GUI();
const lightGUI = gui.addFolder('Lights');
const environmentGUI = gui.addFolder('Environment');
const modelGUI = gui.addFolder('Model');

/* 
 * VARIABLES
 */

//canvas
const canvas = document.querySelector('canvas.webgl');

//sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
let currentEquipment = 0;

//equipment data
const equipment =[
    {
        name: 'M1A1 SEPV2',
        filename: 'm1a1.glb',
        type: 0,
        path: '/m1a1',
        scale: 1,
        position:{
            x: 0,
            y: 0,
            z: 0
        },
        rotate:{
            x: 0,
            y: 0,
            z: 0
        },
        scale:{
            x: 1,
            y: 1,
            z: 1
        }
    },
    {
        name: 'HIND',
        filename: 'scene.gltf',
        type: 0,
        path: '/hind',
        scale: 1,
        position:{
            x: 0,
            y: 0,
            z: 0
        },
        rotate:{
            x: 0,
            y: 0,
            z: 0
        },
        scale:{
            x: .01,
            y: .01,
            z: .01
        }
    }
];

//types of equipment, and their views
const equipmentTypes ={
    'ground': ['level','above'],
    'air': ['level','below']
}

//views
const views = {
    above: {
        camera:{
            position:{
                x: 0,
                y: 30,
                z: 10
            },
            rotate:{
                x: 0,
                y: 0,
                z: 0
            }
        },
        model:{
            position:{
                x: 0,
                y: 0,
                z: 0
            },
            rotate:{
                x: 0,
                y: 0,
                z: 0
            }
        }
    },
    level: {
        camera:{
            position:{
                x: 0,
                y: 3,
                z: 10
            },
            rotate:{
                x: 0,
                y: 0,
                z: 0
            }
        },
        model:{
            position:{
                x: 0,
                y: 3,
                z: 10
            },
            rotate:{
                x: 0,
                y: 0,
                z: 0
            }
        }
    }

}

/* 
 * RESIZE
 */
//resize event
window.addEventListener('resize', (e)=>{
    //update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    //update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
});

//fullscreen
window.addEventListener('dblclick', () =>
{
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        else if(document.webkitExitFullscreen)
        {
            document.webkitExitFullscreen()
        }
    }
})

/* 
 * LOADING
 */
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = () =>
{
    console.log('onStart')
}

loadingManager.onProgress = () =>
{
    console.log('onProgress')
}

loadingManager.onLoad = () =>
{
    console.log('onLoad')
}

loadingManager.onStart = () =>
{
    console.log('onStart')
}


/* 
 * TEXTURES
 */
const textureLoader = new THREE.TextureLoader(loadingManager)
const colorTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_COL_2K.jpg')
const colorFarTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_COL_2K.jpg')
const bumpTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_BUMP_2K.jpg')
const displacementTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_DISP_2K.jpg')
const aoTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_AO_2K.jpg')
const aoFarTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_AO_2K.jpg')
const normalTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_NRM_2K.jpg')
const normalFarTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_NRM_2K.jpg')
const glossTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_GLOSS_2K.jpg')
const matcapTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_Sphere.png')

function textureRepeat(farTextures,nearTextures){

    nearTextures.forEach((nearTexture)=>{
        console.log(nearTexture)
        nearTexture.repeat.x = 2
        nearTexture.repeat.y = 2
        nearTexture.wrapS = THREE.RepeatWrapping
        nearTexture.wrapT = THREE.RepeatWrapping
    })

    farTextures.forEach((farTexture)=>{
        console.log(farTexture)
        farTexture.repeat.x = 10
        farTexture.repeat.y = 10
        farTexture.wrapS = THREE.RepeatWrapping
        farTexture.wrapT = THREE.RepeatWrapping
    })
}
textureRepeat([colorFarTexture,normalFarTexture,aoFarTexture],[bumpTexture,displacementTexture,aoTexture,normalTexture,glossTexture]);


/* 
 * RENDERER
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

/* 
 * SCENE/ENVIRONMENT
 */
const scene = new THREE.Scene()
// const environment = new RoomEnvironment();
// const pmremGenerator = new THREE.PMREMGenerator( renderer );

//background
scene.background = new THREE.Color( '#a8f1ff' );
// scene.environment = pmremGenerator.fromScene( environment ).texture;
// environment.dispose();

// Create a variable to store the background color
var bgColor = { color: "#a8f1ff" };

// Add the background color control to dat.gui
environmentGUI.addColor( bgColor, 'color' ).onChange( function() {
  // Set the background color of the scene to the new value
  scene.background = new THREE.Color( bgColor.color );
})
    .name('Sky Color');


/* 
 * LIGHTS
 */
// const light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(0, 10, 0);
// light.castShadow = true;
// scene.add(light);

const ambientLight = new THREE.AmbientLight(0xeee4b4, .7)
scene.add(ambientLight)
const ambientLightGUI = lightGUI.addFolder('Ambient Light')
ambientLightGUI.add(ambientLight,'intensity')
ambientLightGUI.addColor(ambientLight,'color')

const hemiLight = new THREE.HemisphereLight(0xfff4bd, 0xfff4bd, .184);
scene.add(hemiLight);

// Create a folder in dat.gui for the light properties
const hemiLightGUI = lightGUI.addFolder('Hemisphere Light');

// Add a color control for the sky color
const skyColor = {
  color: hemiLight.color.getHex()
};

hemiLightGUI.addColor(skyColor, 'color').onChange(() => {
  hemiLight.color.set(skyColor.color);
}).name('Sky');

// Add a color control for the ground color
const groundColor = {
  color: hemiLight.groundColor.getHex()
};

hemiLightGUI.addColor(groundColor, 'color').onChange(() => {
  hemiLight.groundColor.set(groundColor.color);
}).name('Ground');

// Add a slider control for the intensity
hemiLightGUI.add(hemiLight, 'intensity', 0, 4);


const pointLightGUI = lightGUI.addFolder('Point Light');

const light = new THREE.PointLight(0xf5de8a,2.3);
light.position.set(-50,36.9,50);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.bias = -0.001;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 200;
scene.add( light );

// Add a color control for the ground color
const pointColor = {
    color: light.color.getHex()
  };
  
  pointLightGUI.addColor(pointColor, 'color').onChange(() => {
    light.color.set(pointColor.color);
  }).name('Color');

pointLightGUI
    .add(light,'intensity')
    .min(0)
    .max(10)
    .step(.1)
    .name('Intensity');

pointLightGUI
    .add(light.position,'x')
    .min(-50)
    .max(50)
    .step(.1)

pointLightGUI
    .add(light.position,'y')
    .min(-50)
    .max(50)
    .step(.1)

pointLightGUI
    .add(light.position,'z')
    .min(-50)
    .max(50)
    .step(.1)




// const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
// scene.add(ambientLight)

// const pointLight = new THREE.PointLight(0xffffff, 3)
// pointLight.position.x = 2
// pointLight.position.y = 3
// pointLight.position.z = 4
// scene.add(pointLight)

// lightGUI.add(ambientLight,'intensity',0,5,.01).name('Ambient Light Intensity');
// lightGUI.add(pointLight.position,'x',-10,10,.1).name('Point Light X');
// lightGUI.add(pointLight.position,'y',-10,10,.1).name('Point Light Y');
// lightGUI.add(pointLight.position,'z',-10,10,.1).name('Point Light Z');
// lightGUI.add(pointLight,'intensity',0,5,.01).name('Point Light Intensity');
// lightGUI.addColor(pointLight,'color').name('Point Light Color');

/**
 * Object
 */

let group = new THREE.Group();

//gltf loader
const loader = new GLTFLoader();

function loadModel(){
    loader.load(
        `models${equipment[currentEquipment].path}/${equipment[currentEquipment].filename}`,
        function (gltf) {
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    child.receiveShadow = true
                    child.castShadow = true
                }
            });
            //     if (((child as THREE.Light)).isLight) {
            //         const l = (child as THREE.Light)
            //         l.castShadow = true
            //         l.shadow.bias = -.003
            //         l.shadow.mapSize.width = 2048
            //         l.shadow.mapSize.height = 2048
            //     }
            // })
            console.log(gltf.scene,currentEquipment);

            gltf.scene.rotation.y = Math.PI /2;
            gltf.scene.scale.set(
                equipment[currentEquipment].scale.x,
                equipment[currentEquipment].scale.y,
                equipment[currentEquipment].scale.z
            )
            gltf.scene.position.set(
                equipment[currentEquipment].position.x,
                equipment[currentEquipment].position.y,
                equipment[currentEquipment].position.z
            )
            group.add(gltf.scene)
        },
        (xhr) => {
            //console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        }
    )
}
loadModel();

//room for additional tranformation
scene.add(group);
modelGUI
    .add(group.position,'y')
    .min(-1)
    .max(1)
    .step(.01)
    .name('Model Y');

/* 
 * SUPPORTING ELEMENTS
 */

const cubeLoader = new THREE.CubeTextureLoader();
const cubeTexture = cubeLoader.load([
  '/textures/sky/px.png',
  '/textures/sky/nx.png',
  '/textures/sky/py.png',
  '/textures/sky/ny.png',
  '/textures/sky/pz.png',
  '/textures/sky/nz.png'
]);

// Set the cube map texture's format

cubeTexture.format = THREE.RGBAFormat;

// Create the box geometry

const skyGeometry = new THREE.BoxGeometry(100, 100, 100);

// Create the material with the cube map texture applied

const skyMaterial = new THREE.MeshBasicMaterial({
  envMap: cubeTexture,
  side: THREE.BackSide // render only the back faces of the cube
});

// Create the mesh and add it to the scene

const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(skyMesh);

// Create the ground planes
const planeGeometry = new THREE.PlaneGeometry(10, 10, 1200, 1200);
planeGeometry.attributes.uv2 = planeGeometry.attributes.uv
const planeMaterial = new THREE.MeshStandardMaterial(
    {
        map: colorTexture,
        bumpMap: bumpTexture,
        displacementMap: displacementTexture,
        aoMap: aoTexture,
        normalMap: normalTexture
    }
);
planeMaterial.displacementScale = .1
environmentGUI.add(planeMaterial,'displacementScale',0,2,.0001)

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.castShadow = true; 
plane.receiveShadow = true;
scene.add(plane);


//far plane
const farPlaneGeometry = new THREE.PlaneGeometry(300, 300, 1, 1);
farPlaneGeometry.attributes.uv2 = farPlaneGeometry.attributes.uv
const farPlaneMaterial = new THREE.MeshStandardMaterial(
    {
        map: colorFarTexture,
        normalMap: normalFarTexture,
        aoMap: aoFarTexture
    }
);
const farPlane = new THREE.Mesh(farPlaneGeometry, farPlaneMaterial);
farPlane.rotation.x = -Math.PI / 2;
farPlane.castShadow = true; 
farPlane.receiveShadow = true;
scene.add(farPlane);

environmentGUI
    .addColor(plane.material,'color')
    .name('Ground Color');



//spacing variables
const clearing = 6;

Number.prototype.between = function(a, b) {
    var min = Math.min.apply(Math, [a, b]),
    max = Math.max.apply(Math, [a, b]);
    return this > min && this < max;
};

// // Create the cacti
// const cactusGeometry = new THREE.CylinderGeometry(0.5, 1, 3, 8);
// const cactusMaterial = new THREE.MeshStandardMaterial({ color: 'green' });
// cactusMaterial.roughness = .5;
// for (let i = 0; i < 50; i++) {
//     const cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);
//     cactus.position.x = Math.random() * 100 - 50;
//     cactus.position.z = Math.random() * 100 - 50;
//     cactus.position.y = 1.5;
//     cactus.rotation.y = Math.random() * Math.PI * 2;
    
//     if ((cactus.position.x.between(-clearing,clearing))&& (cactus.position.z.between(-clearing,clearing))){
        
//     }
//     else{
//         scene.add(cactus);
//     }
// }

//bushes
loader.load('models/bush/scene.gltf', result => { 
    const bush = result.scene.children[0]; 
    bush.position.set(0,-5,-25);
    bush.traverse(n => { if ( n.isMesh ) {
        n.castShadow = true; 
        n.receiveShadow = true;
        if(n.material.map) n.material.map.anisotropy = 1; 
    }});
    bush.scale.set(.01,.01,.01)
    bush.position.set(5,0,5)

    for (let i = 0; i < 80; i++) {
        const bushClone = bush.clone();
        bushClone.position.x = Math.random() * 70 - 35;
        bushClone.position.z = Math.random() * 70 - 35;
        //bushClone.rotation.y = Math.random() * Math.PI * 2;
        
        if ((bushClone.position.x.between(-clearing,clearing))&& (bushClone.position.z.between(-clearing,clearing))){
            
        }
        else{
            scene.add(bushClone);
        }
    }

    // var controller = gui.add(bush.scale,'x',0,10,.0001)
    //     controller.onChange(function(value) {
    //         bush.scale.y = value;
    //         bush.scale.z = value;
    // });
    scene.add(bush);

});

//rocks
loader.load('models/rocks/scene.gltf', result => { 
    const rock = result.scene.children[0]; 
    rock.position.set(0,-5,-25);
    rock.traverse(n => { if ( n.isMesh ) {
        n.castShadow = true; 
        n.receiveShadow = true;
        if(n.material.map) n.material.map.anisotropy = 1; 
    }});
    rock.scale.set(.03,.03,.03)
    rock.position.set(5,-.1,5)

    for (let i = 0; i < 20; i++) {
        const rockClone = rock.clone();
        rockClone.position.x = Math.random() * 70 - 35;
        rockClone.position.z = Math.random() * 70 - 35;
        const randomScale = Math.random()*.05 +.01
        rockClone.scale.x = randomScale
        rockClone.scale.y = randomScale
        rockClone.scale.z = randomScale
        //rockClone.rotation.y = Math.random() * Math.PI * 2;
        
        if ((rockClone.position.x.between(-clearing,clearing))&& (rockClone.position.z.between(-clearing,clearing))){
            
        }
        else{
            scene.add(rockClone);
        }
    }


});

//FOG
scene.fog = new THREE.Fog(0xffecb8,31, 63)
scene.fog.nea
environmentGUI.addColor(scene.fog,'color').name('fog color');
environmentGUI.add(scene.fog,'near')
environmentGUI.add(scene.fog,'far')
// // Create the rocks
// const rockGeometry = new THREE.IcosahedronGeometry(1, 0);
// const rockMaterial = new THREE.MeshMatcapMaterial({ color: 0x8c8c8c });
// for (let i = 0; i < 100; i++) {
//     const rock = new THREE.Mesh(rockGeometry, rockMaterial);
//     rock.position.x = Math.random() * 100 - 50;
//     rock.position.z = Math.random() * 100 - 50;
//     rock.position.y = 1;
//     if ((rock.position.x.between(-clearing,clearing))&& (rock.position.z.between(-clearing,clearing))){
        
//     }
//     else{
//         scene.add(rock);
//     }
// }

/* 
 * CAMERA
 */

//camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 150)
camera.position.z = 10
camera.position.y = 3
scene.add(camera)

/* 
 * CONTROLS
 */

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enablePan = false;
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI/2 - .05;


/* 
 * ANIMATION
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()

/* 
 * UI
 */
function above(){
    console.log('above');

    gsap.to(camera.position,{
        x: views.above.camera.position.x,
        y: views.above.camera.position.y,
        z: views.above.camera.position.z, 
        duration: 2, 
        delay: 0
    });
    return false;
}

function level(){
    console.log(views);

    gsap.to(camera.position,{
        x: views.level.camera.position.x,
        y: views.level.camera.position.y,
        z: views.level.camera.position.z, 
        duration: 2, 
        delay: 0
    });
    return false;
}

//change model to selected
function changeModel(event){
    //remove old model
    scene.remove(group);
    console.log(group);
    group.traverse( function( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.geometry.dispose();
            child.material.dispose();
        }
    });

    //get new model id
    currentEquipment = parseInt(event.target.getAttribute('data-model'));
    
    loadModel();
    return false;
}

/* 
 * UI EVENTS
 */

//assign buttons
document.querySelector('.above').addEventListener('click',above);
document.querySelector('.level').addEventListener('click',level);

//assign model change buttons
document.querySelectorAll('.changeModel').forEach(function(element,index){
    element.addEventListener('click',function(e){
        changeModel(e);
    })
});