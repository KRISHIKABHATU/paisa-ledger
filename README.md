# Paisa Ledger

Personal finance app for India: salary planner, emergency fund, income, expenses, stocks, mutual funds, PPF,
Sukanya Samriddhi, insurance, ULIP, 80C, capital gains and an ITR-3 helper for F&O and intraday traders, with Excel import and export.

Portfolio (Invest → Portfolio): several switchable portfolios, edit holdings, record buys and sales, update prices, sector targets, cash tracker, Excel import and export.

Open the app: https://krishikabhatu.github.io/paisa-ledger/

All data stays on the user's own device.

© 2026 krishikabhatu2018. All rights reserved. See LICENSE.
This is not open-source software. Copying or reusing the code or design is not permitted.

## Project files

- `index.html` – page layout (screens, forms, tabs)
- `css/styles.css` – all styling, light and dark mode
- `js/app.js` – main app logic (entries, plan, investments, tax, accounts, import, backup, lock, Drive sync)
- `portfolio.js` – Portfolio module
- `sw.js` – offline support; bump `CACHE` (e.g. `paisa-ledger-v15`) on every release
- `xlsx.full.min.js` – SheetJS library for Excel import/export (do not edit)

Data is stored in the browser's localStorage under keys starting with `pl_`. Never rename these keys, or existing users will lose their data.
