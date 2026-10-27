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

