# Database Explanation

## Big picture

The database is the memory of the platform.

It stores:

- who can operate the system
- which businesses exist
- what offers those businesses are running
- which slots are available under each offer
- which customers have already booked

The application works because these tables connect cleanly.

## The five main tables

### 1. `users`

This table stores login accounts.

- a `SuperAdmin` can see the whole platform
- a `BusinessOwner` is scoped to one business

Important idea:
users are about access and permissions, not marketplace content.

### 2. `businesses`

This table stores the public identity of a business:

- name
- type
- location
- owner contact
- opening and closing times

Important idea:
one business can run many different offers over time.

### 3. `offers`

This table stores each marketable deal.

Examples:

- Lunch Hour Deal
- Afternoon Gym Trial
- Coaching Demo Class

An offer belongs to one business, but a business can publish many offers.

### 4. `offer_slots`

This table stores bookable time windows under an offer.

Example:

- Offer: Afternoon Gym Trial
- Slot 1: 3 PM to 4 PM
- Slot 2: 4 PM to 5 PM

Important idea:
the offer is the promotion, the slot is the actual reservable unit.

### 5. `bookings`

This table stores customer reservations.

Each booking tells us:

- which offer was booked
- which exact slot was booked
- who the customer is
- how many people are included
- what the booking status is

## Primary keys

A primary key is the unique identity of a row.

Examples:

- `users.id`
- `businesses.id`
- `offers.id`
- `offer_slots.id`
- `bookings.id`

Without a primary key, we could not reliably connect one table to another.

## Foreign keys

A foreign key is how one table points to another table.

Examples:

- `offers.business_id -> businesses.id`
- `offer_slots.offer_id -> offers.id`
- `bookings.offer_id -> offers.id`
- `bookings.slot_id -> offer_slots.id`
- `users.business_id -> businesses.id`
- `businesses.created_by_user_id -> users.id`

Important idea:
foreign keys stop invalid data from entering the system. A booking cannot point to a slot that does not exist.

## One-to-many relationships

The project mainly uses one-to-many relationships.

- one business -> many offers
- one offer -> many slots
- one offer -> many bookings
- one slot -> many bookings

That shape matches the real business process.

## Why normalization matters

Normalization means we store each kind of data in the place where it naturally belongs.

For example:

- business address belongs in `businesses`, not copied into every offer
- slot timing belongs in `offer_slots`, not duplicated in `offers`
- booking customer details belong in `bookings`, not in `offer_slots`

Benefits:

- less duplicated data
- fewer update mistakes
- easier reporting
- simpler long-term maintenance

## Booking flow data lifecycle

When a customer books a slot, this is what happens in database terms:

1. The frontend sends a booking request to the backend.
2. The backend checks the slot row in `offer_slots`.
3. The backend checks the parent offer row in `offers`.
4. Business rules are validated:
   slot active, not full, offer not expired, customer limit not exceeded.
5. A new row is inserted into `bookings`.
6. `offer_slots.booked_count` is increased.
7. If booked count reaches capacity, slot status becomes `Full`.
8. Later, dashboard queries aggregate those rows for analytics.

## Why this schema is beginner-friendly

The schema is easy to explain because every table has a clear job.

- `users` = access
- `businesses` = seller identity
- `offers` = deal
- `offer_slots` = inventory
- `bookings` = reservation

That mental model is strong enough for judges, recruiters, and beginners reading the repo for the first time.
