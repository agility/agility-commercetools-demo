# E-Commerce Implementation Guide

## Overview

This Next.js application is a fully functional e-commerce site powered by Agility CMS and Stripe. It features product listings, variant selection, shopping cart, and checkout functionality.

## Architecture

### Technology Stack
- **Frontend**: Next.js 15.5.3 with React 19, TypeScript
- **CMS**: Agility CMS (headless)
- **Payments**: Stripe Checkout
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (Framer Motion alternative)
- **State**: React Context + localStorage

### Key Features
- ✅ Product catalog with categories and variants
- ✅ Product filtering and sorting
- ✅ Shopping cart with persistent state
- ✅ Variant selection (color, size)
- ✅ Stock management
- ✅ Stripe checkout integration
- ✅ Responsive design with dark mode
- ✅ SEO optimized
- ✅ Agility CMS inline editing support

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/route.ts          # Create Stripe checkout sessions
│   │   ├── products/
│   │   │   ├── route.ts               # Fetch all products
│   │   │   └── [slug]/route.ts        # Fetch product by slug
│   │   └── webhooks/
│   │       └── stripe/route.ts        # Handle Stripe webhooks
│   ├── products/
│   │   ├── page.tsx                   # Product listing page
│   │   ├── ProductsListingClient.tsx  # Client-side filtering/sorting
│   │   └── [slug]/
│   │       ├── page.tsx               # Product detail page (SSG)
│   │       └── ProductDetailsClient.tsx
│   ├── checkout/
│   │   ├── page.tsx                   # Checkout page
│   │   ├── success/page.tsx           # Order success page
│   │   └── cancel/page.tsx            # Order cancellation page
│   └── layout.tsx                     # Root layout with CartProvider
│
├── components/
│   ├── agility-components/
│   │   ├── ProductListing.tsx         # Agility CMS product grid component
│   │   ├── ProductDetails.tsx         # Agility CMS product detail component
│   │   └── index.ts                   # Component registration
│   ├── cart/
│   │   ├── CartButton.tsx             # Header cart icon with badge
│   │   ├── CartDrawer.tsx             # Slide-out cart panel
│   │   ├── CartLineItem.tsx           # Cart item display
│   │   ├── CartProviderWrapper.tsx    # Client wrapper for cart context
│   │   └── README.md                  # Cart component docs
│   ├── products/
│   │   └── ProductCard.tsx            # Reusable product card
│   └── header/
│       └── navbar.tsx                 # Navigation with CartButton
│
├── lib/
│   ├── cart/
│   │   └── CartContext.tsx            # Legacy cart context (deprecated)
│   ├── hooks/
│   │   └── useCart.tsx                # Cart state management hook
│   ├── stripe/
│   │   └── client.ts                  # Stripe.js client configuration
│   ├── utils/
│   │   ├── currency.ts                # Price formatting utilities
│   │   └── inventory.ts               # Stock management helpers
│   ├── types/
│   │   ├── IProduct.ts                # Product type definitions
│   │   ├── IVariant.ts                # Variant type definitions
│   │   ├── ISize.ts                   # Size type definitions
│   │   ├── ICart.ts                   # Cart type definitions
│   │   └── IMeasurements.ts           # Measurement type definitions
│   └── cms/
│       ├── getContentItem.ts          # Fetch single content item
│       └── getContentList.ts          # Fetch content list
│
└── public/                            # Static assets
```

---

## Data Flow

### 1. Product Data Flow
```
Agility CMS → API Route (/api/products) → Product Pages → Display
```

Products are fetched from Agility CMS via API routes, which format the data for consumption by React components.

### 2. Cart Flow
```
Add to Cart → useCart Hook → React Context → localStorage → CartDrawer
```

Cart state is managed by React Context and persisted to localStorage for persistence across sessions.

### 3. Checkout Flow
```
Cart → Checkout Page → Stripe Checkout API → Stripe Hosted Checkout → Success/Cancel
```

The checkout process creates a Stripe session and redirects to Stripe's hosted checkout page.

### 4. Order Completion Flow
```
Stripe Payment → Webhook → /api/webhooks/stripe → Process Order → Confirmation
```

After successful payment, Stripe sends a webhook to confirm the order.

---

## Key Components

### Product Listing
**Location**: `src/components/agility-components/ProductListing.tsx`

Features:
- Grid/list view toggle
- Category filtering
- Sort options (price, name, newest)
- Configurable via Agility CMS
- Responsive grid layout

Usage in Agility:
```typescript
// Add ProductListing module to any page
// Configure in Agility CMS with:
// - Heading and description
// - Display style (grid/list)
// - Items per row (2-4)
// - Category filters
```

### Product Details
**Location**: `src/components/agility-components/ProductDetails.tsx`

Features:
- Variant selection (color/size)
- Image gallery
- Stock indicators
- Add to cart
- Related products
- Size guide modal (optional)
- Shipping info (optional)

Usage in Agility:
```typescript
// Add ProductDetails module to any page
// Configure options in Agility CMS
```

### Shopping Cart
**Location**: `src/components/cart/`

Components:
- **CartButton**: Header icon with item count badge
- **CartDrawer**: Slide-out cart panel
- **CartLineItem**: Individual cart item

Features:
- Add/remove/update items
- Persistent storage (localStorage)
- Real-time total calculation
- Empty cart state
- Smooth animations

Usage:
```typescript
import { useCart } from '@/lib/hooks/useCart'

