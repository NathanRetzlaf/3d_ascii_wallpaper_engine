// index.js
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";

// — Scene & background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// — Lights
scene.add(new THREE.AmbientLight(0x222222, 1));
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
camera.position.set(0, 0, 2);
const baseFov = camera.fov;

// — Renderer + ASCIIEffect
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const ascii = new AsciiEffect(
  renderer,
  " .,:;-~!*=#$@", // charset
  { invert: true, resolution: 0.075 }
);
ascii.setSize(window.innerWidth, window.innerHeight);
ascii.domElement.style.whiteSpace = "pre";
ascii.domElement.style.backgroundColor = "black";
ascii.domElement.style.color = "white";
document.body.appendChild(ascii.domElement);

// — Mesh container
const mesh = new THREE.Mesh();
mesh.rotation.x = -0.35 * Math.PI; // lay flat
scene.add(mesh);

// — OBJ Loader & material
const loader = new OBJLoader();
const material = new THREE.MeshStandardMaterial({
  flatShading: true,
  side: THREE.DoubleSide,
});
let currentModel = null;

// default settings
let rotationSpeed = 0.01;
let asciiScale = 1;

// load model function
function loadModel(path) {
  if (path === currentModel) return;
  currentModel = path;
  console.log("Loading OBJ →", path);
  loader.load(
    path,
    (object) => {
      let geometry = null;
      object.traverse((child) => {
        if (child.isMesh && !geometry) geometry = child.geometry;
      });
      if (!geometry) {
        console.error("No mesh found in OBJ");
        return;
      }
      geometry.computeVertexNormals();
      geometry.center();
      mesh.geometry = geometry;
      mesh.material = material;

      geometry.computeBoundingSphere();
      const bs = geometry.boundingSphere;
      camera.position.set(
        bs.center.x,
        bs.center.y,
        bs.center.z + bs.radius * 2
      );
      camera.lookAt(bs.center);
    },
    (xhr) =>
      console.log(
        `Loading progress: ${((xhr.loaded / xhr.total) * 100).toFixed(1)}%`
      ),
    (err) => console.error("OBJ load error", err)
  );
}

// resize handler\
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const rw = w * asciiScale;
  const rh = h * asciiScale;
  ascii.setSize(rw, rh);
}

window.addEventListener("resize", onResize);

// initial load & resize
loadModel("models/thorn.obj");
onResize();

// Wallpaper Engine listener
if (window.wallpaperPropertyListener) {
  window.wallpaperPropertyListener = {
    applyUserProperties: function (props) {
      if (props.model && typeof props.model.value === "string") {
        loadModel(props.model.value);
      }
      if (props.schemecolor && typeof props.schemecolor.value === "string") {
        const [r, g, b] = props.schemecolor.value.split(" ").map(Number);
        scene.background = new THREE.Color(r, g, b);
      }
      if (props.speed && typeof props.speed.value === "number") {
        rotationSpeed = props.speed.value * 0.01;
      }
      if (props.asciirender && typeof props.asciirender.value === "number") {
        asciiScale = props.asciirender.value;
      }
      onResize();
    },
  };
} else {
  // dev fallback for Vite
  loadModel("models/thorn.obj");
}

// animation loop
function animate() {
  mesh.rotation.z += rotationSpeed;
  ascii.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
