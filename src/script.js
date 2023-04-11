import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import * as dat from 'lil-gui';

import './style.scss';

//debug
const gui = new dat.GUI();

//canvas
const canvas = document.querySelector('canvas.webgl');

//sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const equipment ={
        name: 'M1A1 SEPV2',
        filename: 'm1a1.glb',
        type: 0,
        path: '/',
        scale: 1,
        translate:{
            x: 0,
            y: 0,
            z: 0
        },
        rotate:{
            x: 0,
            y: 0,
            z: 0
        }
    };

const equipmentTypes ={
    'ground': ['level','above'],
    'air': ['level','below']
}

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

//resize
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

//renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

// Scene
const scene = new THREE.Scene()
const environment = new RoomEnvironment();
const pmremGenerator = new THREE.PMREMGenerator( renderer );


scene.background = new THREE.Color( '#a8f1ff' );
scene.environment = pmremGenerator.fromScene( environment ).texture;
environment.dispose();

// Create a variable to store the background color
var bgColor = { color: "#a8f1ff" };

// Add the background color control to dat.gui
gui.addColor( bgColor, 'color' ).onChange( function() {
  // Set the background color of the scene to the new value
  scene.background = new THREE.Color( bgColor.color );
})
    .name('Sky Color');

/**
 * Object
 */
// const geometry = new THREE.BoxGeometry(1, 1, 1)
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
// const mesh = new THREE.Mesh(geometry, material)
// mesh.position.y = 2;
// scene.add(mesh)

const group = new THREE.Group();

//load gltf
const loader = new GLTFLoader()
loader.load(
    `models/${equipment.filename}`,
    function (gltf) {
        // gltf.scene.traverse(function (child) {
        //     if ((child as THREE.Mesh).isMesh) {
        //         const m = (child as THREE.Mesh)
        //         m.receiveShadow = true
        //         m.castShadow = true
        //     }
        //     if (((child as THREE.Light)).isLight) {
        //         const l = (child as THREE.Light)
        //         l.castShadow = true
        //         l.shadow.bias = -.003
        //         l.shadow.mapSize.width = 2048
        //         l.shadow.mapSize.height = 2048
        //     }
        // })
        console.log(gltf.scene);
        gltf.scene.rotation.y = Math.PI /2;
        group.add(gltf.scene)
    },
    (xhr) => {
        //console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

//room for additional tranformation
scene.add(group);
gui
    .add(group.position,'y')
    .min(-1)
    .max(1)
    .step(.01)
    .name('Model Y');


// Create the ground plane
const planeGeometry = new THREE.PlaneGeometry(200, 200, 1, 1);
const planeMaterial = new THREE.MeshStandardMaterial({ color: '#29221e' });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

gui
    .addColor(plane.material,'color')
    .name('Ground Color');


// Create the cacti
const cactusGeometry = new THREE.CylinderGeometry(0.5, 1, 3, 8);
const cactusMaterial = new THREE.MeshStandardMaterial({ color: 'green' });
for (let i = 0; i < 50; i++) {
    const cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);
    cactus.position.x = Math.random() * 100 - 50;
    cactus.position.z = Math.random() * 100 - 50;
    cactus.position.y = 1.5;
    cactus.rotation.y = Math.random() * Math.PI * 2;
    scene.add(cactus);
}

// Create the rocks
const rockGeometry = new THREE.IcosahedronGeometry(1, 0);
const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x8c8c8c });
for (let i = 0; i < 100; i++) {
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.x = Math.random() * 100 - 50;
    rock.position.z = Math.random() * 100 - 50;
    rock.position.y = 1;
    scene.add(rock);
}


//camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 10
camera.position.y = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enablePan = false;
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI/2 - .05;


//animate
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

//view functions
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

//assign buttons
document.querySelector('.above').addEventListener('click',above);
document.querySelector('.level').addEventListener('click',level);