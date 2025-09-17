import { handleLogout, setupLoginBtns } from "./utils.js";

setupLoginBtns();
handleLogout();

const hamburgerMenu = document.getElementById("hamburgerMenu");
const sideMenu = document.getElementById("sideMenu");

hamburgerMenu.addEventListener("click", () => {
    console.log("here");
    sideMenu.classList.toggle("hidden");
    hamburgerMenu.classList.toggle("activated");
});
const home = document.getElementById("home");

function showHome() {
    home.innerText = "Welcome To YM Bank";
}

showHome();
