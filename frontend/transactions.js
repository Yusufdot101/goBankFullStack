import {
    getUserTransactions,
    handleLogout,
    renderTable,
    setupLoginBtns,
} from "./utils.js";

const transactionsTable = document.getElementById("transactionsTable");

setupLoginBtns();
handleLogout();

const hamburgerMenu = document.getElementById("hamburgerMenu");
const sideMenu = document.getElementById("sideMenu");

hamburgerMenu.addEventListener("click", () => {
    console.log("here");
    sideMenu.classList.toggle("hidden");
    hamburgerMenu.classList.toggle("activated");
});

async function showUsersTransactions() {
    const res = await getUserTransactions();
    const { transactions } = await res.json();
    if (!Array.isArray(transactions)) {
        errorElem.innerText = "No Transactions";
        return;
    }
    renderTable(
        transactionsTable,
        [
            { key: "ID", header: "ID" },
            {
                key: "CreatedAt",
                header: "Date",
                render: (t) => new Date(t.CreatedAt).toDateString(),
            },
            { key: "Amount", header: "Amount" },
            { key: "Action", header: "Action" },
            { key: "PerformedBy", header: "Performed By" },
        ],
        transactions,
    );
}

showUsersTransactions();
