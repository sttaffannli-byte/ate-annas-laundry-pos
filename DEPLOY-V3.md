# ATE ANNAS LAUNDRY POS V3 — Automatic Online Booking

## What is automatic now
1. Customer submits `/booking.html`.
2. Pages Function saves the request in Cloudflare D1 with status `Received`.
3. The POS checks the cloud inbox every 30 seconds.
4. A new customer and laundry order are created locally with status `Received`.
5. The cloud booking is marked `Imported` to prevent duplicates.

## Important deployment change
Cloudflare dashboard drag-and-drop Direct Upload does not deploy a `/functions` directory.
Deploy this V3 using **Wrangler** or connect the project to **GitHub**.

## One-time setup using Windows PowerShell

### 1. Extract this ZIP and open the extracted folder
Right-click the folder, choose **Open in Terminal**.

### 2. Install Wrangler and log in
```powershell
npm install
npx wrangler login
```

### 3. Create the D1 database
```powershell
npx wrangler d1 create ate-annas-laundry-db
```
Copy the returned `database_id`.

### 4. Edit `wrangler.jsonc`
Replace:
```text
PASTE_YOUR_D1_DATABASE_ID_HERE
```
with the real database ID.

### 5. Create the database table
```powershell
npx wrangler d1 execute ate-annas-laundry-db --remote --file=./schema.sql
```

### 6. Create or reuse a Pages project
```powershell
npx wrangler pages project create ate-annas-laundry-pos-v3
```
Choose the production branch when prompted.

### 7. Set the private admin sync key
Choose a strong private value:
```powershell
npx wrangler pages secret put ADMIN_API_KEY --project-name=ate-annas-laundry-pos-v3
```

### 8. Deploy
```powershell
npx wrangler pages deploy . --project-name=ate-annas-laundry-pos-v3
```

### 9. Configure the POS
Open the deployed POS:
- Login as Admin.
- Open **Online Booking**.
- Enter the exact same `ADMIN_API_KEY` in **Admin sync key**.
- Save.
- Press **Sync Now**.

## Public customer link
```text
https://YOUR-PAGES-DOMAIN/booking.html
```

## Security
- Never share the `ADMIN_API_KEY` with customers.
- Customer submissions are public, but reading/updating the booking inbox requires the key.
- The POS still stores operational orders locally for offline use. The online booking inbox is stored in D1.
