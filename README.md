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

**Demo Video:** [Watch the project demo](https://drive.google.com/file/d/10S3jAZtj6-iSg9DLiIPffBeuWzRmFz1K/view?usp=sharing)

---

### Screenshots Walkthrough

The screenshots below show the project flow from customer browsing to admin control, backend API quality, and database design.

#### 1. Offer Marketplace Overview

![Offer Marketplace Overview](screenshots/Screenshot%202026-05-24%20230209.png)

The marketplace landing view presents the active local offers, available seats, navigation sidebar, and a clear entry point for creating new offers.

#### 2. Offer Filters and Deal Cards

![Offer Filters and Deal Cards](screenshots/Screenshot%202026-05-24%20230221.png)

Users can filter offers by business type, category, availability, date, price range, and sorting preference. Each offer card highlights discount, business name, location, description, and price.

#### 3. Admin Login

![Admin Login](screenshots/Screenshot%202026-05-24%20230403.png)

The admin login screen supports platform admin access and business-owner access, with demo credentials visible for quick hackathon evaluation.

#### 4. Dashboard Summary

![Dashboard Summary](screenshots/Screenshot%202026-05-24%20230418.png)

The dashboard gives admins a quick view of total offers, active offers, bookings, revenue, conversion, and available seat capacity.

#### 5. Analytics and Performance Tracking

![Analytics and Performance Tracking](screenshots/Screenshot%202026-05-24%20230428.png)

The analytics area shows booking demand, category distribution, expiring offers, and top-performing offers by booked seats.

#### 6. Business Profile and Recent Activity

![Business Profile and Recent Activity](screenshots/Screenshot%202026-05-24%20230438.png)

Business owners can maintain public listing details such as name, category, contact information, city, address, and working hours while reviewing recent bookings.

#### 7. Create Offer Form

![Create Offer Form](screenshots/Screenshot%202026-05-24%20230448.png)

The create-offer screen captures business, title, category, pricing, validity dates, timing, capacity, and customer booking limits.

#### 8. Offer Management

![Offer Management](screenshots/Screenshot%202026-05-24%20230458.png)

Admins can search, filter, update status, manage slots, refresh, and delete offers from a structured management table.

#### 9. Booking Desk

![Booking Desk](screenshots/Screenshot%202026-05-24%20230522.png)

The booking desk lists customer bookings with booking reference, customer details, offer, slot, people count, status, timeline, and action controls.

#### 10. Swagger API Documentation

![Swagger API Documentation](screenshots/Screenshot%202026-05-24%20230552.png)

Swagger exposes backend API groups such as Auth, Bookings, Business, Dashboard, Offers, and Slots for testing and review.

#### 11. Backend Endpoint Coverage

![Backend Endpoint Coverage](screenshots/Screenshot%202026-05-24%20230603.png)

The backend includes full CRUD-style API coverage for businesses, offers, bookings, slots, and dashboard summary data.

#### 12. ER Diagram

![ER Diagram](screenshots/Screenshot%202026-05-24%20230634.png)

The relational design connects users, businesses, offers, offer slots, and bookings using clear primary-key and foreign-key relationships.

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
|-- screenshots/
|   `-- project screenshots used in this README
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

If you don't already have the .NET SDK installed, download and install the .NET 8 SDK from the official site: https://dotnet.microsoft.com/en-us/download

#### Step 1: Clone the repository

```bash
git clone <your-repository-url>
cd talent-hunt-booking
```

#### Step 2: Install frontend dependencies

```bash
cd Frontend
npm install
```

#### Step 3: Configure frontend API URL

Create a `.env` file inside `Frontend/`:

```bash
cp ../.env.example .env
```

Default value:

```env
VITE_API_URL=http://localhost:5170
```

Note: Vite's dev server normally starts on port `5173`. If that port is already in use, Vite may pick `5174`, `5175`, etc. After starting the frontend (`npm run dev`), check the terminal for the exact URL (e.g. `http://localhost:5174`) and update `VITE_API_URL` in `Frontend/.env` to match the reported port so the frontend can reach the backend.

#### Step 4: Configure backend database

Open `Backend/appsettings.json` or `Backend/appsettings.Development.json` and set the PostgreSQL connection string.

Local PostgreSQL example:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=BookingDb;Username=postgres;Password=yourpassword"
  }
}
```

Supabase/PostgreSQL URL format is also supported by the backend:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "postgresql://username:password@host:5432/postgres"
  }
}
```

#### Step 5: Run the backend

```bash
cd Backend
dotnet restore
dotnet run
```

The backend applies migrations and seeds demo data on startup.

Swagger is available in development mode at:

```text
http://localhost:5170/swagger/index.html
```

#### Step 6: Run the frontend

```bash
cd Frontend
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

#### Step 7: Test the main API endpoints

Use Swagger or a browser to check:

```text
GET http://localhost:5170/api/offers
GET http://localhost:5170/api/business
GET http://localhost:5170/api/bookings
GET http://localhost:5170/api/dashboard/summary
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
