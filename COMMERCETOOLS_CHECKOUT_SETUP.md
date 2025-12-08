# commercetools Checkout Integration Setup

## Overview

This project now uses **commercetools Checkout** - a pre-built checkout solution that handles the entire checkout flow including payment processing.

## What commercetools Checkout Handles

✅ **Cart Management** - Creates and manages carts in commercetools
✅ **Checkout UI** - Pre-built, customizable checkout interface
✅ **Payment Processing** - Handles payment collection and processing
✅ **Order Creation** - Automatically creates orders after successful payment
✅ **PCI Compliance** - PCI SAQ-A eligible (compliance handled by commercetools)

## Setup Instructions

### 1. commercetools Configuration

#### A. Create API Clients

You need **two separate API clients** in commercetools:

**Client 1: Standard API Client** (for cart/product operations)
- **Scopes:** `manage_orders:{projectKey}`, `view_products:{projectKey}`, etc.
- **Used for:** Creating carts, fetching products, creating orders

**Client 2: Checkout Session Client** (for checkout sessions)
- **Scopes:** `manage_sessions:{projectKey}`
- **Used for:** Creating checkout sessions
- **Important:** This must be a separate client for security

#### B. Configure Checkout Application

1. Go to **commercetools Merchant Center**
2. Navigate to **Settings > Checkout**
3. Create a new **Application** (or use existing)
4. Note the **Application Key** - you'll need this for the environment variable
5. Configure **Connectors** (payment providers like Stripe, Adyen, etc.)

#### C. Get Region Information

Determine your commercetools region:
- `europe-west1.gcp` (Europe)
- `us-east-2.aws` (US East)
- `us-central1.gcp` (US Central)
- etc.

The region is used in the checkout session API URL: `https://session.{region}.commercetools.com`

### 2. Environment Variables

Add these to your `.env.local` file:

```bash
# commercetools Standard API (existing)
CTP_PROJECT_KEY=your-project-key
CTP_CLIENT_ID=your-standard-client-id
CTP_CLIENT_SECRET=your-standard-client-secret
CTP_API_URL=https://api.europe-west1.gcp.commercetools.com
CTP_AUTH_URL=https://auth.europe-west1.gcp.commercetools.com

# commercetools Checkout (NEW - required)
CTP_CHECKOUT_REGION=europe-west1.gcp
CTP_CHECKOUT_APPLICATION_KEY=your-application-key
CTP_CHECKOUT_SESSION_CLIENT_ID=your-session-client-id
CTP_CHECKOUT_SESSION_CLIENT_SECRET=your-session-client-secret
```

### 3. Install Dependencies

The `@commercetools/checkout-browser-sdk` package is already installed. If you need to reinstall:

```bash
npm install @commercetools/checkout-browser-sdk
```

## How It Works

### Flow Diagram

```
1. User adds items to cart (localStorage)
   ↓
2. User clicks "Proceed to Payment"
   ↓
3. Frontend calls /api/checkout/session/create
   ↓
4. Backend:
   - Creates cart in commercetools
   - Adds line items to cart
   - Creates checkout session
   ↓
5. Frontend receives sessionId
   ↓
6. commercetools Checkout SDK initializes
   ↓
7. commercetools handles:
   - Checkout UI rendering
   - Payment collection
   - Order creation
   - Success/cancel redirects
```

### API Endpoints

#### POST `/api/checkout/session/create`

Creates a commercetools checkout session.

**Request:**
```json
{
  "items": [
    {
      "productId": "product-id",
      "variantSKU": "SKU-123",
      "quantity": 1,
      "product": { ... },
      "variant": { ... }
    }
  ],
  "customerId": "optional-customer-id",
  "email": "optional@email.com",
  "currency": "USD",
  "country": "US"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session-id",
  "cartId": "cart-id",
  "region": "europe-west1.gcp",
  "projectKey": "your-project-key"
}
```

### Frontend Integration

The `CheckoutClient` component:
1. Shows cart summary
2. Collects optional email/customer info
3. Calls `/api/checkout/session/create` when user clicks "Proceed to Payment"
4. Initializes commercetools Checkout SDK with the session ID
5. commercetools handles the rest

## Customization

### Styling

commercetools Checkout can be customized via:
- CSS variables
- Theme configuration
- Custom CSS

See [commercetools Checkout Customization Docs](https://docs.commercetools.com/checkout/customization)

### Events

The SDK provides event handlers:
- `onInfo` - Informational messages
- `onWarn` - Warning messages
- `onError` - Error messages

You can also listen to checkout events for success/cancel handling.

## Testing

### Development

1. Ensure all environment variables are set
2. Start the dev server: `npm run dev`
3. Add items to cart
4. Navigate to `/checkout`
5. Click "Proceed to Payment"
6. commercetools Checkout should initialize

### Common Issues

**Error: "Missing required commercetools Checkout configuration"**
- Check that all `CTP_CHECKOUT_*` environment variables are set

**Error: "Failed to authenticate with commercetools"**
- Verify `CTP_CHECKOUT_SESSION_CLIENT_ID` and `CTP_CHECKOUT_SESSION_CLIENT_SECRET` are correct
- Ensure the client has `manage_sessions:{projectKey}` scope

**Error: "Failed to create checkout session"**
- Verify `CTP_CHECKOUT_APPLICATION_KEY` matches your configured Application key
- Check that the Application has at least one Connector configured
- Ensure the region matches your commercetools project region

**Checkout SDK doesn't initialize**
- Check browser console for errors
- Verify `sessionId` is returned from the API
- Ensure `projectKey` and `region` match your commercetools configuration

## Resources

- [commercetools Checkout Documentation](https://docs.commercetools.com/checkout)
- [Browser SDK Reference](https://docs.commercetools.com/checkout/browser-sdk)
- [Checkout API Reference](https://docs.commercetools.com/checkout/checkout-apis)
- [Payment Integrations](https://docs.commercetools.com/checkout/payment-integrations)

## Migration Notes

### What Changed

- **Before:** Custom checkout UI → Stripe Checkout → Order creation
- **After:** Cart summary → commercetools Checkout SDK → commercetools handles everything

### Removed Dependencies

- No longer need direct Stripe integration for checkout
- Order creation is handled by commercetools automatically

### Kept Functionality

- Cart management (localStorage) remains the same
- Product pages unchanged
- Checkout page structure similar (cart summary still shown)
