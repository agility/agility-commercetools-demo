# Quick Start Guide - E-Commerce Demo

## 🚀 Get Running in 15 Minutes

This guide will get your e-commerce site up and running quickly.

---

## Prerequisites

- Node.js 20+ installed
- Agility CMS account
- Stripe account (test mode)
- Code already deployed to this repo

---

## Step 1: Configure Stripe (5 minutes)

### Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### Update Environment Variables

Open `.env.local` and update these lines:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

### Set Up Webhook (Local Development)

Open a new terminal and run:
```bash
# Install Stripe CLI if you haven't
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook secret (starts with `whsec_`) and add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

---

## Step 2: Start Development Server (1 minute)

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

---

## Step 3: Create Content Models in Agility CMS (5 minutes)

### Quick Model Creation

**Category Model:**
1. Go to Agility CMS → Settings → Models → Content Models
2. Click "New Model"
3. Name: `Category`, Reference: `categories`
4. Add field: `Title` (Text, Required)
5. Save

**Size Model:**
1. Create new model
2. Name: `Size`, Reference: `sizes`
3. Add fields:
   - `Title` (Text, Required)
   - `Code` (Text, Required)
   - `Description` (Text)
4. Save

**Product Model:**
1. Create new model
2. Name: `Product`, Reference: `products`
3. Add fields:
   - `Title` (Text, Required)
   - `SKU` (Text, Required)
   - `Slug` (Text, Required)
   - `Description` (HTML)
   - `Category` (Linked Content → Category)
   - `Base Price` (Number, Required)
   - `Featured Image` (Image, Required)
   - `Variants` (Nested Content List - create ProductVariant schema)
4. Save

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

## Step 4: Add Demo Content (3 minutes)

### Create Sizes

Go to Content → Sizes → New:

1. **Small**: Title: "Small", Code: "S"
2. **Medium**: Title: "Medium", Code: "M"
3. **Large**: Title: "Large", Code: "L"

### Create Category

Go to Content → Categories → New:

1. **Apparel**: Title: "Apparel"

### Create a Test Product

Go to Content → Products → New:

**Basic Info:**
- Title: "Test T-Shirt"
- SKU: "TSHIRT-001"
- Slug: "test-tshirt"
- Description: "A test product"
- Category: Apparel
- Base Price: 24.99
- Featured Image: Upload any image

**Add Variant (click Add Variant):**
- Details: "Navy Blue, Medium"
- Variant SKU: "TSHIRT-001-NAVY-M"
- Color: "Navy Blue"
- Color HEX: "#000080"
- Size: Medium
- Price: 24.99
- Variant Image: Upload image
- Stock Quantity: 10

Save and **Publish**!

---

## Step 5: Test Your Store (1 minute)

1. **View Products**: http://localhost:3000/products
2. **Click on Test T-Shirt**
3. **Add to Cart**
4. **Click Cart Icon** (top right)
5. **Checkout**
6. **Use Test Card**: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
7. **Complete Payment**
8. **See Success Page**

---

## ✅ You're Done!

Your e-commerce site is now running with:
- ✅ Product catalog
- ✅ Shopping cart
- ✅ Stripe checkout
- ✅ Order confirmation

---

## Next Steps

### Add More Products

Create more products following the same pattern as Step 4.

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

**Stripe errors?**
- Verify API keys are correct (test mode keys start with `pk_test_` and `sk_test_`)
- Make sure webhook is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check Stripe Dashboard for errors

**Images not loading?**
- Verify images are uploaded in Agility CMS
- Check browser Network tab for 404 errors
- Clear Next.js cache: `rm -rf .next && npm run dev`

---

## Getting Help

1. Check **ECOMMERCE_README.md** for detailed docs
2. Check **AGILITY_SETUP_GUIDE.md** for CMS setup
3. Check **IMPLEMENTATION_SUMMARY.md** for overview
4. Check browser console for errors
5. Check Stripe Dashboard for payment issues

---

## Test Cards

Stripe provides test cards for different scenarios:

- **Success**: 4242 4242 4242 4242
- **Requires Authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 9995
- **Insufficient Funds**: 4000 0000 0000 9995

More test cards: https://stripe.com/docs/testing

---

## Demo Products Template

Want to add the full swag shop? See **AGILITY_SETUP_GUIDE.md Step 9** for complete product templates:
- Classic Logo T-Shirt (3 variants)
- Embroidered Baseball Cap (2 variants)
- Premium Zip Hoodie (3 variants)
- Comfort Crew Socks (2 variants)

---

**That's it!** You now have a fully functional e-commerce site. 🎉
