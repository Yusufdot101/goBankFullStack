import {
    handleLogin,
    handleLogout,
    setupLoginBtns,
    sideMenuEventListeners,
} from "./utils.js";

setupLoginBtns();
handleLogout();
sideMenuEventListeners();

const email = document.getElementById("email");
const password = document.getElementById("password");

submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    handleLogin(email, password);
});
