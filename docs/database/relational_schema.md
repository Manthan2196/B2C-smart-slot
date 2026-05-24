# Relational Schema

## Why a relational database was the right fit

The platform models real business relationships:

- one business publishes many offers
- one offer opens many slots
- one slot can receive multiple bookings until capacity is full
- one owner account manages one business, while a platform admin can oversee the whole system

That kind of connected data is exactly where PostgreSQL shines. We need foreign keys, uniqueness checks, transactional updates, and reporting-friendly joins. A relational model gives us those tools without adding extra complexity.

## Schema overview

```text
users
  id PK
  name
  email UNIQUE
  password_hash
  role
  business_id FK -> businesses.id
  created_at

businesses
  id PK
  name
  business_type
  owner_name
  phone
  email
  address
  city
  logo_url
  created_by_user_id FK -> users.id
  opening_time
  closing_time
  created_at

offers
  id PK
  business_id FK -> businesses.id
  title
  description
  category
  original_price
  offer_price
  discount_percentage
  start_date
  end_date
  start_time
  end_time
  total_capacity
  max_booking_per_customer
  terms_and_conditions
  status
  created_at
  updated_at

offer_slots
  id PK
  offer_id FK -> offers.id
  slot_date
  start_time
  end_time
  capacity
  booked_count
  status
  created_at

bookings
  id PK
  booking_reference UNIQUE
  offer_id FK -> offers.id
  slot_id FK -> offer_slots.id
  customer_name
  customer_phone
  customer_email
  people_count
  special_note
  status
  created_at
```

## Table-by-table notes

### `users`

This table stores both super admins and business owners.

- `role` separates platform-wide users from business-scoped users.
- `business_id` is nullable because a super admin does not belong to a single business.
- `email` is unique so login stays simple and predictable.

### `businesses`

This table represents the real business shown in the marketplace.

- `business_type` powers category-specific marketplace visuals and filtering.
- `created_by_user_id` gives us an audit trail for the owner account that created the business.
- contact fields live here because they belong to the business identity, not to offers.

### `offers`

Offers are the commercial campaign layer.

- every offer belongs to one business
- pricing fields are stored directly so discount calculations remain transparent
- date and time range fields define the active offer window
- `max_booking_per_customer` supports the booking rule from the problem statement

### `offer_slots`

Slots are the operational inventory layer.

- one offer can have many slots
- each slot has its own date, time range, capacity, booked count, and status
- slot-level tracking makes it possible to close one session without killing the whole offer

### `bookings`

Bookings are the customer transaction layer.

- `booking_reference` is unique and presentation-friendly
- the row points to both `offer_id` and `slot_id`
- customer contact details are stored directly so the business can act on them even if the offer later changes

## Why bookings reference both offers and slots

This is one of the most important design choices in the project.

If a booking only referenced the slot, we could still discover the offer by joining through `offer_slots`, but:

- analytics would need an extra join every time
- historical reporting becomes more fragile if slot structures change later
- business rules tied to offer-level limits become harder to evaluate quickly

By storing both foreign keys, we get:

- fast offer-level booking reporting
- fast slot-level occupancy reporting
- clearer business logic when checking booking limits
- cleaner API responses for the admin dashboard

## Normalization reasoning

The schema is normalized enough for a hackathon MVP without becoming hard to explain.

- business identity is stored once in `businesses`
- commercial details live in `offers`
- time inventory lives in `offer_slots`
- customer reservations live in `bookings`
- user access lives in `users`

This avoids repeating business metadata in every offer and avoids repeating offer metadata in every slot.

## Constraints and integrity rules

- `users.email` is unique
- `bookings.booking_reference` is unique
- all main relationships use foreign keys
- delete rules are conservative for booking history:
  `bookings -> offers` and `bookings -> offer_slots` use restrictive behavior so active history is not silently broken

## Indexing choices

Important indexes in the current schema:

- `users.email`
- `bookings.booking_reference`
- foreign key indexes on `offers.business_id`, `offer_slots.offer_id`, `bookings.offer_id`, `bookings.slot_id`

These keep login, booking lookup, and relationship-heavy dashboard queries reasonably fast.

## Booking lifecycle in schema terms

1. A business owner creates a business.
2. That business publishes one or more offers.
3. Each offer gets one or more slots.
4. A customer books a slot.
5. The booking row is inserted into `bookings`.
6. The matching slot updates `booked_count`.
7. If capacity is reached, the slot becomes `Full`.
8. Dashboard queries aggregate across offers, slots, and bookings.
