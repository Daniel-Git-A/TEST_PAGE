const button = document.getElementById("coolBtn");


// BABYLON SHIT START
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async () => {
    const scene = new BABYLON.Scene(engine);

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2.5,
        5,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);

    // Light
    new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );

    // Load GLB
    await BABYLON.SceneLoader.AppendAsync(
        "models/",      // folder
        "tree.glb",    // file name
        scene
    );

    return scene;
};

createScene().then(scene => {
    engine.runRenderLoop(() => {
        scene.render();
    });
});

window.addEventListener("resize", () => {
    engine.resize();
});

// BABYLON SHIT END

var clickMe = function() {
    console.log("Button clicked!");
}
var popUp = function() {
    alert("Button clicked!");
}




button.addEventListener("click", () => {
  button.textContent = "CLICKED";

  button.classList.add("clicked");

  setTimeout(() => {
    button.textContent = "CLICK ME";
    button.classList.remove("clicked");
  }, 800);
});
