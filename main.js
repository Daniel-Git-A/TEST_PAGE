// ===== UI BUTTON STUFF =====
const button = document.getElementById("coolBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

// ===== BABYLON START =====
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// ===== PROJECTILE SETTINGS (visible + not teleport-fast) =====
const PROJECTILE_SPEED = 0.25;
const PROJECTILE_LIFETIME = 3000; // ms

// ===== PLAYER SETTINGS =====
let camera;
let sceneRef = null;

// Jump
let canJump = false;
const jumpForce = 2.2;

// Sprint
const WALK_SPEED = 0.2;
const SPRINT_SPEED = 0.9;

// Grounded check (raycast)
let isGrounded = false;
const groundRayLength = 1.8;

const createScene = async () => {
  const scene = new BABYLON.Scene(engine);

  // --- Hemi light (soft fill) ---
  const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity = 0.02;

  // --- SPOTLIGHT (rotating) ---
  const spot = new BABYLON.SpotLight(
    "spot",
    new BABYLON.Vector3(10, 5, 10),
    new BABYLON.Vector3(0, -2, 1),
    Math.PI / 2,
    255,
    scene
  );
  spot.intensity = 65.0;
  spot.exponent = 9;

  let lightAngle = 1.05;
  scene.onBeforeRenderObservable.add(() => {
    lightAngle += 0.02;

    spot.position.x = Math.cos(lightAngle) * 10;
    spot.position.z = Math.sin(lightAngle) * 10;

    spot.direction = BABYLON.Vector3.Zero()
      .subtract(spot.position)
      .normalize();
  });

  // --- DIRECTIONAL LIGHT (Sun / Moon) ---
  const sun = new BABYLON.DirectionalLight(
    "sun",
    new BABYLON.Vector3(-2, -3, -2),
    scene
  );
  sun.position = new BABYLON.Vector3(20, 40, 20);
  sun.intensity = 1.4;

  // ===== SHADOWS (Directional light) =====
  const shadowGenerator = new BABYLON.ShadowGenerator(2048, sun);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;
  shadowGenerator.bias = 0.0005;     // reduce acne
  shadowGenerator.normalBias = 0.02; // reduce acne on glTF meshes

  // ===== FPS CAMERA =====
  camera = new BABYLON.UniversalCamera("fpsCamera", new BABYLON.Vector3(0, 2, -5), scene);
  camera.attachControl(canvas, true);

  // IMPORTANT: FPS pointer-lock style mouse look
  camera.inputs.attached.mouse.usePointerLock = true;

  // WASD
  camera.keysUp = [87];    // W
  camera.keysDown = [83];  // S
  camera.keysLeft = [65];  // A
  camera.keysRight = [68]; // D

  camera.speed = WALK_SPEED;
  camera.angularSensibility = 3000;

  // --- GRAVITY + COLLISIONS ---
  scene.gravity = new BABYLON.Vector3(0, -0.45, 0);
  scene.collisionsEnabled = true;

  camera.applyGravity = true;
  camera.checkCollisions = true;

  camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

  // --- LOAD FLOOR GLB ---
  const floorResult = await BABYLON.SceneLoader.ImportMeshAsync(null, "models/", "floor.glb", scene);
  floorResult.meshes.forEach(m => {
    if (m.getTotalVertices && m.getTotalVertices() > 0) {
      m.checkCollisions = true;
      m.isPickable = true;
      m.receiveShadows = true; // ✅ receive shadows
    }
  });

  // Place player above the floor
  camera.position = new BABYLON.Vector3(0, 2, 0);

  // --- LOAD TREE GLB ---
  const treeResult = await BABYLON.SceneLoader.ImportMeshAsync(null, "models/", "tree.glb", scene);

  if (treeResult.meshes && treeResult.meshes[0]) {
    treeResult.meshes[0].position.y = -1.5;
    treeResult.meshes[0].position.x = -2.5;
    treeResult.meshes[0].position.z = 10.5;
  }

  treeResult.meshes.forEach(m => {
    if (m.getTotalVertices && m.getTotalVertices() > 0) {
      m.checkCollisions = true;
      m.isPickable = true;
      shadowGenerator.addShadowCaster(m, true); // ✅ cast shadows
    }
  });

  // --- LOAD EMISSIVE CUBE GLB ---
  const cubeResult = await BABYLON.SceneLoader.ImportMeshAsync(null, "models/", "emissiveCube.glb", scene);

  if (cubeResult.meshes && cubeResult.meshes[0]) {
    cubeResult.meshes[0].position = new BABYLON.Vector3(0, -3, 5);
  }

  cubeResult.meshes.forEach(m => {
    if (m.getTotalVertices && m.getTotalVertices() > 0) {
      m.checkCollisions = true;
      m.isPickable = true;
      shadowGenerator.addShadowCaster(m, true); // ✅ cast shadows
    }
  });

  // --- LOAD MOSSY CUBE GLB ---
  const mossyCube = await BABYLON.SceneLoader.ImportMeshAsync(null, "models/", "mossyCube.glb", scene);

  mossyCube.meshes.forEach(m => {
    if (m.getTotalVertices && m.getTotalVertices() > 0) {
      m.isPickable = true;
      shadowGenerator.addShadowCaster(m, true); // ✅ cast shadows
    }
  });

  //START

    // rockMountain ---
  const rockMountain = await BABYLON.SceneLoader.ImportMeshAsync(null, "models/", "rockMountain.glb", scene);

  if (rockMountain.meshes && rockMountain.meshes[0]) {
    rockMountain.meshes[0].position = new BABYLON.Vector3(0, -3, 17);
  }

  rockMountain.meshes.forEach(m => {
    if (m.getTotalVertices && m.getTotalVertices() > 0) {
      m.checkCollisions = true;
      m.isPickable = true;
      shadowGenerator.addShadowCaster(m, true); // ✅ cast shadows
    }
  });
  //END

  // --- GROUNDED CHECK ---
  scene.onBeforeRenderObservable.add(() => {
    if (!camera) return;

    const origin = camera.position.add(new BABYLON.Vector3(0, -0.9, 0));
    const ray = new BABYLON.Ray(origin, new BABYLON.Vector3(0, -1, 0), groundRayLength);

    const hit = scene.pickWithRay(ray, mesh => mesh && mesh.checkCollisions);
    isGrounded = !!(hit && hit.hit);
    canJump = isGrounded;
  });

  return scene;
};

function shootProjectile(scene) {
  if (!scene || !camera) return;

  console.log("Bullet spawned");

  const bullet = BABYLON.MeshBuilder.CreateSphere("bullet", { diameter: 0.3 }, scene);

  const forward = camera.getForwardRay().direction.normalize();
  bullet.position = camera.position
    .add(forward.scale(1.5))
    .add(new BABYLON.Vector3(0, -0.2, 0));

  const mat = new BABYLON.StandardMaterial("bulletMat", scene);
  mat.emissiveColor = new BABYLON.Color3(1, 0, 0);
  bullet.material = mat;

  // Optional: make bullet cast shadow while it exists
  // (costs a bit; comment out if you don't care)
  // scene.lights.forEach(l => {
  //   // not needed; using directional shadow generator only
  // });

  const velocity = forward.scale(PROJECTILE_SPEED);

  const observer = scene.onBeforeRenderObservable.add(() => {
    const dt = engine.getDeltaTime() / 16.6667;
    bullet.position.addInPlace(velocity.scale(dt));
  });

  setTimeout(() => {
    scene.onBeforeRenderObservable.remove(observer);
    bullet.dispose();
  }, PROJECTILE_LIFETIME);
}

createScene().then(scene => {
  sceneRef = scene;
  console.log("Scene ready:", sceneRef);
  engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());

// ===== KEYBOARD INPUT =====
window.addEventListener("keydown", (event) => {
  console.log("KEY:", event.code);

  if (event.code === "Space") event.preventDefault();

  // Jump
  if (event.code === "Space" && canJump && camera) {
    camera.cameraDirection.y = jumpForce;
    canJump = false;
  }

  // Sprint start
  if ((event.code === "ShiftLeft" || event.code === "ShiftRight") && camera) {
    camera.speed = SPRINT_SPEED;
  }
});

window.addEventListener("keyup", (event) => {
  // Sprint stop
  if ((event.code === "ShiftLeft" || event.code === "ShiftRight") && camera) {
    camera.speed = WALK_SPEED;
  }
});

// ===== MOUSE INPUT =====
canvas.addEventListener("click", () => {
  console.log("CANVAS CLICK");
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
});

document.addEventListener("mousedown", (event) => {
  if (event.button !== 0) return;
  console.log("DOC MOUSEDOWN");

  if (document.pointerLockElement === canvas) {
    console.log("SHOOTING");
    shootProjectile(sceneRef);
  } else {
    console.log("Not locked yet — click the canvas once first.");
  }
});

// ===== UI BUTTONS =====
if (button) {
  button.addEventListener("click", () => {
    button.textContent = "CLICKED";
    button.classList.add("clicked");

    setTimeout(() => {
      button.textContent = "CLICK ME";
      button.classList.remove("clicked");
    }, 800);
  });
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) canvas.requestFullscreen();
    else document.exitFullscreen();
  });
}
