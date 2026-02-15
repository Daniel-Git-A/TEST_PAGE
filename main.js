const button = document.getElementById("coolBtn");


const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 2,
    5,
    BABYLON.Vector3.Zero(),
    scene
);
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
);

const box = BABYLON.MeshBuilder.CreateBox("box", {}, scene);

engine.runRenderLoop(() => {
    scene.render();
});


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
