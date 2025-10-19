# Checkout Flow Documentation

## Overview
The checkout system now supports three distinct flows based on user authentication and preference:

## Checkout Flows

### 1. Authenticated User Checkout
**When:** User is logged in (has `stripe_customer_id` in session storage)

**Behavior:**
- Customer ID is sent to checkout API
- Email field is pre-filled and disabled
- No option to create account (already has one)
- Order is automatically associated with their Stripe customer account

**API Request:**
```json
{
  "items": [...],
  "customerId": "cus_xxx..."
}
```

### 2. Guest Checkout with Email
**When:** User is NOT logged in but enters email address

**Behavior:**
- Email field is optional
- If email provided, user can optionally check "create account"
- If creating account:
  - Searches for existing customer by email
  - Uses existing customer if found
  - Creates new customer if not found
- If not creating account:
  - Email is passed to Stripe as `customer_email`
  - No customer record created upfront

**API Request (with account creation):**
```json
{
  "items": [...],
  "email": "user@example.com",
  "createAccount": true
}
```

**API Request (without account):**
```json
{
  "items": [...],
  "email": "user@example.com",
  "createAccount": false
}
```

### 3. Pure Guest Checkout
**When:** User is NOT logged in and does NOT enter email

**Behavior:**
- User clicks "Proceed to Payment" without entering email
- Stripe checkout session collects email during payment
- Stripe automatically creates a customer record
- Session metadata includes `isGuest: "true"`

**API Request:**
```json
{
  "items": [...]
}
```

## Customer Association Flow

### During Checkout
1. **Authenticated:** Uses existing customer ID
2. **Guest with Email + Create Account:** Creates/finds customer before checkout
3. **Guest with Email:** Email passed to Stripe, customer may be created later
4. **Pure Guest:** Stripe collects email and creates customer

### After Payment (Success Page)
The `/api/checkout/session` endpoint handles customer association for guest checkouts:
- Retrieves session data from Stripe
- If no customer ID but has email, searches for existing customer
- Creates customer if needed
- Updates session metadata with retroactive customer ID
- Returns customer ID to success page for account creation flow

## Future Enhancement: Account Association
**TODO:** Add ability for guest users to claim their orders post-purchase

Planned flow:
1. Guest completes purchase
2. Success page shows option: "Create account to track this order"
3. User enters email (or uses one from payment)
4. Magic link sent to verify email
5. Account created and past orders associated using customer ID

This would involve:
- Adding webhook handler for `checkout.session.completed`
- Storing order → customer ID mapping
- Adding account creation flow on success page
- Retroactively linking past orders when account is created

## API Endpoints

### POST `/api/checkout`
Creates Stripe checkout session

**Request Body:**
```typescript
{
  items: ICartItem[]
  customerId?: string // For authenticated users
  email?: string // For guest users who want to provide email
  createAccount?: boolean // Whether to create customer record
}
```

**Response:**
```typescript
{
  sessionId: string
  url: string
}
```

### GET `/api/checkout/session`
Retrieves session details and ensures customer association

**Query Params:**
- `session_id`: Stripe checkout session ID

**Response:**
```typescript
{
  customerId: string // Stripe customer ID (created if needed)
  session: {
    id: string
    amount_total: number
    currency: string
    customer_details: object
    payment_status: string
    metadata: object
  }
}
```

## Security Considerations

1. **Customer ID Verification:** API validates customer ID exists before using it
2. **Email Validation:** Email format validated before processing
3. **Guest Protection:** Guest users can't access existing customer data
4. **Session Integrity:** Stripe session IDs used for secure data retrieval

## Metadata Tracking

Checkout sessions include metadata:
```typescript
{
  cartItemCount: string
  orderItems: string // JSON array of order items
  createAccount: "true" | "false"
  isGuest: "true" | "false" // Set when no email/customerId provided
}
```
