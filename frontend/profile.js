import {
    checkToken,
    handleLogout,
    setupLoginBtns,
    sideMenuEventListeners,
} from "./utils.js";

setupLoginBtns();
handleLogout();
sideMenuEventListeners();

const errorElem = document.getElementById("error");

const API_URL = "http://localhost:8080/v1";

async function showUserDetails() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/users/get`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: token }),
    });
    const data = await res.json();
    console.log(data.user);
    if (data.error != null) {
        checkToken();
        errorElem.innerText = "";
        errorElem.style.display = "block";
        if (typeof data.error === "string") {
            errorElem.innerText = data.error;
            return;
        }
        for (const key in data.error) {
            errorElem.innerText =
                errorElem.innerText + `${key}: ${data.error[key]}` + "\n";
        }
        return;
    } else if (!res.ok) {
        alert("An error occured, please try again");
        return;
    }
    document.getElementById("details").style.display = "table";
    document.getElementById("accountID").innerText = data.user.id;
    document.getElementById("accountCreatedAt").innerText = new Date(
        data.user.created_at,
    ).toDateString();
    document.getElementById("name").innerText = data.user.name;
    document.getElementById("email").innerText = data.user.email;
    document.getElementById("accountBalance").innerText =
        data.user.account_balance;
    document.getElementById("accountActivated").innerText = data.user.activated;
}

showUserDetails();
