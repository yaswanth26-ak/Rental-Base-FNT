# RentalBase Frontend

React + TypeScript + Vite frontend for the Rental House Booking application.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` if needed:

```
VITE_API_BASE_URL=http://localhost:5001/api
VITE_PROPERTY_ID=1
```

For production (e.g. Render Static Site), set `VITE_API_BASE_URL` to your live backend API URL at build time. Do not commit `.env`.

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Roles

- **Customer** — browse properties, book stays, manage bookings
- **Owner** — manage properties, images, amenities, and booking statuses
