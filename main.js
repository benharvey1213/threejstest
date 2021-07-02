import './style.css';

import * as THREE from 'three';

// set up scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.01, 1000);

// set up renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// background color
renderer.setClearColor(0x98d1bb, 1);

// camera distance away
camera.position.setZ(40);

// vhs tape box
const box = new THREE.Mesh(
    new THREE.BoxGeometry(3, 24, 15), [
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('back.png') }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('cover.png') }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('top.png') }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('top.png') }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('sideright.png') }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('sideleft.png') }),
    ],

);

scene.add(box);

// vhs tape
const tapeSideNormal = new THREE.TextureLoader().load('tapesidenormal.png');

const tape = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 23.2, 14.5), [
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('tapefront.png') }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('tapefront.png') }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('tapetop.png') }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('tapetop.png') }),
        new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('tapeside.png'), normalMap: tapeSideNormal }),
        new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('tapeside.png'), normalMap: tapeSideNormal }),
    ]
);

scene.add(tape);

// lighting
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20, 20, 20);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

// adds one "bubble" to the scene
function addBubble() {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
    const bubble = new THREE.Mesh(geometry, material);

    initBubblePosition(bubble);

    // add to scene
    scene.add(bubble);

    // random value for fading use
    let lifetime = Math.random();

    return { mesh: bubble, direction: 1, lifetime: lifetime };
}

// assigns random coordinates
function initBubblePosition(bubble) {
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    bubble.position.set(x, y, z);
}

// array to keep track of all the bubbles
let bubbles = [];

// populate bubble array
var i = 0;
while (i++ < 800) {
    bubbles.push(addBubble());
}

// start with tape out a bit to avoid conflict with the box mesh
tape.position.z = 1;

// adjust animations based on scroll amount
function moveCamera() {
    // get scroll amount
    const t = document.body.getBoundingClientRect().top;

    // adjust camera
    camera.position.x = box.position.x + (t * -0.01) * Math.cos((t * -0.001));
    camera.position.y = box.position.y + (t * -0.0025) * Math.cos((t * -0.001));
    camera.position.z = 40 + (box.position.z + (t * 0.01));

    camera.lookAt(box.position);

    // adjust tape position
    tape.position.z = 1 + (t * -0.0022);
}

// bind scroll to move function
document.body.onscroll = moveCamera;

// constant to base bubble fading on
const lifeTimeConstant = 0.003;

// handle constant bubble movement
function animate() {
    requestAnimationFrame(animate);

    // bubble logic
    bubbles.forEach(bubble => {
        // constant floating effect
        bubble.mesh.position.y += 0.01;

        // bubble.material.opacity -= (factor / 500);
        if (bubble.direction > 0) {
            bubble.mesh.material.opacity += lifeTimeConstant * bubble.lifetime;
        } else {
            bubble.mesh.material.opacity -= lifeTimeConstant * bubble.lifetime;
        }

        // maxed, switch fade direction
        if (bubble.mesh.material.opacity >= 0.3) {
            bubble.direction = -1;
        }

        // respawn bubble
        if (bubble.mesh.material.opacity <= 0) {
            initBubblePosition(bubble.mesh);
            bubble.direction = 1;
        }
    });

    renderer.render(scene, camera);
}

animate();