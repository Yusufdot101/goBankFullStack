# GoBank 🏦

GoBank is a simple banking application where users can register, transfer money, request loans, and perform other basic banking operations. Some actions are restricted based on user permissions.

---

## Features ✨

- **Register / Login** – Create an account and securely log in.
- **Transfer Money** – Send funds between accounts.
- **Request Loans** – Users can request loans for approval.
- **Permission-Based Actions** – Certain operations are restricted to authorized users.

---

## Setup ⚙️

Make sure you have **Docker** installed. Then, in your project directory, run:

```bash
docker compose up --build
```

## Usage 🚀

1.  Open your browser and go to: http://localhost:3001
2.  Use the hamburger menu in the navigation to access different features.
3.  To manage user permissions (roles), run PostgreSQL commands:

```
psql -h localhost -p 5433 -U myuser -d bankdb
```

and update roles/permissions and account activation as needed.

## Contributing 🤝

Contributions are welcome! Fork the repo and open a pull request with your improvements

## License 📄

This project is licensed under the [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
