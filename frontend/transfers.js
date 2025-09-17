import {
    getUserTransfers,
    handleLogout,
    renderTable,
    setupLoginBtns,
} from "./utils.js";

const transfersTable = document.getElementById("transfersTable");

setupLoginBtns();
handleLogout();

const hamburgerMenu = document.getElementById("hamburgerMenu");
const sideMenu = document.getElementById("sideMenu");

hamburgerMenu.addEventListener("click", () => {
    sideMenu.classList.toggle("hidden");
    hamburgerMenu.classList.toggle("activated");
});

async function showUsersTransactions() {
    const res = await getUserTransfers();
    const { transfers } = await res.json();
    if (!Array.isArray(transfers)) {
        errorElem.innerText = "No Transactions";
        return;
    }
    renderTable(
        transfersTable,
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
        transfers,
    );
}

showUsersTransactions();
