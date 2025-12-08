# commercetools Integration Implementation Plan

## Overview

This document outlines the remaining work to complete the commercetools integration, replacing Agility CMS product storage and Stripe checkout with commercetools products and checkout.

## Current State Analysis

### ✅ Already Implemented

1. **commercetools Client Setup** (`src/lib/commercetools/client.ts`)
   - ✅ Client credentials flow configured
   - ✅ API root helper function

2. **Product Fetching** (`src/lib/commercetools/products.ts`)
   - ✅ `fetchCommercetoolsProducts()` - Fetch all products
   - ✅ `fetchCommercetoolsProductBySlug()` - Fetch by slug
   - ✅ `fetchCommercetoolsProductById()` - Fetch by ID
   - ✅ Product transformation to `IProduct` format

3. **Cart & Order Management** (`src/lib/commercetools/cart.ts`)
   - ✅ `createCart()` - Create commercetools cart
   - ✅ `getCart()` - Retrieve cart
   - ✅ `addLineItemsToCart()` - Add items to cart
   - ✅ `updateLineItemQuantity()` - Update quantities
   - ✅ `removeLineItem()` - Remove items
   - ✅ `createOrderFromCart()` - Create order from cart

4. **API Routes**
   - ✅ `GET /api/products` - List products from commercetools
   - ✅ `GET /api/products/[slug]` - Get product by slug
   - ✅ `POST /api/checkout` - Create cart and order
   - ✅ `GET /api/checkout/session` - Get order details

5. **Product Page Routing**
   - ✅ `/products/[slug]` route exists (`src/app/[locale]/products/[slug]/page.tsx`)
   - ✅ Middleware configured to bypass Agility for product routes

### ❌ Needs Implementation

1. **ProductListing Component** - Still fetching from Agility CMS
2. **ProductDetails Component** - Still expecting Agility CMS products
3. **FeaturedProducts Component** - Still using Agility CMS products (may be intentional)
4. **Checkout Flow** - Creates orders but no payment integration
5. **Cart Sync** - Cart stored in localStorage, not synced with commercetools
6. **Product Page** - Basic implementation, needs full ProductDetails integration

---

## Implementation Plan

### Phase 1: Replace Product Fetching in Components

#### 1.1 Update ProductListing Component

**File:** `src/components/agility-components/product-listing/ProductListing.server.tsx`

**Current:** Fetches products from Agility CMS
```typescript
const productsList = await getContentList<IProduct>({
  referenceName: "products",
  languageCode,
  take: 100
})
```

**Change to:** Fetch from commercetools API
```typescript
// Fetch products from commercetools via API
const productsResponse = await fetch(`/api/products?languageCode=${languageCode}&limit=100`)
const productsData = await productsResponse.json()
const productsList = { items: productsData.products || [] }
```

**Alternative:** Call commercetools directly (better performance)
```typescript
import { fetchCommercetoolsProducts } from '@/lib/commercetools/products'

const productsResponse = await fetchCommercetoolsProducts({
  limit: 100,
  locale: languageCode.split('-')[0] || 'en'
})
const productsList = {
  items: productsResponse.results.map(p => ({
    contentID: p.commercetoolsId || 0,
    fields: p
  }))
}
```

**Tasks:**
- [ ] Update `ProductListing.server.tsx` to fetch from commercetools
- [ ] Handle error cases (no products, API failures)
- [ ] Ensure product structure matches expected format
- [ ] Update category filtering to work with commercetools categories

#### 1.2 Update ProductDetails Component

**File:** `src/components/agility-components/product-details/ProductDetails.server.tsx`

**Current:** Expects product from Agility CMS `dynamicPageItem`

**Change to:** Fetch product from commercetools using slug from URL

**Challenge:** The component receives `dynamicPageItem` from Agility CMS routing. We need to:
1. Extract slug from the page URL/params
2. Fetch product from commercetools
3. Transform to match expected format

**Solution Options:**

**Option A:** Update the product detail page route to fetch and pass product
- Modify `/products/[slug]/page.tsx` to use ProductDetails component
- Pass product data as props instead of relying on `dynamicPageItem`

**Option B:** Make ProductDetails fetch from commercetools when `dynamicPageItem` is missing
- Check if product exists in `dynamicPageItem`
- If not, extract slug from URL and fetch from commercetools

**Recommended:** Option A - Update the product page route

**Tasks:**
- [ ] Update `/products/[slug]/page.tsx` to use ProductDetails component
- [ ] Fetch product from commercetools in the page component
- [ ] Pass product data to ProductDetails
- [ ] Update ProductDetails to accept product prop instead of dynamicPageItem
- [ ] Handle variant fetching (variants come from commercetools product)
- [ ] Update size handling (sizes come from variant attributes)

#### 1.3 FeaturedProducts Component Decision

**File:** `src/components/agility-components/featured-products/FeaturedProducts.server.tsx`

