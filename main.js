const button = document.getElementById("coolBtn");


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
