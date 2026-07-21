# ATE ANNAS LAUNDRY POS V2

Complete one-upload Cloudflare Pages build.

## Included
- Admin and Cashier login
- Touchscreen-friendly laundry order entry
- Customer records
- Per-kilo, per-piece and flat-rate services
- Wash, dry, fold, ironing, comforter and delivery services
- Received and due date
- Pickup and delivery address
- Order status: Received, Washing, Drying, Folding, Ready, Released
- Partial payments and remaining balance
- Cash, GCash and Bank Transfer
- Reference number validation
- Claim stub and printing
- Expenses
- Daily reports
- Backup and restore
- Offline-ready service worker
- F5-safe Cloudflare Pages routing

## Default login
- Admin: `admin` / `1234`
- Cashier: `cashier` / `0000`

## Upload
Extract the ZIP and upload all files to the root of the GitHub repository connected to the laundry Cloudflare Pages project.

Cloudflare Pages:
- Production branch: `main`
- Framework preset: `None`
- Build command: blank
- Build output directory: `.`

This first release stores data in browser localStorage. Use Settings > Download Backup regularly.
