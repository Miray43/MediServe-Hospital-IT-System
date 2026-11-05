# MediServe – Hospital IT Maintenance & Ticketing System

MediServe is a web system for a hospital's technical-support team. It tracks the hospital's IT devices (PCs, printers, scanners) across departments and floors, and manages maintenance and support tickets for them from start to finish.

> 👥 **Team project.** I worked on it as a full-stack developer, across the frontend, the Express/MySQL backend and the database. The original team repository is [Miray43/Mediserve](https://github.com/Miray43/Mediserve). This repo is a cleaned-up portfolio version: secrets removed, setup documented.

## Features

- **Device management**: register devices with their specifications (CPU, RAM, OS, processor generation, model) per department.
- **Maintenance workflows**
  - *Regular*: scheduled preventive maintenance with checklists.
  - *General*: ad-hoc fault reports by device type and problem.
  - *External*: maintenance handled by outside vendors.
- **Tickets**: internal and external tickets, with auto-generated ticket numbers, file attachments and digital signatures.
- **Reports**: new, periodic and detailed reports, with search, filters and status updates.
- **Dashboard**: maintenance statistics and summaries for the last four months.
- **Configurable lookups**: admins can add or edit departments, device models, problem types and specs from the UI.

## Tech Stack

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | HTML, CSS, vanilla JavaScript                |
| Backend  | Node.js, Express                             |
| Database | MySQL (`mysql2`)                             |
| Uploads  | Multer (attachments & signatures)            |

## Project Structure

```
├── authintication/AuthPage   # Login & password pages
├── Home/                     # Landing page
├── Technical Support/
│   ├── Dashboard/            # Stats dashboard
│   ├── Maintenance/          # Regular / General / External maintenance
│   ├── Reports/              # Report creation, search & details
│   └── Tickets/              # Internal & external tickets
├── profile/                  # User profile
├── icon/                     # UI icons
└── hospital-training/
    └── backend/
        ├── server.js         # Express REST API (~50 endpoints)
        └── db.js             # MySQL connection
```

## Getting Started

1. **Install dependencies**
   ```bash
   cd hospital-training
   npm install
   ```
2. **Configure the database**: copy `backend/.env.example` to `backend/.env` and fill in your MySQL credentials.
3. **Run the API**
   ```bash
   npm start        # or: npm run dev
   ```
   The API runs at `http://localhost:5050`.
4. **Open the frontend**: open `authintication/AuthPage/Login.html` in a browser, or serve the root folder with any static server (e.g. VS Code Live Server).

## Author

**Mira Alharbi**: Full-stack developer (team project)

<!-- Paste this section into README.md after "Features", and replace step 2 of "Getting Started" with the version below. -->

## Authentication and roles

The API uses **bcrypt** password hashing, **JWT** bearer tokens and **role checks**.

| Role | Can do |
|---|---|
| `viewer` | Read data (all `GET` routes) |
| `engineer` | Read, plus create and update maintenance reports, tickets and devices |
| `admin` | Everything, including the configurable lookup tables (departments, device models, problem types, specs) and changing user roles |

- `POST /auth/signup` with `{ user_name, email, password }` creates an account. The password is stored only as a
  bcrypt hash (12 rounds) in the `app_users` table, which the server creates on start-up.
  New accounts are `viewer`. The **first account ever created becomes `admin`**, so create it yourself right after setup.
- `POST /auth/login` with `{ email, password }` returns `{ token, user }`. Tokens expire after 8 hours (`JWT_EXPIRES_IN`).
- Send `Authorization: Bearer <token>` on every other request. Missing or invalid tokens get `401`, wrong role gets `403`.
- `PUT /auth/users/:id/role` with `{ "role": "engineer" }` (admin only) promotes or demotes a user.
- `GET /auth/me` returns the current user.

Known limits: files in `/uploads` are still served without a login (the browser opens them by direct link),
anyone can sign up (as a read-only `viewer`; an admin promotes others), and password reset is not implemented.
Login and signup are rate limited (10 attempts per 15 minutes per IP). Tested against a real MariaDB (MySQL-compatible) database: signup, login, wrong password, duplicate email, token tampering, role checks (viewer blocked from writes, admin-only role changes) and the rate limit.

### Getting Started (updated step 2)

2. **Configure the environment**: copy `backend/.env.example` to `backend/.env`, fill in your MySQL credentials and set
   `JWT_SECRET` to a long random string (the server refuses to start without one):
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

Frontend: `authintication/AuthPage/Login.html` now calls the signup and login endpoints and stores the token in
`sessionStorage`. Every page that calls the API must load `authintication/auth-client.js` (it adds the token to requests):
```html
<script src="/authintication/auth-client.js"></script>
```
