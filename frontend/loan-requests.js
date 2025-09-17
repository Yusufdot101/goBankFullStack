import {
    getUserLoanRequests,
    handleLogout,
    renderTable,
    setupLoginBtns,
} from "./utils.js";

const loanRequestsTable = document.getElementById("loanRequestsTable");

setupLoginBtns();
handleLogout();

const hamburgerMenu = document.getElementById("hamburgerMenu");
const sideMenu = document.getElementById("sideMenu");

hamburgerMenu.addEventListener("click", () => {
    sideMenu.classList.toggle("hidden");
    hamburgerMenu.classList.toggle("activated");
});

async function showUserLoanRequests() {
    const res = await getUserLoanRequests();
    const { loan_requests } = await res.json();
    if (!Array.isArray(loan_requests)) {
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
        ],
        loan_requests,
    );
}

showUserLoanRequests();