**Decision Needed:** Should FeaturedProducts use:
- **Option A:** Agility CMS products (CMS-managed featured products)
- **Option B:** commercetools products (e-commerce featured products)

**Recommendation:** Keep Agility CMS for FeaturedProducts if it's used for content marketing (hero sections, promotional products). Use commercetools for actual product listings.

**If switching to commercetools:**
- [ ] Update to fetch products by slug/ID from commercetools
- [ ] Update `IFeaturedProducts` interface if needed
- [ ] Handle product lookup from commercetools

---

### Phase 2: Fix Checkout Flow

#### 2.1 Update Checkout API

**File:** `src/app/api/checkout/route.ts`

**Current Issues:**
1. Creates order immediately without payment
2. Uses product slugs to fetch products (inefficient)
3. Doesn't handle payment processing

**Tasks:**
- [ ] Fix product ID lookup (currently fetches by slug for each item)
- [ ] Store commercetools product IDs in cart items
- [ ] Add payment method selection
- [ ] Integrate payment provider (Stripe, Adyen, etc.) OR use commercetools payment extensions
- [ ] Update order creation to wait for payment confirmation
- [ ] Handle payment webhooks

#### 2.2 Payment Integration

**Options:**

**Option A: Stripe via commercetools Payment Extension**
- Use commercetools Stripe payment extension
- Create payment transactions in commercetools
- Handle payment state updates

**Option B: Direct Stripe Integration**
- Create Stripe checkout session
- Update commercetools order with payment info after Stripe confirmation
- Handle Stripe webhooks

**Option C: commercetools Native Payment**
- Use commercetools payment methods
- Configure payment providers in commercetools Merchant Center

**Recommendation:** Option A or B (Stripe integration)

**Tasks:**
- [ ] Choose payment integration approach
- [ ] Implement payment creation in checkout flow
- [ ] Add payment state handling
- [ ] Create webhook handlers for payment updates
- [ ] Update order status based on payment state

#### 2.3 Update Checkout Session Endpoint

**File:** `src/app/api/checkout/session/route.ts`

**Current:** Retrieves order details

**Enhancements Needed:**
- [ ] Add payment status to response
- [ ] Include line item details with product info
- [ ] Handle order state transitions
- [ ] Add customer information

---

### Phase 3: Cart Management Enhancement

#### 3.1 Sync Cart with commercetools

**Current:** Cart stored in localStorage only

**Enhancement:** Sync cart with commercetools for:
- Cross-device cart persistence
- Server-side cart management
- Cart expiration handling
- Customer cart association

**File:** `src/lib/hooks/useCart.tsx`

**Tasks:**
- [ ] Create commercetools cart on first add to cart
- [ ] Store cart ID in localStorage/session
- [ ] Sync cart operations (add/remove/update) with commercetools
- [ ] Load cart from commercetools on page load (if cart ID exists)
- [ ] Handle cart expiration
- [ ] Associate cart with customer (if logged in)

**New API Routes Needed:**
- [ ] `POST /api/cart` - Create/update cart
- [ ] `GET /api/cart` - Get cart by ID
- [ ] `DELETE /api/cart` - Clear cart

#### 3.2 Update Cart Context

**File:** `src/lib/hooks/useCart.tsx`

**Changes:**
- [ ] Add commercetools cart ID to cart state
- [ ] Add sync functions for commercetools
- [ ] Handle sync errors gracefully
- [ ] Fallback to localStorage if commercetools unavailable

---

### Phase 4: Product Page Integration

#### 4.1 Complete Product Detail Page

**File:** `src/app/[locale]/products/[slug]/page.tsx`

**Current:** Basic product display

**Enhancements:**
- [ ] Use ProductDetails component
- [ ] Add proper error handling (404 for missing products)
- [ ] Add loading states
- [ ] Add SEO metadata
- [ ] Add structured data (JSON-LD)
- [ ] Handle variant selection
- [ ] Add to cart functionality

**Tasks:**
- [ ] Import ProductDetails component
- [ ] Fetch product from commercetools
- [ ] Pass product to ProductDetails
- [ ] Handle not found cases
- [ ] Add generateStaticParams for ISR (if needed)

#### 4.2 Update ProductDetails Client Component

**File:** `src/components/agility-components/product-details/ProductDetailsClient.tsx`

**Changes Needed:**
- [ ] Ensure variant selection works with commercetools data
- [ ] Update add to cart to use commercetools product IDs
- [ ] Fix image handling (use commercetools image URLs)
- [ ] Update price display
- [ ] Handle stock availability from commercetools

---

### Phase 5: Remove Stripe Dependencies (If Not Using)

#### 5.1 Remove Stripe Code

**If not using Stripe for payment:**

**Files to Update:**
- [ ] `src/app/api/checkout/route.ts` - Remove Stripe session creation
- [ ] `src/app/api/webhooks/stripe/route.ts` - Remove or update
- [ ] `src/lib/stripe/` - Remove if not needed
- [ ] `package.json` - Remove Stripe dependencies
- [ ] Environment variables - Remove Stripe keys

