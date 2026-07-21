# ATE ANNAS LAUNDRY POS V2

Complete one-upload Cloudflare Pages build.

## Version 2.4 New Feature
- Public customer online booking page
- Pickup only, delivery only, or pickup and delivery
- Customer address, schedule, service, quantity and notes
- Estimated amount and minimum pickup display
- Booking request code
- Direct WhatsApp booking request
- Share and copy public booking link from Back Office
- Configurable WhatsApp number and service area

Important: this version sends the online request through WhatsApp. It does not automatically insert the request into the POS database yet. Automatic multi-device booking inbox requires the next Cloudflare D1 backend phase.

## Version 2.3 New Feature
- Tablet-ready larger touch controls
- Responsive portrait and landscape layouts
- Live ONLINE indicator with blinking green pulse
- Live OFFLINE indicator with blinking red light
- Offline warning banner
- Continues working from local tablet storage
- Install-on-tablet support when available
- Updated offline cache version

## Version 2.2 New Feature
- Beautiful live Kanban order tracker
- One-tap status movement
- Rush and VIP priority tags
- Back/forward workflow controls
- Searchable order board
- Improved glass-style professional UI

## Version 2.1 New Feature
- Professional dashboard
- Live order status board
- Due-soon and overdue alerts
- Ready-for-release counter
- Recent orders quick access

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
