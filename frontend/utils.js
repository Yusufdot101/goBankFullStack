const logout = document.getElementById("logout");
const login = document.getElementById("login");
const sideMenuLogout = document.getElementById("sideMenuLogout");
const sideMenuLogin = document.getElementById("sideMenuLogin");

export async function setupLoginBtns() {
    const sessionStatus = localStorage.getItem("status");
    if (sessionStatus == "loggedIn") {
        login.style.display = "none";
        sideMenuLogin.style.display = "none";
        logout.style.display = "block";
        sideMenuLogout.style.display = "block";
    } else {
        logout.style.display = "none";
        sideMenuLogout.style.display = "none";
        login.style.display = "block";
        sideMenuLogin.style.display = "block";
    }
}

const API_URL = "http://localhost:8080/v1";

export function renderTable(tableElem, columns, data) {
    tableElem.innerHTML = "";

    // header
    const headerRow = document.createElement("tr");
    columns.forEach((col) => {
        const th = document.createElement("th");
        th.innerText = col.header;
        headerRow.appendChild(th);
    });
    tableElem.appendChild(headerRow);

    // rows
    data.forEach((item) => {
        const row = document.createElement("tr");
        columns.forEach((col) => {
            const td = document.createElement("td");
            td.innerText =
                typeof col.render === "function"
                    ? col.render(item)
                    : item[col.key];
            row.appendChild(td);
        });
        tableElem.appendChild(row);
    });
}

export async function getUserTransfers() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/users/transfers`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: token }),
    });
    return res;
}

export async function getUserLoanRequests() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/users/loanrequests`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: token }),
    });
    return res;
}

export async function getUserLoans() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/users/loans`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: token }),
    });
    return res;
}

export async function getUserTransactions() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/users/transactions`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: token }),
    });
    return res;
}

export async function handleLogout() {
    const token = localStorage.getItem("token");
    logout.addEventListener("click", async () => {
        const res = await fetch(`${API_URL}/tokens/deactivate`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ token: token }),
        });
        const data = await res.json();
        console.log(data);
        if (res.ok) {
            localStorage.setItem("status", "notLoggedIn");
            localStorage.removeItem("token");
            window.location.replace("/index.html");
        } else {
            alert("an error occured, please try again later");
        }
    });
}

export async function handleLogin(email, password) {
    const errorElem = document.getElementById("error"); // for displaying the errors
    const res = await fetch(`${API_URL}/tokens/authorization`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: email.value,
            password: password.value,
        }),
    });
    const data = await res.json();
    const error = data.error;
    if (error != null) {
        errorElem.style.display = "block";
        errorElem.innerText = error;
    } else {
        errorElem.style.display = "none";
        localStorage.setItem("token", data.token);
        localStorage.setItem("status", "loggedIn");
        logout.style.display = "block";
        window.location.replace("/index.html");
    }
}
