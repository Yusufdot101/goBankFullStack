import {
    checkToken,
    handleLogout,
    setupLoginBtns,
    sideMenuEventListeners,
} from "./utils.js";

setupLoginBtns();
handleLogout();
sideMenuEventListeners();

const submitBtn = document.getElementById("submitBtn");
const errorElem = document.getElementById("error");

const amount = document.getElementById("amount");

const API_URL = "http://localhost:8080/v1";

submitBtn.addEventListener("click", async (e) => {
    // for some reason it wont work if i remove this, i get:
    // Uncaught (in promise) TypeError: NetworkError when attempting to fetch resource.
    e.preventDefault();
    const token = localStorage.getItem("token");
    let res = await fetch(`${API_URL}/loans/get`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            amount: +amount.value,
        }),
    });
    const data = await res.json();
    if (data.error != null) {
        checkToken();
        errorElem.innerText = "";
        errorElem.style.display = "block";
        for (const key in data.error) {
            errorElem.innerText =
                errorElem.innerText + `${key}: ${data.error[key]}` + "\n";
        }
        return;
    } else if (!res.ok) {
        alert(
            "An error occured and your transfer did not go through, please try again",
        );
        return;
    }

    window.location.href = "loan-requests.html";
});
