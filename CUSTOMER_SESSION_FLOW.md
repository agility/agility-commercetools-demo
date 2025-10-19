# Customer Session Management Flow

This document explains how customer IDs are stored and used throughout the checkout and authentication flow using browser `sessionStorage`.

## Overview

The application uses browser `sessionStorage` to persist customer IDs across pages, enabling:

- Seamless authenticated checkouts
- Account access after magic link login
- Customer association with repeat purchases

## Storage Method

**Storage Type**: `sessionStorage` (browser-based)
**Key**: `"customer_id"`
**Value**: Stripe Customer ID (e.g., `"cus_xxxxxxxxxxxxx"`)

## Customer ID Flow

### 1. Magic Link Authentication

**Location**: `/account` page
**Component**: `AccountOverviewClient.tsx`

When a user clicks a magic link:

```typescript
// Verify token via API
const response = await fetch('/api/auth/verify-magic-link', {
  method: 'POST',
  body: JSON.stringify({ token }),
})

const data = await response.json()

// Store customer ID in session
sessionStorage.setItem('customer_id', data.customerId)
```

**Flow**:

1. User receives magic link email
2. Clicks link → redirected to `/account?token=xxx`
3. Token is verified against Vercel Blob storage
4. Customer ID is returned and stored in `sessionStorage`
5. User is redirected to Stripe Customer Portal

### 2. Checkout with Stored Customer ID

**Location**: `/checkout` page
**Component**: `checkout/page.tsx`

When user proceeds to checkout:

```typescript
// Retrieve customer ID from session
const customerId =
  typeof window !== 'undefined' ? sessionStorage.getItem('customer_id') : null

// Include in checkout API call
const response = await fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify({
    items: cart.items,
    customerId: customerId || undefined,
  }),
})
```

**API Validation** (`/api/checkout/route.ts`):

```typescript
if (body.customerId) {
  // Verify customer exists in Stripe
  const customer = await stripe.customers.retrieve(body.customerId)

  if (customer.deleted) {
    return NextResponse.json(
      { error: 'Customer account not found' },
      { status: 404 },
    )
  }

  // Use verified customer ID for checkout session
  customerId = body.customerId
  customerEmail = customer.email
}
```

**Benefits**:

- Automatic customer association
- Order history tracking
- Saved payment methods
- Email pre-filled

### 3. Post-Checkout Customer Storage

**Location**: `/checkout/success` page
**Component**: `checkout/success/page.tsx`

After successful payment:

```typescript
// Fetch session details
const response = await fetch(`/api/checkout/session?session_id=${sessionId}`)
const data = await response.json()

// Store customer ID for future use
if (data.customerId) {
  sessionStorage.setItem('customer_id', data.customerId)
}
```

**Session API** (`/api/checkout/session/route.ts`):

The API ensures every checkout has a customer ID:

1. **Existing Customer**: Uses `session.customer` from Stripe
2. **Guest with Email**: Finds or creates customer by email
3. **Returns**: Customer ID for session storage

## Security Considerations

### Why sessionStorage?

✅ **Pros**:

- Browser-based, no server state required
- Cleared when tab/window closes
- Works in serverless environments
- Simple implementation

⚠️ **Cons**:

- Lost when user closes tab
- Not shared across tabs/windows
- Client-side only (not available in SSR)

### Session Validation

All customer IDs are validated before use:

```typescript
// Verify customer exists and is active
const customer = await stripe.customers.retrieve(customerId)

if (customer.deleted) {
  return NextResponse.json(
    { error: 'Customer account not found' },
    { status: 404 },
  )
}
```

This prevents:

- Invalid customer IDs
- Deleted accounts
- Expired sessions

## User Experience Flow

### First-Time User

1. **Checkout** → Guest checkout → Order complete
2. **Success page** → Customer ID stored in `sessionStorage`
3. **Return visit** → Customer ID available for next checkout
4. **Close tab** → Session cleared (security)

### Returning User (Magic Link)

1. **Login** → Receive magic link email
2. **Click link** → Token verified → Customer ID stored
3. **Checkout** → Authenticated checkout with stored ID
4. **Success** → Customer ID refreshed in session

### Account Management

Users can access their account at `/account`:

- **With Customer ID**: Direct access to Stripe portal
- **Without Customer ID**: Show login form
- **With Token**: Auto-verify and redirect

## API Endpoints Summary

### POST `/api/auth/verify-magic-link`

- **Input**: `{ token: string }`
- **Output**: `{ customerId: string, url: string }`
- **Storage**: Client stores `customerId` in `sessionStorage`

### POST `/api/checkout`

- **Input**: `{ items: [], customerId?: string }`
- **Validation**: Verifies customer exists in Stripe
- **Output**: `{ sessionId: string, url: string }`

### GET `/api/checkout/session`

- **Input**: `?session_id=xxx`
- **Process**: Finds/creates customer from session data
- **Output**: `{ customerId: string, session: {} }`
- **Storage**: Client stores `customerId` in `sessionStorage`

## Logging

All customer ID operations are logged for debugging:

```typescript
console.log('[Checkout] Using customer ID from session:', customerId)
console.log('[Checkout Success] Stored customer ID in session:', customerId)
```

**Search logs for**: `[Checkout]`, `[Checkout Success]`, `[magic-link]`

## Troubleshooting

### Customer ID not persisting

- Check if `sessionStorage` is available: `typeof window !== 'undefined'`
- Verify browser allows session storage
- Check for tab/window close events

### Invalid customer ID error

- Customer may have been deleted in Stripe
- Session may contain old/invalid ID
- Clear session: `sessionStorage.removeItem("customer_id")`

### Guest checkout not creating customer

- Check `/api/checkout/session` creates customer for guests
- Verify email is captured in checkout
- Check Stripe dashboard for customer creation

## Best Practices

1. **Always validate customer IDs** before using them in API calls
2. **Handle missing customer IDs gracefully** (allow guest checkout)
3. **Log customer operations** for debugging and audit trails
4. **Clear invalid sessions** when customer is deleted/not found
5. **Check `window` availability** before accessing `sessionStorage`

## Future Enhancements

Potential improvements:

- **HttpOnly Cookies**: More secure, server-accessible
- **Database Sessions**: Persistent across devices
- **Redis Sessions**: Fast, distributed session storage
- **JWT Tokens**: Encrypted, tamper-proof sessions
