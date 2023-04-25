import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import gsap from 'gsap';
import { TimelineMax } from 'gsap/all'
import { TweenMax } from 'gsap/all'
import { Power0 } from 'gsap/all'
import * as dat from 'lil-gui';
import * as bootstrap from 'bootstrap'

//Style Import
import './style.scss';


/* 
 * DEBUG
 */
const debugMode = window.location.hash.includes('debug');

//create debug object and folders
const gui = new dat.GUI();
const lightGUI = gui.addFolder('Lights');
const environmentGUI = gui.addFolder('Environment');
const modelGUI = gui.addFolder('Model');

//hide debug panel if not #debug
if(!debugMode){
    document.body.appendChild(gui.domElement);
    gui.domElement.style.display = 'none';
}

//reports camera position
const parameters = {
    report: () =>{
        const { x, y, z } = camera.position;
        console.log(`Camera position: x=${x}, y=${y}, z=${z}`);
    },
    toggleFog: ()=>{
        if (scene.fog) {
            // If fog is currently enabled, turn it off
            scene.fog = null;
        } else {
            scene.fog = new THREE.Fog(0xffecb8,31, 53)
        }
    }
}
gui.add(parameters,'report')
gui.add(parameters, 'toggleFog')


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

//currently displayed equipment
let currentEquipment = 0;

//equipment data
const equipment =[
    {
        name: 'M1A1',
        filename: 'm1a1-named.glb',
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
            y: .5,
            z: 0
        },
        scale:{
            x: 1,
            y: 1,
            z: 1
        }
    },
    {
        name: 'M1126',
        filename: 'm1126.glb',
        type: 0,
        path: '/m1126',
        scale: 1,
        position:{
            x: 0,
            y: 0,
            z: 0
        },
        rotate:{
            x: 0,
            y: .5,
            z: 0
        },
        scale:{
            x: .6,
            y: .6,
            z: .6
        }
    },
    {
        name: 'F-14',
        filename: 'f14.glb',
        type: 0,
        path: '/f14',
        scale: 1,
        position:{
            x: 7,
            y: -2.5,
            z: 0
        },
        rotate:{
            x: 0,
            y: 1,
            z: 0
        },
        scale:{
            x: .05,
            y: .05,
            z: .05
        }
    },
    {
        name: 'HIND',
        filename: 'hind.glb',
        type: 0,
        path: '/hind',
        scale: 1,
        position:{
            x: 0,
            y: .45,
            z: 0
        },
        rotate:{
            x: 0,
            y: 1.5,
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
 * LOADING
 */

//Loading manager
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
const bumpFarTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_BUMP_2K.jpg')
const displacementTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_DISP_2K.jpg')
const aoTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_AO_2K.jpg')
const aoFarTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_AO_2K.jpg')
const normalTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_NRM_2K.jpg')
const normalFarTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_NRM_2K.jpg')
const glossTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_GLOSS_2K.jpg')
const matcapTexture = textureLoader.load('/textures/ground/GroundDirtRocky013_Sphere.png')
const particleTexture = textureLoader.load('/textures/particles/1.png')

//repeats textures
//acceps array of objects, each object contains array of textures, and the repeat counts for that collection
function textureRepeat(textureGroups){
    textureGroups.forEach(collection =>{
        
        collection.textures.forEach(texture=>{
            texture.repeat.x = collection.repeat
            texture.repeat.y = collection.repeat
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
        })
    })
}

//array of textures and their repeat properties
const textureRepeats = [
    {
        textures: [
            colorFarTexture,
            normalFarTexture,
            aoFarTexture,
            bumpFarTexture
        ],
        repeat: 15
    },
    {
        textures: [
            bumpTexture,
            displacementTexture,
            aoTexture,
            normalTexture,
            glossTexture
        ],
        repeat: 2
    }
]
textureRepeat(textureRepeats)

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


//background
scene.background = new THREE.Color( '#ffecb8' );

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

// const directionalLight = new THREE.DirectionalLight('#f5de8a', 1);
// directionalLight.position.set(-10, 10, 10);
// directionalLight.castShadow = true;

// scene.add(directionalLight);
// directionalLight.shadow.camera.near = 3
// directionalLight.shadow.camera.far = 40
// directionalLight.shadow.camera.top = 15
// directionalLight.shadow.camera.right = 30
// directionalLight.shadow.camera.bottom = -15
// directionalLight.shadow.camera.left = -30
// directionalLight.shadow.mapSize.width = 2048
// directionalLight.shadow.mapSize.height = 2048


// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
// scene.add(directionalLightHelper)

// const directionalLightGUI = lightGUI.addFolder('Directional Light');
// directionalLightGUI.add(directionalLight,'intensity')
// directionalLightGUI.addColor(directionalLight,'color')

// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)

const ambientLight = new THREE.AmbientLight(0xf5de8a, .7)
scene.add(ambientLight)
const ambientLightGUI = lightGUI.addFolder('Ambient Light')
ambientLightGUI.add(ambientLight,'intensity')
ambientLightGUI.addColor(ambientLight,'color')


// const hemiLight = new THREE.HemisphereLight(0xfff4bd, 0xfff4bd, .184);
// scene.add(hemiLight);

// // Create a folder in dat.gui for the light properties
// const hemiLightGUI = lightGUI.addFolder('Hemisphere Light');
// hemiLightGUI.addColor(hemiLight,'color')
// hemiLightGUI.addColor(hemiLight,'groundColor')
// hemiLightGUI.add(hemiLight, 'intensity', 0, 4);




const pointLight = new THREE.PointLight(0xf5de8a,2);
pointLight.position.set(-50,36.9,50);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
pointLight.shadow.bias = -0.001;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 200;
pointLight.shadow.radius = 5.7;
scene.add( pointLight );

const pointLightGUI = lightGUI.addFolder('Point Light');
pointLightGUI.addColor(pointLight, 'color')

// const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
// scene.add(pointLightCameraHelper)

pointLightGUI
    .add(pointLight,'intensity')
    .min(0)
    .max(10)
    .step(.1)
    .name('Intensity');

pointLightGUI
    .add(pointLight.position,'x')
    .min(-50)
    .max(50)
    .step(.1)

pointLightGUI
    .add(pointLight.position,'y')
    .min(-50)
    .max(50)
    .step(.1)

pointLightGUI
    .add(pointLight.position,'z')
    .min(-50)
    .max(50)
    .step(.1)


pointLightGUI
    .add(pointLight.shadow,'radius')
    .min(0)
    .max(10)
    .step(.1)




/**
 * OBJECTS
 */


let model = null

//gltf loader
const loader = new GLTFLoader();

//Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
loader.setDRACOLoader( dracoLoader );

const hiddenMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.2
})

