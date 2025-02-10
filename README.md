# Hotel Booking System

A modern hotel booking system built with NestJS, featuring room management, booking operations, loyalty program, and secure payment processing with Stripe.

## Features

- **Authentication**

  - Google OAuth2 integration
  - JWT-based authentication
  - Refresh token mechanism

- **Room Management**

  - Room types and pricing
  - Room availability checking
  - Room capacity management

- **Booking System**

  - Real-time availability checking
  - Date-based booking
  - Deposit payment processing
  - Booking status management (Pending, Confirmed, Cancelled, Completed)

- **Loyalty Program**

  - Tiered membership (Standard, Silver, Gold, Platinum)
  - Points accumulation
  - Tier-based discounts
    - Silver: 5% discount
    - Gold: 10% discount
    - Platinum: 15% discount

- **Payment Integration**
  - Stripe payment processing
  - Deposit handling (20% of total booking)
  - Secure payment flow

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Update .env with your credentials
# JWT_SECRET=
# DATABASE_URL=
# DIRECT_URL=
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GOOGLE_CALLBACK_URL=
# STRIPE_SECRET_KEY=

# Run database migrations
pnpm prisma migrate dev

# Start the application
pnpm  start:dev
```

## API Routes

### Authentication

```http
POST   /auth/google                   # Google OAuth login
POST   /auth/refresh                  # Refresh access token
POST   /auth/logout                   # Logout user
```

### Rooms

```http
GET    /rooms                         # Get all rooms
GET    /rooms/:id                     # Get specific room details
POST   /rooms                         # Create new room (Admin only)
PATCH  /rooms/:id                     # Update room details (Admin only)
DELETE /rooms/:id                     # Delete room (Admin only)
```

### Bookings

```http
GET    /bookings                      # Get user's bookings
GET    /bookings/:id                  # Get specific booking details
GET    /bookings/available-rooms      # Check room availability
POST   /bookings                      # Create new booking
PATCH  /bookings/:id/cancel           # Cancel booking
POST   /bookings/:id/payment-intent   # Initialize payment
POST   /bookings/:id/confirm-payment  # Confirm payment
```

### Loyalty Program

```http
GET    /loyalty/account               # Get user's loyalty account details
GET    /loyalty/tier-info             # Get membership tier information
```

## Development Notes

This project was developed in collaboration with Trae AI, leveraging:

- AI-assisted code generation
- Best practices validation
- Automated testing suggestions
- Architecture optimization

---

Built with NestJS & TypeScript, powered by AI 🤖