function MyComponent() {
  const { addToCart, cart } = useCart()

  const handleAddToCart = () => {
    addToCart(product, variant, quantity)
  }
}
```

---

## API Routes

### GET /api/products
Fetch all products with optional filtering and sorting.

**Query Parameters:**
- `category` - Filter by category name
- `sort` - Sort order (default, price-low, price-high, name-az, name-za, newest)
- `limit` - Max number of products (default: 100)
- `languageCode` - Content language (default: en-us)

**Response:**
```json
{
  "success": true,
  "total": 10,
  "totalCount": 10,
  "products": [
    {
      "id": 123,
      "title": "Product Name",
      "sku": "PROD-001",
      "slug": "product-name",
      "basePrice": 29.99,
      "category": "Apparel",
      "featuredImage": { "url": "...", ... },
      "variants": [...]
    }
  ]
}
```

### GET /api/products/[slug]
Fetch a single product by slug.

**Response:**
```json
{
  "success": true,
  "product": { ... }
}
```

### POST /api/checkout
Create a Stripe checkout session.

**Request Body:**
```json
{
  "items": [
    {
      "id": "product-id",
      "name": "Product Name",
      "price": 29.99,
      "quantity": 2,
      "image": "https://..."
    }
  ]
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/webhooks/stripe
Handle Stripe webhook events (checkout.session.completed, payment_intent.succeeded).

**Headers Required:**
- `stripe-signature` - Webhook signature for verification

---

## State Management

### Cart Context
**Location**: `src/lib/hooks/useCart.tsx`

**API:**
```typescript
interface CartContextType {
  cart: ICart
  addToCart: (product: IProduct, variant: IVariant, quantity: number) => void
  removeFromCart: (variantSKU: string) => void
  updateQuantity: (variantSKU: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemCount: () => number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  triggerPulse: () => void
  shouldPulse: boolean
}
```

**Usage:**
```typescript
const { cart, addToCart, isCartOpen, setIsCartOpen } = useCart()
```

---

## Styling

### Tailwind CSS v4
This project uses Tailwind CSS v4's new CSS-file based configuration (no config file).

**Key Patterns:**
- Mobile-first responsive design
- Dark mode with `dark:` variants
- Custom colors defined in CSS
- Typography plugin for rich content

**Example:**
```typescript
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
    Content
  </div>
</div>
```

### Animations
Uses Motion library for smooth animations:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

---

## Environment Variables

Required environment variables in `.env.local`:

```bash
# Agility CMS
AGILITY_GUID=your-guid
AGILITY_API_FETCH_KEY=your-fetch-key
AGILITY_API_PREVIEW_KEY=your-preview-key
AGILITY_LOCALES=en-us
AGILITY_SITEMAP=website

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Stripe Webhooks (Local)
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 3. Build for Production
```bash
npm run build
npm run start
```

### 4. Test Payments
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## Deployment

### 1. Deploy to Vercel/Netlify
```bash
# Push to GitHub
git push origin main

# Vercel will auto-deploy
# Or use: vercel --prod
```

### 2. Configure Environment Variables
Add all `.env.local` variables to your hosting platform.

### 3. Set Up Production Webhook
In Stripe Dashboard:
- Create webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Select events: `checkout.session.completed`, `payment_intent.succeeded`
- Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. Update Site URL
```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Testing

### Manual Testing Checklist
- [ ] Browse products page
- [ ] Filter by category
- [ ] Sort products
- [ ] View product details
- [ ] Select variants (color/size)
- [ ] Add to cart
- [ ] View cart drawer
- [ ] Update quantities in cart
- [ ] Remove items from cart
- [ ] Proceed to checkout
- [ ] Complete Stripe payment
- [ ] Verify success page
- [ ] Test cancel flow
- [ ] Verify webhook received
- [ ] Test mobile responsive design
- [ ] Test dark mode

### Stripe Test Cards
- **Success**: 4242 4242 4242 4242
- **Requires authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 9995

---

## Troubleshooting

### Products not loading
**Check:**
- Agility CMS content is published
- API keys are correct in `.env.local`
- Network tab shows successful API calls
- Products have required fields (title, SKU, slug, variants)

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Cart not persisting
**Check:**
- localStorage is enabled in browser
- CartProvider wraps the app
- No JavaScript errors in console

**Solution:**
```typescript
// Clear cart in console
localStorage.removeItem('agility-commerce-cart')
```

### Stripe checkout fails
**Check:**
- API keys are correct
- Using test mode keys for development
- Items array has required fields (id, name, price, quantity)
- NEXT_PUBLIC_SITE_URL is set correctly

**Solution:**
```bash
# Test API directly
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"1","name":"Test","price":10,"quantity":1}]}'
```

### Webhooks not working
**Check:**
- Stripe CLI is running for local dev
- Webhook secret is correct
- Endpoint is publicly accessible (production)
- Events are selected in Stripe Dashboard

**Solution:**
```bash
# View webhook logs in Stripe Dashboard
# Or use Stripe CLI:
stripe logs tail
```

---

## Performance Optimization

### Static Generation
Product pages use ISR (Incremental Static Regeneration):
```typescript
export async function generateStaticParams() {
  // Generates static pages for all products at build time
}
```

### Image Optimization
Next.js Image component automatically optimizes images:
```typescript
<Image
  src={imageUrl}
  width={600}
  height={600}
  alt={altText}
/>
```

### API Caching
API routes include cache headers:
```typescript
headers: {
  'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
}
```

---

## Security

### Best Practices Implemented
- ✅ API keys never exposed to client (except publishable key)
- ✅ Webhook signature verification
- ✅ Input validation on API routes
- ✅ Environment variables for secrets
- ✅ HTTPS required for production webhooks
- ✅ Stripe handles PCI compliance

### Recommendations
- Use environment variables for all secrets
- Enable Stripe Radar for fraud protection
- Implement rate limiting on API routes
- Add CAPTCHA for checkout if needed
- Monitor webhook failures in Stripe Dashboard

---

## Customization

### Adding New Product Fields
1. Update Agility CMS Product model
2. Update `IProduct` interface in `src/lib/types/IProduct.ts`
3. Update API response in `/api/products/route.ts`
4. Update UI components to display new fields

### Styling Changes
1. Update Tailwind classes in components
2. Add custom CSS in global styles
3. Update color scheme in Tailwind config
4. Modify animations in Motion components

### Adding Payment Methods
Stripe Checkout supports multiple payment methods:
```typescript
// In /api/checkout/route.ts
payment_method_types: ['card', 'apple_pay', 'google_pay']
```

---

## Resources

- [Agility CMS Docs](https://help.agilitycms.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Motion Docs](https://motion.dev)

---

## Support

For issues or questions:
1. Check this README and AGILITY_SETUP_GUIDE.md
2. Review browser console for errors
3. Check Stripe Dashboard for payment issues
4. Review Agility CMS content structure
5. Contact support for your respective services

---

## License

This project is provided as-is for demonstration purposes.
