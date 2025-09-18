import {
    checkToken,
    getUserLoans,
    handleLogout,
    renderTable,
    setupLoginBtns,
    sideMenuEventListeners,
} from "./utils.js";

const loansTable = document.getElementById("loansTable");
const errorElem = document.getElementById("error");

setupLoginBtns();
handleLogout();
sideMenuEventListeners();

async function showUsersLoans() {
    const res = await getUserLoans();
    const { loans } = await res.json();
    if (!Array.isArray(loans)) {
        checkToken();
        errorElem.style.display = "block";
        errorElem.innerText = "No Loans";
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
            { key: "Amount", header: "Amount" },
            { key: "DailyInterestRate", header: "Daily Interest %" },
        ],
        loans,
    );
}

showUsersLoans();
