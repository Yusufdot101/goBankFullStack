import {
    checkToken,
    getUserTransfers,
    handleLogout,
    renderTable,
    setupLoginBtns,
    sideMenuEventListeners,
} from "./utils.js";

const transfersTable = document.getElementById("transfersTable");
const errorElem = document.getElementById("error");

sideMenuEventListeners();
setupLoginBtns();
handleLogout();

async function showUsersTransactions() {
    const res = await getUserTransfers();
    const { transfers } = await res.json();
    if (!Array.isArray(transfers)) {
        checkToken();
        errorElem.style.display = "block";
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
            { key: "FromUserID", header: "From User ID" },
            { key: "ToUserID", header: "To User ID" },
            { key: "Amount", header: "Amount" },
        ],
        transfers,
    );
}

showUsersTransactions();
