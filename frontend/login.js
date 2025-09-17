import { handleLogin, handleLogout, setupLoginBtns } from "./utils.js";

const logout = document.getElementById("logout");
setupLoginBtns();
handleLogout();

const email = document.getElementById("email");
const password = document.getElementById("password");

submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    handleLogin(email, password);
});
