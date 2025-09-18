import {
    checkToken,
    getUserLoanRequests,
    handleLogout,
    renderTable,
    setupLoginBtns,
    sideMenuEventListeners,
} from "./utils.js";

const loanRequestsTable = document.getElementById("loanRequestsTable");
const errorElem = document.getElementById("error");

setupLoginBtns();
handleLogout();
sideMenuEventListeners();

async function showUserLoanRequests() {
    const res = await getUserLoanRequests();
    const { loan_requests } = await res.json();
    if (!Array.isArray(loan_requests)) {
        checkToken();
        errorElem.style.display = "block";
        errorElem.innerText = "No Loan Requests";
        return;
    }
    renderTable(
        loanRequestsTable,
        [
            { key: "ID", header: "ID" },
            {
                key: "CreatedAt",
                header: "Date",
                render: (t) => new Date(t.CreatedAt).toDateString(),
            },
            { key: "Amount", header: "Amount" },
            { key: "DailyInterestRate", header: "Daily Interest %" },
            { key: "Status", header: "Status" },
        ],
        loan_requests,
    );
}

showUserLoanRequests();
