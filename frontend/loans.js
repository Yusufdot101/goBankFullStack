import {
    getUserLoans,
    handleLogout,
    renderTable,
    setupLoginBtns,
} from "./utils.js";

const loansTable = document.getElementById("loansTable");

setupLoginBtns();
handleLogout();

const hamburgerMenu = document.getElementById("hamburgerMenu");
const sideMenu = document.getElementById("sideMenu");

hamburgerMenu.addEventListener("click", () => {
    sideMenu.classList.toggle("hidden");
    hamburgerMenu.classList.toggle("activated");
});

async function showUsersLoans() {
    const res = await getUserLoans();
    const { loans } = await res.json();
    if (!Array.isArray(loans)) {
        errorElem.innerText = "No Transactions";
        return;
    }
    renderTable(
        loansTable,
        [
            { key: "ID", header: "ID" },
            {
                key: "CreatedAt",
                header: "Date",
                render: (t) => new Date(t.CreatedAt).toDateString(),
            },
            { key: "ToUserID", header: "To User ID" },
            { key: "Amount", header: "Amount" },
        ],
        loans,
    );
}

showUsersLoans();
