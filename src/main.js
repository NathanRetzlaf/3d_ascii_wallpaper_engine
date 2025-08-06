// index.js
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// — Scene & background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// — Lights
// 1) Soft, low‐level ambient
scene.add(new THREE.AmbientLight(0x222222, 1));

// 2) Directional “sun” light for shading
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(1, 1, 1).normalize();
scene.add(dirLight);

// — Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

// — Renderer + ASCIIEffect
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const ascii = new AsciiEffect(
  renderer,
  " .:-+*=%@#", // charset
  { invert: true, resolution: 0.2 }
);
ascii.setSize(window.innerWidth, window.innerHeight);
ascii.domElement.style.whiteSpace = "pre";
ascii.domElement.style.backgroundColor = "black";
ascii.domElement.style.color = "white";
document.body.appendChild(ascii.domElement);

// — OrbitControls
new OrbitControls(camera, ascii.domElement);

// — Mesh container
const mesh = new THREE.Mesh();
scene.add(mesh);

// — STL Loader & “shaded” material
const loader = new STLLoader();
// const material = new THREE.MeshPhongMaterial({
//   color: 0xffffff, // bright white
//   shininess: 50, // adds specular highlights
//   flatShading: false, // smooth normals
// });
const material = new THREE.MeshStandardMaterial();
material.flatShading = true;
material.side = THREE.DoubleSide;

loader.load(
  "./models/thorn.stl",
  (geometry) => {
    geometry.computeVertexNormals(); // smooth normals
    geometry.center();

    mesh.geometry = geometry;
    mesh.material = material;

    // Frame the camera on the model
    const bs = geometry.boundingSphere;
    camera.position.set(bs.center.x, bs.center.y, bs.center.z + bs.radius * 2);
    camera.lookAt(bs.center);

    // Helpers to verify orientation
    scene.add(new THREE.BoxHelper(mesh, 0xffff00));
    scene.add(new THREE.AxesHelper(bs.radius * 1.5));
  },
  // onProgress
  (xhr) =>
    console.log(`Model ${((xhr.loaded / xhr.total) * 100).toFixed(1)}% loaded`),
  // onError
  (err) => console.error("STL load error:", err)
);

// — Animation loop
function animate() {
  mesh.rotation.z += 0.01;
  ascii.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// — Handle window resize
window.addEventListener("resize", () => {
  const w = window.innerWidth,
    h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  ascii.setSize(w, h);
});