**If keeping Stripe:**
- [ ] Update to work with commercetools payment extension
- [ ] Ensure payment flow creates commercetools payment transactions

---

### Phase 6: Testing & Validation

#### 6.1 Product Flow Testing
- [ ] Test product listing page loads products from commercetools
- [ ] Test product detail page displays correct product
- [ ] Test variant selection
- [ ] Test add to cart from product pages
- [ ] Test category filtering
- [ ] Test sorting
- [ ] Test search (if implemented)

#### 6.2 Cart Testing
- [ ] Test add to cart
- [ ] Test remove from cart
- [ ] Test update quantities
- [ ] Test cart persistence
- [ ] Test cart sync with commercetools
- [ ] Test cart expiration

#### 6.3 Checkout Testing
- [ ] Test checkout flow
- [ ] Test order creation
- [ ] Test payment processing
- [ ] Test order confirmation page
- [ ] Test error handling

#### 6.4 Edge Cases
- [ ] Test with no products
- [ ] Test with invalid product slug
- [ ] Test with out of stock products
- [ ] Test with missing variants
- [ ] Test with network errors
- [ ] Test with invalid cart items

---

## Implementation Priority

### High Priority (Core Functionality)
1. ✅ Update ProductListing to use commercetools
2. ✅ Update ProductDetails to use commercetools
3. ✅ Fix checkout flow (product ID lookup)
4. ✅ Complete product detail page integration

### Medium Priority (Enhanced Features)
5. Cart sync with commercetools
6. Payment integration
7. FeaturedProducts decision & implementation

### Low Priority (Polish)
8. Remove unused Stripe code (if applicable)
9. Enhanced error handling
10. Performance optimization

---

## Technical Considerations

### Product ID Storage
**Issue:** Cart items need commercetools product IDs for checkout

**Solution:** Store commercetools product ID in cart items:
```typescript
interface ICartItem {
  productId: string // commercetools product ID
  variantSKU: string
  product: IProduct & { commercetoolsId?: string }
  variant: IVariant
  quantity: number
}
```

### Variant Handling
**Issue:** commercetools variants use attributes, not separate content items

**Solution:** Variants are part of the product object, transform during product fetch

### Category Filtering
**Issue:** Categories in commercetools are different from Agility CMS

**Solution:**
- Use commercetools categories API
- Map commercetools categories to filter products
- Update ProductListing to fetch categories from commercetools

### Image Handling
**Issue:** commercetools images are URLs, not Agility ImageField objects

**Solution:** Transform commercetools images to match ImageField format or update components to handle both

---

## Migration Checklist

### Before Starting
- [ ] Verify commercetools credentials are configured
- [ ] Verify products exist in commercetools
- [ ] Test commercetools API connection
- [ ] Review commercetools product structure
- [ ] Review commercetools category structure

### During Implementation
- [ ] Update one component at a time
- [ ] Test each change before moving to next
- [ ] Keep Agility CMS fallback during transition (if possible)
- [ ] Document any breaking changes

### After Implementation
- [ ] Remove Agility CMS product fetching code
- [ ] Update documentation
- [ ] Test all product-related flows
- [ ] Verify no references to Agility CMS products remain
- [ ] Update environment variable documentation

---

## Files to Modify

### Core Product Components
- `src/components/agility-components/product-listing/ProductListing.server.tsx`
- `src/components/agility-components/product-details/ProductDetails.server.tsx`
- `src/components/agility-components/product-details/ProductDetailsClient.tsx`
- `src/app/[locale]/products/[slug]/page.tsx`

### API Routes
- `src/app/api/checkout/route.ts`
- `src/app/api/checkout/session/route.ts`
- `src/app/api/cart/route.ts` (new)

### Cart Management
- `src/lib/hooks/useCart.tsx`
- `src/lib/commercetools/cart.ts` (enhancements)

### Types
- `src/lib/types/IProduct.ts` (may need commercetoolsId)
- `src/lib/types/ICart.ts` (may need cartId)

---

## Questions to Resolve

1. **FeaturedProducts:** Keep Agility CMS or switch to commercetools?
2. **Payment Provider:** Which payment provider to use? (Stripe, Adyen, etc.)
3. **Cart Sync:** Full sync or localStorage with commercetools on checkout?
4. **Product Categories:** Use commercetools categories or keep Agility CMS categories?
5. **Product Images:** Transform to ImageField format or update components?

---

## Next Steps

1. Review this plan
2. Answer questions above
3. Start with Phase 1 (Product Fetching)
4. Test thoroughly after each phase
5. Update documentation as you go

---

## Resources

- [commercetools API Documentation](https://docs.commercetools.com/api)
- [commercetools TypeScript SDK](https://github.com/commercetools/commercetools-sdk-typescript)
- [commercetools Payment Integration](https://docs.commercetools.com/api/projects/payments)
- [commercetools Cart Management](https://docs.commercetools.com/api/projects/carts)
