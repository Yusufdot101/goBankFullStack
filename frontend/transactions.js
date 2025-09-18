import {
    checkToken,
    getUserTransactions,
    handleLogout,
    renderTable,
    setupLoginBtns,
    sideMenuEventListeners,
} from "./utils.js";

const transactionsTable = document.getElementById("transactionsTable");
const errorElem = document.getElementById("error");

setupLoginBtns();
handleLogout();
sideMenuEventListeners();

async function showUsersTransactions() {
    const res = await getUserTransactions();
    const { transactions } = await res.json();
    if (!Array.isArray(transactions)) {
        checkToken();
        errorElem.style.display = "block";
        errorElem.innerText = "No Transactions";
        // check if the token expired
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
