# Talent Hunt Offer Booking Platform

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=111)
![ASP.NET Core](https://img.shields.io/badge/Backend-ASP.NET%20Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Status](https://img.shields.io/badge/Status-Hackathon%20MVP-16A34A?style=for-the-badge)

## Project Report

### 1. Project Overview

Talent Hunt Offer Booking Platform is a full-stack web application for discovering, managing, and booking limited-time local business offers. It is designed for businesses such as gyms, restaurants, salons, clinics, coaching centers, and sports turfs that want to publish time-based offers with controlled slot capacity.

The platform supports two main experiences:

- customers can browse offers, filter deals, view slots, and place bookings
- business owners and admins can manage businesses, offers, slots, bookings, and dashboard analytics

The project was built as a practical MVP with a clean frontend, a structured backend API, and a relational database model that keeps offers, slots, and bookings consistent.

---

### 2. Video Demo

**Demo Video Link:** _Add your final video link here_

Example format:

```text
https://your-video-demo-link.com
```

---

### 3. Problem Statement

Many local businesses run short-term offers, but they usually manage bookings manually through phone calls, messages, spreadsheets, or walk-ins. This creates common problems:

- customers do not know which slots are actually available
- businesses cannot easily control booking capacity
- offer details are scattered across multiple channels
- owners have no simple dashboard for bookings and performance
- admins cannot monitor the overall platform in one place

This project solves that by giving businesses a simple digital offer booking system with live slot capacity and structured booking records.

---

### 4. Proposed Solution

The platform provides a centralized booking flow:

1. A business owner registers or logs in.
2. The owner creates a business profile.
3. The owner publishes offers with pricing, dates, terms, and capacity.
4. Slots are created for specific dates and times.
5. Customers browse and book available slots.
6. The backend validates capacity and booking limits.
7. Dashboard analytics summarize offers, bookings, seats, and conversion.

This keeps the product simple enough for a hackathon MVP while still following real-world business logic.

---

### 5. Key Features

#### Customer Features

- Browse active offers from multiple business categories
- Filter offers by business type, category, date, price, and availability
- View offer details, discount, terms, and available slots
- Book slots with customer details and people count
- Receive a unique booking reference

#### Business/Admin Features

- Admin and business owner login
- Business profile management
- Offer creation and update flow
- Slot creation with date, time, and capacity
- Booking list and booking status management
- Dashboard summary for platform activity

#### Platform Features

- PostgreSQL relational database
- Entity Framework Core migrations
- Seeded demo data for quick evaluation
- Swagger API documentation in development
- Responsive React frontend
- Clean folder separation between frontend, backend, and docs

---

### 6. Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Styling | CSS, responsive custom UI |
| UI/Icons | Lucide React, Framer Motion, Recharts |
| Backend | ASP.NET Core 8 Minimal API |
| ORM | Entity Framework Core |
| Database | PostgreSQL |
| API Docs | Swagger |
| Tooling | npm, .NET CLI |

---

### 7. System Architecture

```text
Customer / Admin Browser
        |
        v
React + TypeScript Frontend
        |
        v
ASP.NET Core Backend API
        |
        v
Entity Framework Core
        |
        v
PostgreSQL Database
```

The frontend communicates with the backend through REST API endpoints. The backend handles validation, business rules, persistence, and dashboard aggregation. PostgreSQL stores users, businesses, offers, slots, and bookings.

---

### 8. Repository Structure

```text
talent-hunt-booking/
|
|-- Backend/
|   |-- Data/
|   |-- DTOs/
|   |-- Extensions/
|   |-- Helpers/
|   |-- Migrations/
|   |-- Models/
|   |-- Seed/
|   |-- Services/
|   |-- Validators/
|   |-- Program.cs
|   `-- Backend.csproj
|
|-- Frontend/
|   |-- public/
|   |-- src/
|   |   |-- app/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- services/
|   |   |-- styles/
|   |   `-- theme/
|   |-- package.json
|   `-- vite.config.ts
|
|-- docs/
|   `-- database/
|       |-- ER_Diagram.svg
|       |-- relational_schema.md
|       `-- database_explanation.md
|
|-- .env.example
|-- .gitignore
`-- README.md
```

---

### 9. Database Design

The database is built around five main tables:

- `users` stores platform admins and business owners
- `businesses` stores business profile information
- `offers` stores discount campaigns published by businesses
- `offer_slots` stores bookable time windows under each offer
- `bookings` stores customer reservations

#### ER Diagram

![Database ER Diagram](docs/database/ER_Diagram.svg)

More database details are available here:

- [Relational Schema](docs/database/relational_schema.md)
- [Database Explanation](docs/database/database_explanation.md)

---

### 10. Main Backend API Modules

| Area | Purpose |
| --- | --- |
| Auth | Login and business owner registration |
| Business | Create, list, and update business profiles |
| Offers | Create, update, delete, and filter offers |
| Slots | Manage offer slot capacity and timing |
| Bookings | Create bookings and update booking status |
| Dashboard | Show platform summary and recent bookings |

---

### 11. Booking Flow

```text
Customer selects offer
        |
Customer chooses available slot
        |
Customer submits booking details
        |
Backend validates offer, slot, capacity, and customer limit
        |
Booking is created
        |
Slot booked count is updated
        |
Dashboard reflects latest booking data
```

Important booking rules:

- expired or inactive offers cannot be booked
- full slots cannot be booked
- people count cannot exceed available capacity
- customer phone number is checked against offer booking limits
- cancelled bookings release slot capacity back into availability

---

### 12. Demo Accounts

The backend seeds demo users for quick testing.

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `admin@willovate.demo` | `Admin@123` |
| Gym Owner | `gym@willovate.demo` | `Owner@123` |
| Restaurant Owner | `restaurant@willovate.demo` | `Owner@123` |
| Salon Owner | `salon@willovate.demo` | `Owner@123` |
| Clinic Owner | `clinic@willovate.demo` | `Owner@123` |
| Turf Owner | `turf@willovate.demo` | `Owner@123` |
| Coaching Owner | `coaching@willovate.demo` | `Owner@123` |

---

### 13. Local Setup

#### Prerequisites

- Node.js
- npm
- .NET 8 SDK
- PostgreSQL database

#### 1. Clone the repository

```bash
git clone <your-repository-url>
cd talent-hunt-booking
```

#### 2. Configure environment variables

Create a frontend environment file from the example:

```bash
cd Frontend
cp ../.env.example .env
```

Update `VITE_API_URL` if your backend runs on a different port.

For the backend, configure the PostgreSQL connection string in `Backend/appsettings.Development.json` or through environment variables.

Example connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=BookingDb;Username=postgres;Password=yourpassword"
  }
}
```

#### 3. Run the backend

```bash
cd Backend
dotnet restore
dotnet run
```

The backend applies migrations and seeds demo data on startup.

Swagger is available in development mode at:

```text
https://localhost:<backend-port>/swagger
```

#### 4. Run the frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

---

### 14. How to Use the Application

#### Customer Flow

1. Open the frontend.
2. Browse available offers.
3. Use filters to narrow down offers.
4. Open an offer detail view.
5. Select a slot.
6. Enter booking details.
7. Submit the booking.

#### Admin/Owner Flow

1. Login with a seeded demo account.
2. View dashboard metrics.
3. Create or manage offers.
4. Add and update slots.
5. Monitor bookings.
6. Update booking status when needed.

---

### 15. Project Highlights

- Full-stack implementation with real backend persistence
- Clean relational database design
- Practical booking capacity logic
- Admin dashboard with visual analytics
- Seed data for quick judging and testing
- Beginner-friendly structure and documentation
- Suitable for hackathon demo, recruiter review, and future extension

---

### 16. Future Improvements

- JWT-based authentication
- Payment gateway integration
- Email/SMS booking confirmation
- Business owner approval workflow
- Customer booking lookup by reference number
- Offer image upload support
- Deployment to cloud hosting
- Automated backend and frontend tests

---

### 17. Conclusion

Talent Hunt Offer Booking Platform is a polished MVP for local offer discovery and slot-based booking. It demonstrates full-stack development, database design, API development, frontend UI work, and practical business-rule handling in one cohesive project.

The codebase is intentionally structured to be easy to understand, easy to present, and ready for final GitHub submission.