//loads model
function loadModel(callback) {
    //remove old model if exists
    if (model !== null){
        scene.remove(model);
        model.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                child.material.dispose();
                child.backupMaterial.dispose();
                if(child.material.map) child.material.map.dispose();
                if(child.material.aoMap) child.material.aoMap.dispose();
                if(child.material.displacementMap) child.material.displacementMap.dispose();
                if(child.material.normalMap) child.material.normalMap.dispose();
                if(child.material.bumpMap) child.material.bumpMap.dispose();
                if(child.material.alphaMap) child.material.alphaMap.dispose();
                if(child.material.roughnessMap) child.material.roughnessMap.dispose();
                if(child.material.metalnessMap) child.material.metalnessMap.dispose();
            }
        }) 
    }

    //set url
    const url = `models${equipment[currentEquipment].path}/${equipment[currentEquipment].filename}`

    //load model
    loader.load(url, function(gltf) {
        //set global
        model = gltf.scene
        console.log(model)
        model.traverse(function (child) {
            if (child.isMesh) {
                // child.material = new THREE.MeshStandardMaterial({
                //     color: 0xffffff, // Set the base color
                //     metalness: 0.5, // Set the metalness value
                //     roughness: 0.5, // Set the roughness value
                //     envMapIntensity: 4, // Set the environment map intensity
                //     map: child.material.map, // Copy the existing texture map
                //     normalMap: child.material.normalMap, // Copy the existing normal map
                // });
                child.receiveShadow = false
                child.castShadow = true
                child.backupMaterial = child.material
            }
        });

        //adjust model rotation, scale, position
        model.rotation.y = Math.PI * equipment[currentEquipment].rotate.y
        model.scale.set(
            equipment[currentEquipment].scale.x,
            equipment[currentEquipment].scale.y,
            equipment[currentEquipment].scale.z
        )
        model.position.set(
            equipment[currentEquipment].position.x,
            equipment[currentEquipment].position.y,
            equipment[currentEquipment].position.z
        )

        //add to scene
        scene.add(model);

        //change text
        //loadText()
        
        
    },
    (xhr) => {
        //console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    });
}
loadModel();

/* 
 * FILTER
 */

function filterModel(category)
{
    console.log('running')
    model.traverse((child)=>
        {
            if (child.isMesh){
                if(child.name.startsWith(`ID-${category}`)){
                    child.material = child.backupMaterial
                }
                else{
                    child.material = hiddenMaterial
                    console.log('hide')
                }
            } 
        }
    )
}


/* 
 * Environment
 */


// Create the ground planes

//high detail ground plane
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
plane.castShadow = false; 
plane.receiveShadow = true;
scene.add(plane);

environmentGUI
    .addColor(plane.material,'color')
    .name('Ground Color');


//low detail far plane
const farPlaneGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
farPlaneGeometry.attributes.uv2 = farPlaneGeometry.attributes.uv

const farPlaneMaterial = new THREE.MeshStandardMaterial(
    {
        map: colorFarTexture,
        normalMap: normalFarTexture,
        aoMap: aoFarTexture,
        bumpMap: bumpFarTexture,
        roughness: 1
    }
);
// gui.add(farPlaneMaterial,'roughness')
// gui.add(farPlaneMaterial,'metalness')
const farPlane = new THREE.Mesh(farPlaneGeometry, farPlaneMaterial);
farPlane.rotation.x = -Math.PI / 2;
farPlane.castShadow = false; 
farPlane.receiveShadow = true;
scene.add(farPlane);






//spacing variables
const clearing = 6;

Number.prototype.between = function(a, b) {
    var min = Math.min.apply(Math, [a, b]),
    max = Math.max.apply(Math, [a, b]);
    return this > min && this < max;
};

//bushes
loader.load('models/bush/scene.gltf', result => { 
    const bush = result.scene.children[0]; 
    bush.position.set(0,-5,-25);
    bush.traverse(n => { if ( n.isMesh ) {
        n.castShadow = true; 
        n.receiveShadow = false;
        if(n.material.map) n.material.map.anisotropy = 1; 
    }});
    bush.scale.set(.01,.01,.01)
    bush.position.set(5,0,5)

    for (let i = 0; i < 80; i++) {
        const bushClone = bush.clone();
        bushClone.position.x = Math.random() * 70 - 35;
        bushClone.position.z = Math.random() * 70 - 35;
        bushClone.rotation.z = Math.random() * Math.PI * 2;
        
        if ((bushClone.position.x.between(-clearing,clearing))&& (bushClone.position.z.between(-clearing,clearing))){
            
        }
        else{
            scene.add(bushClone);
        }
    }
    scene.add(bush);

});

//rocks
loader.load('models/rocks/scene.gltf', result => { 
    const rock = result.scene.children[0]; 
    rock.position.set(0,-5,-25);
    rock.traverse(n => { if ( n.isMesh ) {
        n.castShadow = true; 
        n.receiveShadow = false;
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
        rockClone.rotation.z = Math.random() * Math.PI * 2;
        
        if ((rockClone.position.x.between(-clearing,clearing))&& (rockClone.position.z.between(-clearing,clearing))){
            
        }
        else{
            scene.add(rockClone);
        }
    }


});

// //tent
// loader.load('models/building/building.glb', result => { 
//     const tent = result.scene.children[0]; 
//     tent.position.set(0,-5,-25);
//     tent.traverse(n => { if ( n.isMesh ) {
//         n.castShadow = true; 
//         n.receiveShadow = false;
//         if(n.material.map) n.material.map.anisotropy = 1; 
//     }});
//     tent.scale.set(.6,.6,.6)
//     tent.position.set(-15,-.1,-25)
//     tent.rotation.z = -1.9
//     gui.add(tent.rotation,'z')
//     scene.add(tent);
// });

//dust
const dustGeometry = new THREE.BufferGeometry()
const dustCount = 2000
const dustVertices = new Float32Array(dustCount * 3)

for(let i=0;i<dustCount;i++){
    const i3 = i * 3
    const x = (Math.random() - .5) * 100
    const y = Math.random()
    const z = (Math.random() - .5) * 100
    dustVertices[i3] = x
    dustVertices[i3+1] = y
    dustVertices[i3+2] = z
}
dustGeometry.setAttribute( 'position', new THREE.BufferAttribute( dustVertices, 3 ) );
dustGeometry.attributes.position.needsUpdate = true

const dustMaterial = new THREE.PointsMaterial()
dustMaterial.color = new THREE.Color(0xf5de8a)
dustMaterial.alphaMap = particleTexture
dustMaterial.transparent = true
dustMaterial.depthWrite = false
dustMaterial.size = .1
const dust = new THREE.Points(dustGeometry,dustMaterial)
// dust.rotation.x = Math.PI / 2
scene.add(dust);


//TEXT
// const fontLoader = new FontLoader()
// let text = null

// function loadText(){
//     fontLoader.load(
//         '/fonts/droid/droid_sans_bold.typeface.json',
//         (font)=>{
//             if (text !== null){
//                 scene.remove(text)
//                 text.material.dispose()
//                 text.geometry.dispose()
//             }
//             const textGeometry = new TextGeometry(
//                 equipment[currentEquipment].name,
//                 {
//                     font,
//                     size: 4,
//                     height: 0.5,
//                     curveSegments: 12,
//                     bevelEnabled: true,
//                     bevelThickness: 0.03,
//                     bevelSize: 0.02,
//                     bevelOffset: 0,
//                     bevelSegments: 4

//                 }
//             )
//             textGeometry.computeBoundingBox();
//             const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
//             const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
//             textGeometry.translate(-textWidth / 2, 0, 0);

//             const textMaterial = new THREE.MeshStandardMaterial({ color: 0x6d5026})
//             gui.addColor(textMaterial,'color')
//             textMaterial.opacity = .7
//             //textMaterial.transparent = true
//             const textMesh = new THREE.Mesh(textGeometry,textMaterial)
//             textMesh.position.z = -12
//             textMesh.castShadow = true
//             text = textMesh
//             scene.add(text)
            
//         }
//     )
// }


//FOG

scene.fog = new THREE.Fog(0xffecb8,31, 53)
environmentGUI.addColor(scene.fog,'color').name('fog color');
environmentGUI.add(scene.fog,'near')
environmentGUI.add(scene.fog,'far')


/* 
 * INTERACTION
 */


// create a Three.js raycaster
const raycaster = new THREE.Raycaster();

// add a click event listener to the renderer
renderer.domElement.addEventListener('click', function(event) {

  // calculate mouse position in normalized device coordinates
  const mouse = new THREE.Vector2();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // cast a ray from the camera through the mouse position
  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the ray
  const intersects = raycaster.intersectObjects(scene.children);

  // check if the ray intersects with any meshes
  if (intersects.length > 0) {
    // trigger a click event on the first intersected mesh
    intersects[0].object.dispatchEvent({ type: 'click' });
  }

});

farPlane.addEventListener('click',()=>{
    console.log('plane clicked')
})



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
controls.enablePan = true;
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI/2 - .05;


/* 
 * ANIMATION
 */
const clock = new THREE.Clock()
const originalDustVertices = dustVertices.slice(0)

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    //update dust
    for(let i=0; i<dustCount; i++){
        const i3 = i*3
        const offset = dustGeometry.attributes.position.array[i3]
        dustGeometry.attributes.position.array[i3+1] = originalDustVertices[i3+1]*.5 +(Math.sin(.1*elapsedTime + offset) + Math.sin(.5*elapsedTime + offset))
    }
    dustGeometry.attributes.position.needsUpdate = true
    dust.rotation.y = .3 * elapsedTime

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


function sweep(){
    const timeline = new TimelineMax()
    timeline.to(camera.position,{
        x: -8,
        y: 1.12,
        z: 3.93, 
        duration: 2, 
        delay: 0
    }).to(camera.position,{
        x: -7,
        y: 1.12,
        z: 2.93, 
        duration: 5, 
        delay: 0
    }).to(camera.position,{
        x: 4.51,
        y: 4.2,
        z: 4.5, 
        duration: 2, 
        delay: 2
    })
    timeline.play()
}

function turret(){
    gsap.to(camera.position,{
        x: -3.3092789432150562,
        y: 2.9815695063413767,
        z: 4.402007116704356, 
        duration: 2, 
        delay: 0
    });
    return false;
}

function circle(){
    const orbitTimeline = new TimelineMax();
    
    orbitTimeline.to(camera.position, 5, {
        x: Math.sin(0) * 10,
        z: Math.cos(0) * 10,
        ease: Power0.easeNone,
    });
    
    for (let i = 1; i < 360; i++) {
        orbitTimeline.to(camera.position, 5 / 360, {
            x: Math.sin(i * Math.PI / 180) * 10,
            z: Math.cos(i * Math.PI / 180) * 10,
            ease: Power0.easeNone,
        });
    }
    
    orbitTimeline.to(camera.position, 5 / 360, {
        x: Math.sin(0) * 10,
        z: Math.cos(0) * 10,
        ease: Power0.easeNone,
        onComplete: function() {
            camera.lookAt(0, 0, 0);
        },
    });
    return false;
}


/* 
 * UI EVENTS
 */

document.addEventListener('keydown', function(event) {
    if (event.key === 't') {
        // execute your function here
        turret()
    }
    if (event.key === 'c') {
        // execute your function here
        circle()
    }
});

//assign buttons
document.querySelector('.above').addEventListener('click',above);
document.querySelector('.level').addEventListener('click',level);
document.querySelector('.sweep').addEventListener('click',sweep);
//document.querySelector('.turret').addEventListener('click',turret);
//document.querySelector('.circle').addEventListener('click',circle);

//assign model change buttons
document.querySelectorAll('.replaceModel').forEach(function(element,index){
    element.addEventListener('click',function(e){
        currentEquipment = parseInt(e.target.getAttribute('data-model'))
        loadModel()
    })
});

//assign filter change buttons
document.querySelectorAll('.filter').forEach(function(element,index){
    element.addEventListener('click',function(e){
        console.log('clicked')
        const filter = e.target.getAttribute('data-category')
        console.log(filter)
        filterModel(filter)
    })
});


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