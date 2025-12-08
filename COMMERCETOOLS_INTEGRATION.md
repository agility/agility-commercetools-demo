# commercetools Integration Guide

This document describes the integration of commercetools as the product backend and checkout system for the Agility CMS commerce site.

## Overview

The application has been updated to use **commercetools** for:
- Product catalog management
- Cart management
- Order processing
- Checkout flow

**Agility CMS** continues to handle:
- Page routing and content management
- Component configuration
- Content zones and page templates
- All non-product content

## Architecture Changes

### Product Data Flow
```
commercetools → API Routes (/api/products) → Product Pages → Display
```

### Checkout Flow
```
Cart → Checkout API → commercetools Cart → commercetools Order → Success Page
```

## Setup Instructions

### 1. commercetools Account Setup

1. Create a commercetools account at https://commercetools.com
2. Create a new project
3. Generate API credentials:
   - Go to **Settings > Developer settings**
   - Create a new API client
   - Note down:
     - Project Key
     - Client ID
     - Client Secret
     - API URL (e.g., `https://api.europe-west1.gcp.commercetools.com`)
     - Auth URL (e.g., `https://auth.europe-west1.gcp.commercetools.com`)

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# commercetools (Required for product/checkout functionality)
CTP_PROJECT_KEY=your-project-key
CTP_CLIENT_ID=your-client-id
CTP_CLIENT_SECRET=your-client-secret
CTP_AUTH_URL=https://auth.us-east-2.aws.commercetools.com
CTP_API_URL=https://api.us-east-2.aws.commercetools.com
CTP_SCOPES=view_product_selections:your-project-key manage_order_edits:your-project-key ...
```

**Note:** Use the `CTP_` prefix as provided by commercetools. The scopes are optional but recommended for proper API access.

### 3. Product Data Structure

Products in commercetools should have:
- **Slug**: Used for URL routing (e.g., `/products/product-slug`)
- **SKU**: Unique identifier for variants
- **Variants**: Different sizes, colors, etc.
- **Prices**: Configured per variant
- **Images**: Product and variant images
- **Attributes**: Color, size, etc.

### 4. Routing

The application handles product routes specially:

- **Product Detail Pages**: `/products/[slug]` or `/[locale]/products/[slug]`
  - These routes bypass Agility CMS routing
  - Products are fetched directly from commercetools
  - Located at: `src/app/[locale]/products/[slug]/page.tsx`

- **All Other Routes**: Handled by Agility CMS as before
  - Dynamic content pages
  - CMS-managed pages
  - Component-based layouts

## API Routes

### Product APIs

#### `GET /api/products`
Fetch all products with optional filtering and sorting.

**Query Parameters:**
- `category` - Filter by category (if configured in commercetools)
- `sort` - Sort order (price-low, price-high, name-az, name-za, newest)
- `limit` - Max number of products (default: 100)
- `offset` - Pagination offset (default: 0)
- `languageCode` - Content language (default: en-us)

#### `GET /api/products/[slug]`
Fetch a single product by slug.

**Query Parameters:**
- `languageCode` - Content language (default: en-us)

### Checkout APIs

#### `POST /api/checkout`
Create a cart and order in commercetools.

**Request Body:**
```json
{
  "items": [
    {
      "productId": 123,
      "variantSKU": "PROD-001-RED-L",
      "product": { "slug": "product-slug", ... },
      "variant": { ... },
      "quantity": 2
    }
  ],
  "customerId": "optional-customer-id",
  "email": "customer@example.com",
  "currency": "USD",
  "country": "US"
}
```

**Response:**
```json
{
  "orderId": "order-id",
  "orderNumber": "ORDER-123",
  "cartId": "cart-id",
  "totalPrice": {
    "centAmount": 2999,
    "currencyCode": "USD"
  },
  "url": "/checkout/success?order_id=..."
}
```

#### `GET /api/checkout/session?order_id=...`
Retrieve order details for the success page.

## Key Files

### commercetools Integration
- `src/lib/commercetools/client.ts` - commercetools SDK client configuration
- `src/lib/commercetools/products.ts` - Product fetching and transformation utilities
- `src/lib/commercetools/cart.ts` - Cart and order management utilities

### API Routes
- `src/app/api/products/route.ts` - Product listing endpoint
- `src/app/api/products/[slug]/route.ts` - Single product endpoint
- `src/app/api/checkout/route.ts` - Checkout creation endpoint
- `src/app/api/checkout/session/route.ts` - Order retrieval endpoint

### Routing
- `src/middleware.ts` - Handles special routing for `/products/[slug]` paths
- `src/app/[locale]/products/[slug]/page.tsx` - Product detail page

## Data Transformation

The application transforms commercetools product data to match the existing `IProduct` interface:

- **Product Name** → `title`
- **Product Slug** → `slug`
- **Master Variant SKU** → `sku`
- **Prices** → `basePrice` (from master variant)
- **Images** → `featuredImage` (from master variant)
- **Variants** → Transformed to match `IVariant` interface

## Cart Management

The cart context (`src/lib/hooks/useCart.tsx`) continues to work with the existing interface. The cart items are stored locally and sent to commercetools during checkout.

**Note:** For a full commercetools integration, you may want to:
1. Store cart in commercetools (not just localStorage)
2. Sync cart state with commercetools
3. Handle cart persistence across sessions

## Payment Processing

Currently, the checkout flow creates an order in commercetools. For actual payment processing, you'll need to:

1. Integrate a payment provider (Stripe, Adyen, etc.)
2. Create payment transactions in commercetools
3. Update order payment state
4. Handle payment webhooks

See commercetools payment documentation: https://docs.commercetools.com/api/projects/payments

## Testing

1. **Test Product Fetching:**
   ```bash
   curl http://localhost:3000/api/products
   curl http://localhost:3000/api/products/product-slug
   ```

2. **Test Checkout:**
   - Add items to cart in the UI
   - Proceed to checkout
   - Verify order creation in commercetools Merchant Center

3. **Test Product Pages:**
   - Navigate to `/products/[slug]`
   - Verify product details display correctly
   - Test variant selection and add to cart

## Troubleshooting

### Products Not Loading
- Verify commercetools credentials in `.env.local`
- Check that products are published in commercetools
- Verify product slugs match the URL structure
- Check browser console for API errors

### Checkout Fails
- Verify cart items have valid SKUs
- Check that products exist in commercetools
- Verify customer ID/email if using authenticated checkout
- Check commercetools API logs

### Routing Issues
- Ensure middleware is properly handling `/products/[slug]` routes
- Check that product slugs don't conflict with Agility CMS routes
- Verify locale routing if using multi-locale setup

## Next Steps

1. **Configure Products in commercetools:**
   - Import product catalog
   - Set up product types and attributes
   - Configure pricing and inventory

2. **Set Up Payment Integration:**
   - Choose payment provider
   - Configure payment methods in commercetools
   - Implement payment processing

3. **Enhance Cart Management:**
   - Store cart in commercetools
   - Sync cart across devices
   - Handle cart expiration

4. **Add Order Management:**
   - Order history page
   - Order status tracking
   - Email notifications

## Resources

- [commercetools API Documentation](https://docs.commercetools.com/api)
- [commercetools TypeScript SDK](https://github.com/commercetools/commercetools-sdk-typescript)
- [commercetools Merchant Center](https://mc.commercetools.com)

