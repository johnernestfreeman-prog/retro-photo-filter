# Retro Photo Filter

A full-stack web app that applies a retro/vintage color grading filter to uploaded photos, with upload history tracked in a cloud SQL database.

**Repo:** https://github.com/johnernestfreeman-prog/retro-photo-filter

## Features

- Upload any image and apply adjustable brightness and desaturation filters for a retro photo look
- Real-time preview of the filtered result with a one-click download
- Upload history with thumbnails, showing filename, size, filter settings, and timestamp
- Fully containerized with Docker — one command spins up the frontend, backend, and database together
- Cloud-hosted database on Azure SQL

## Tech Stack

**Frontend:** React, TypeScript, Vite
**Backend:** Node.js, Express, TypeScript, Sharp (image processing)
**Database:** Azure SQL Database (SQL Server)
**Infrastructure:** Docker, Docker Compose

## Architecture

┌─────────────┐ ┌──────────────┐ ┌───────────────┐
│ Frontend │─────▶│ Backend │─────▶│ Azure SQL │
│ React/Vite │ │ Express/Sharp│ │ Database │
│ (port 5173)│◀─────│ (port 3001) │◀─────│ │
└─────────────┘ └──────────────┘ └───────────────┘


The backend processes each image in memory using Sharp, applies the retro color grading, saves the result to disk, and logs the upload (filename, size, filter settings, and a reference to the result image) to Azure SQL. The frontend fetches this history and displays thumbnails for past uploads.

## Running Locally

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

1. Clone the repo:
```bash
   git clone https://github.com/johnernestfreeman-prog/retro-photo-filter.git
   cd retro-photo-filter
```

2. Create a `.env` file at the project root with your database credentials:

DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
DB_SERVER=your_sql_server_hostname
DB_NAME=RetroPhotoFilter
DB_ENCRYPT=true


3. Start everything with Docker Compose:
```bash
   docker compose up --build
```

4. Open the app:
   - Frontend: http://localhost:5173
   - Backend health check: http://localhost:3001/health

## Database Schema

```sql
CREATE TABLE FilterHistory (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OriginalFilename NVARCHAR(255) NOT NULL,
    FileSizeBytes INT NOT NULL,
    Brightness FLOAT NOT NULL,
    Desaturation FLOAT NOT NULL,
    ProcessedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
    ResultFilename NVARCHAR(255) NULL
);
```

## Author

**John Freeman**
[GitHub](https://github.com/johnernestfreeman-prog) · [LinkedIn](https://linkedin.com/in/john-ernest-freeman-jr/) · [Portfolio](https://xp-it-helpdesk-windows-portfolio.netlify.app/)