# Quick Start Guide - E-Commerce Demo

## 🚀 Get Running in 15 Minutes

This guide will get your e-commerce site up and running quickly.

---

## Prerequisites

- Node.js 20+ installed
- Agility CMS account
- commercetools account
- Code already deployed to this repo

---

## Step 1: Configure commercetools (5 minutes)

### Get Your commercetools Credentials

1. Go to commercetools Merchant Center
2. Navigate to **Settings > Developer settings**
3. Create a new API client or use existing credentials
4. Copy your credentials:
   - **Project Key** (e.g., `sample-store-1`)
   - **Client ID** (e.g., `XmToF5sXofgOi2yRw1tCJeYb`)
   - **Client Secret** (e.g., `rqWbYN1CaBfNq7qJHtcLmgxa1dmNzGSy`)
   - **Auth URL** (e.g., `https://auth.us-east-2.aws.commercetools.com`)
   - **API URL** (e.g., `https://api.us-east-2.aws.commercetools.com`)

### Update Environment Variables

Open `.env.local` and add these lines:

```bash
# commercetools (Required for e-commerce)
CTP_PROJECT_KEY=your-project-key
CTP_CLIENT_ID=your-client-id
CTP_CLIENT_SECRET=your-client-secret
CTP_AUTH_URL=https://auth.us-east-2.aws.commercetools.com
CTP_API_URL=https://api.us-east-2.aws.commercetools.com
CTP_SCOPES=view_products:your-project-key manage_orders:your-project-key ...
```

See `COMMERCETOOLS_INTEGRATION.md` for full setup details.

---

## Step 2: Start Development Server (1 minute)

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

---

## Step 3: Set Up Products in commercetools (10 minutes)

**Note:** Products are managed in commercetools, not Agility CMS. Agility CMS handles all other content.

### Quick Setup

1. Go to commercetools Merchant Center
2. Navigate to **Products**
3. Import sample products or create products manually
4. Ensure products have:
   - **Slug** (for URL routing, e.g., `classic-coffee-cup`)
   - **SKU** (for variants)
   - **Variants** (colors, sizes, etc.)
   - **Prices** (configured per variant)
   - **Images** (product and variant images)

See `COMMERCETOOLS_INTEGRATION.md` for detailed product setup instructions.

### Agility CMS Content Models (Optional)

If you want to use Agility CMS for non-product content (blog posts, pages, etc.), you can create content models as needed. Products are handled entirely by commercetools.

**ProductVariant Schema (nested):**
When adding Variants field, create new schema with fields:
- `Details` (Text)
- `Variant SKU` (Text, Required)
- `Color` (Text, Required)
- `Color HEX` (Text, Required) - e.g., "#000080"
- `Size` (Linked Content → Size)
- `Price` (Number, Required)
- `Variant Image` (Image, Required)
- `Stock Quantity` (Number, Required)
- `Length MM` (Number)
- `Width MM` (Number)
- `Height MM` (Number)
- `Weight Grams` (Number)

---

## Step 4: Add Demo Products in commercetools (10 minutes)

**Note:** Products are managed in commercetools Merchant Center, not Agility CMS.

### Option 1: Use Sample Data

commercetools provides sample data. If your project includes sample products, they should already be available.

### Option 2: Create a Test Product

1. Go to commercetools Merchant Center → **Products**
2. Click **Create Product**
3. Fill in:
   - **Name**: "Test T-Shirt" (in your locale, e.g., English)
   - **Slug**: "test-tshirt" (used for URL routing)
   - **Description**: "A test product"
   - **Product Type**: Select or create a product type
   - **Variants**: Add variants with:
     - SKU: "TSHIRT-001-NAVY-M"
     - Attributes: Color (Navy Blue), Size (M)
     - Price: $24.99
     - Images: Upload product images
     - Stock: Set inventory quantity

4. **Publish** the product

See `COMMERCETOOLS_INTEGRATION.md` for detailed product creation instructions.

---

## Step 5: Test Your Store (1 minute)

1. **View Products**: http://localhost:3000/products
   - Should show products from commercetools
2. **Click on any product** (e.g., `/products/classic-coffee-cup`)
3. **Add to Cart**
4. **Click Cart Icon** (top right)
5. **Proceed to Checkout**
   - Creates cart and order in commercetools
6. **See Success Page**
   - Order details retrieved from commercetools

**Note:** Payment processing needs to be configured separately. The checkout creates orders in commercetools, but payment integration requires additional setup.

---

## ✅ You're Done!

Your e-commerce site is now running with:
- ✅ Product catalog (from commercetools)
- ✅ Shopping cart
- ✅ commercetools checkout
- ✅ Order creation and confirmation

---

## Next Steps

### Add More Products

Create more products in commercetools Merchant Center following the same pattern as Step 4. Products are managed entirely in commercetools.

### Customize Styles

Edit Tailwind classes in components:
- `src/components/products/ProductCard.tsx`
- `src/app/products/page.tsx`
- `src/components/cart/CartDrawer.tsx`

### Deploy to Production

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Add e-commerce functionality"
   git push
   ```

2. Deploy to Vercel:
   ```bash
   # Or connect GitHub repo in Vercel dashboard
   vercel --prod
   ```

3. Update environment variables in Vercel:
   - Add all values from `.env.local`
   - **Important**: Include all `CTP_*` commercetools variables
   - Include all `AGILITY_*` CMS variables

4. Set up production webhook in Stripe Dashboard:
   - Endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`
   - Copy signing secret to Vercel env vars

---

## Troubleshooting

**Products not showing?**
- Check products are published in Agility CMS
- Check console for errors: `npm run dev` output
- Verify `AGILITY_API_FETCH_KEY` in `.env.local`

**Cart not working?**
- Clear browser localStorage
- Check browser console for JavaScript errors
- Refresh page

**commercetools errors?**
- Verify `CTP_*` credentials are correct in `.env.local`
- Check commercetools Merchant Center for product/order issues
- Test API connection: `curl http://localhost:3000/api/products?limit=1`
- Check browser Network tab for API errors

**Images not loading?**
- Verify images are configured in commercetools products
- Check browser Network tab for 404 errors
- Clear Next.js cache: `rm -rf .next && npm run dev`

---

## Getting Help

1. Check **ECOMMERCE_README.md** for detailed docs
2. Check **COMMERCETOOLS_INTEGRATION.md** for commercetools setup
3. Check **AGILITY_SETUP_GUIDE.md** for CMS setup
4. Check **IMPLEMENTATION_SUMMARY.md** for overview
5. Check browser console for errors
6. Check commercetools Merchant Center for product/order issues

---

## Testing Products

**Test Product API:**
```bash
# List products
curl http://localhost:3000/api/products?limit=5

# Get single product
curl http://localhost:3000/api/products/classic-coffee-cup
```

**Test Checkout:**
- Add products to cart in the UI
- Proceed to checkout
- Verify order creation in commercetools Merchant Center

---

## Demo Products

commercetools sample projects often include demo products. Check your commercetools Merchant Center for available products. You can also create your own products following the pattern in Step 4.

---

**That's it!** You now have a fully functional e-commerce site. 🎉
