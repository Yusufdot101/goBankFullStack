import {
    handleLogout,
    setupLoginBtns,
    sideMenuEventListeners,
} from "./utils.js";

setupLoginBtns();
handleLogout();
sideMenuEventListeners();

const content = document.getElementById("content");
function showHome() {
    content.innerText = "Welcome To YM Bank";
}

showHome();
