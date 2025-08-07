// index.js
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";

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
camera.position.set(0, 0, 2);

// — Renderer + ASCIIEffect
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const ascii = new AsciiEffect(
  renderer,
  " .,:;-~!*=#$@", // charset
  { invert: true, resolution: 0.25 }
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

// — OBJ Loader & “shaded” material
const loader = new OBJLoader();
const material = new THREE.MeshStandardMaterial();
material.flatShading = true;
material.side = THREE.DoubleSide;
let currentModel = null;

function loadModel(path) {
  if (path === currentModel) return;
  currentModel = path;
  console.log("Loading OBJ →", path);
  loader.load(
    path,
    (object) => {
      // find the first mesh in the hierarchy
      let geometry = null;
      object.traverse((child) => {
        if (child.isMesh && !geometry) {
          geometry = child.geometry;
        }
      });
      if (!geometry) {
        console.error("No mesh found in OBJ");

        return;
      }

      // exactly as before
      geometry.computeVertexNormals(); // smooth normals
      geometry.center();

      mesh.geometry = geometry;
      mesh.material = material;

      // recompute bounding sphere after centering
      geometry.computeBoundingSphere();
      const bs = geometry.boundingSphere;

      // Frame the camera on the model
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
    (err) => {
      console.error("OBJ load error", err);

      // // Fallback: load a default model if the specified one fails
      // if (path !== "models/thorn.obj") {
      //   console.warn("Loading default model instead.");
      //   loadModel("models/thorn.obj");
      // }
    }
  );
}

loadModel("models/thorn.obj");

window.wallpaperPropertyListener = {
  applyUserProperties: function (props) {
    // props.key.value matches your JSON "key" property
    if (props.key && typeof props.key.value === "string") {
      loadModel(props.key.value);
    }

    // if you also want to read the color chooser:
    if (props.schemecolor && typeof props.schemecolor.value === "string") {
      const [r, g, b] = props.schemecolor.value
        .split(" ")
        .map((v) => Math.round(Number(v) * 255)); // WallpaperEngine gives 0–1 floats
      // e.g. apply to background, material, etc.
      scene.background = new THREE.Color(r / 255, g / 255, b / 255);
    }
  },
};

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
