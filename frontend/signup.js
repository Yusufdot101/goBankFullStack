import {
    handleLogin,
    handleLogout,
    setupLoginBtns,
    sideMenuEventListeners,
} from "./utils.js";

setupLoginBtns();
handleLogout();
sideMenuEventListeners();

const submitBtn = document.getElementById("submitBtn");
const errorElem = document.getElementById("error");

const fullName = document.getElementById("name");
const email = document.getElementById("email");
const password = document.getElementById("password");

const API_URL = "http://localhost:8080/v1";

submitBtn.addEventListener("click", async (e) => {
    // for some reason it wont work if i remove this, i get:
    // Uncaught (in promise) TypeError: NetworkError when attempting to fetch resource.
    e.preventDefault();
    let res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: fullName.value,
            email: email.value,
            password: password.value,
        }),
    });

    const data = await res.json();
    if (data.error != null) {
        errorElem.innerText = "";
        errorElem.style.display = "block";
        for (const key in data.error) {
            errorElem.innerText =
                errorElem.innerText + `${key}: ${data.error[key]}` + "\n";
        }
    } else {
        // login in the user, cause having to login in after signing up is a pain
        handleLogin(email, password);
        alert(
            "Signed up successfully. Please follow the instructions sent to your email to activate your account",
        );
    }
});
