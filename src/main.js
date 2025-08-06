import * as THREE from "three";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// — Core scene + camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

// — Basic renderer + ASCII wrapper
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);

const effect = new AsciiEffect(
  renderer,
  " .:-+*=%@#", // charset
  { invert: true, resolution: 0.2 }
);

effect.setSize(innerWidth, innerHeight);
effect.domElement.style.whiteSpace = "pre";
effect.domElement.style.backgroundColor = "black";
effect.domElement.style.color = "white";
document.body.appendChild(effect.domElement);

// — Add a test cube to confirm you see _something_
const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshNormalMaterial()
);
scene.add(box);

// — OrbitControls so you can drag around
const controls = new OrbitControls(camera, effect.domElement);

// — Animation loop
function tick() {
  box.rotation.x += 0.01;
  box.rotation.y += 0.02;
  effect.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// — Resize handler
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  effect.setSize(innerWidth, innerHeight);
});
