# Agility CMS E-Commerce Setup Guide

## Important: Complete Setup Order

⚠️ **This setup should be done AFTER all code has been deployed.**

Follow these steps in the exact order specified to set up your e-commerce content models in Agility CMS.

---

## Step 1: Create Category Model

**Model Name:** `Category`
**Reference Name:** `categories`

### Fields:

| Field Name | Field Type | Settings |
|------------|------------|----------|
| Title | Text | Required |

---

## Step 2: Create Size Model

**Model Name:** `Size`
**Reference Name:** `sizes`

### Fields:

| Field Name | Field Type | Settings |
|------------|------------|----------|
| Title | Text | Required (e.g., "Small", "Medium", "Large") |
| Code | Text | Required (e.g., "S", "M", "L") |
| Description | Text | Optional (e.g., "Fits sizes 8-10") |

---

## Step 3: Create Product Variant Schema (Nested Content)

**Schema Name:** `ProductVariant`
**This is a nested content schema, not a standalone content model**

### Fields:

| Field Name | Field Type | Settings |
|------------|------------|----------|
| Details | Text | Optional - Variant description |
| Variant SKU | Text | Required - Unique SKU for variant |
| Color | Text | Required - Color name (e.g., "Navy Blue") |
| Color HEX | Text | Required - HEX color code (e.g., "#000080") |
| Size | Linked Content - Single Item | Link to: `Size` model, Required |
| Price | Number | Required - Price in dollars (e.g., 29.99) |
| Variant Image | Image | Required - Variant-specific image |
| Stock Quantity | Number | Required - Available inventory count |
| Length MM | Number | Optional - Length in millimeters |
| Width MM | Number | Optional - Width in millimeters |
| Height MM | Number | Optional - Height in millimeters |
| Weight Grams | Number | Optional - Weight in grams |

---

## Step 4: Create Product Model

**Model Name:** `Product`
**Reference Name:** `products`

### Fields:

| Field Name | Field Type | Settings |
|------------|------------|----------|
| Title | Text | Required - Product name |
| SKU | Text | Required - Product SKU |
| Slug | Text | Required - URL-friendly slug (unique) |
| Description | HTML | Optional - Rich text product description |
| Category | Linked Content - Single Item | Link to: `Category` model |
| Base Price | Number | Required - Base price in dollars |
| Featured Image | Image | Required - Main product image |
| Variants | Nested Content List | Schema: `ProductVariant`, Required |

**SEO Configuration:**
- Enable SEO fields for Product model
- Add dynamic URL pattern: `/products/{slug}`

---

## Step 5: Create ProductListing Component Model

**Model Name:** `ProductListing`
**Reference Name:** `productlisting`
**Type:** Module (Page Component)

### Fields:

| Field Name | Field Type | Settings |
|------------|------------|----------|
| Heading | Text | Required - Section heading |
| Description | HTML | Optional - Section description |
| Display Style | Choice | Options: "Grid", "List" - Default: "Grid" |
| Items Per Row | Number | Default: 3, Min: 2, Max: 4 (Grid only) |
| Limit to Categories | Linked Content - Multiple Items | Link to: `Category` model, Optional |
| Show Filters | Boolean | Default: true |
| Show Sort Options | Boolean | Default: true |
| CTA Label | Text | Default: "Add to Cart" |

---

## Step 6: Create ProductDetails Component Model

**Model Name:** `ProductDetails`
**Reference Name:** `productdetails`
**Type:** Module (Page Component)

### Fields:

| Field Name | Field Type | Settings |
|------------|------------|----------|
| Show Related Products | Boolean | Default: true |
| Related Products Heading | Text | Default: "You May Also Like" |
| Enable Size Guide | Boolean | Default: false |
| Size Guide Link | URL | Optional - Link to size guide page/modal |
| Show Shipping Info | Boolean | Default: true |
| Shipping Message | Text | Default: "Free shipping on orders over $50" |

---

## Step 7: Create Demo Categories

Navigate to **Content > Categories** and create the following:

1. **Apparel**
   - Title: "Apparel"

2. **Accessories** (Optional)
   - Title: "Accessories"

---

## Step 8: Create Demo Sizes

Navigate to **Content > Sizes** and create:

### Standard Apparel Sizes:
1. **Extra Small**
   - Title: "Extra Small"
   - Code: "XS"
   - Description: "Fits sizes 0-2"

2. **Small**
   - Title: "Small"
   - Code: "S"
   - Description: "Fits sizes 4-6"

3. **Medium**
   - Title: "Medium"
   - Code: "M"
   - Description: "Fits sizes 8-10"

4. **Large**
   - Title: "Large"
   - Code: "L"
   - Description: "Fits sizes 12-14"

5. **Extra Large**
   - Title: "Extra Large"
   - Code: "XL"
   - Description: "Fits sizes 16-18"

6. **XXL**
   - Title: "XXL"
   - Code: "XXL"
   - Description: "Fits sizes 20+"

### One Size (for hats/socks):
7. **One Size**
   - Title: "One Size"
   - Code: "OS"
   - Description: "One size fits most"

---

## Step 9: Create Demo Products

### Product 1: Classic T-Shirt

**Basic Info:**
- Title: "Classic Logo T-Shirt"
- SKU: "TSHIRT-001"
- Slug: "classic-logo-tshirt"
- Description: "Comfortable cotton t-shirt with our signature logo. Perfect for everyday wear."
- Category: Apparel
- Base Price: 24.99
- Featured Image: Upload t-shirt image

**Variants (Add 3):**

1. **Navy Blue - Small**
   - Details: "Navy Blue, Small"
   - Variant SKU: "TSHIRT-001-NAVY-S"
   - Color: "Navy Blue"
   - Color HEX: "#000080"
   - Size: Small
   - Price: 24.99
   - Variant Image: Navy t-shirt image
   - Stock Quantity: 15
   - Length MM: 720
   - Width MM: 520
   - Height MM: 10
   - Weight Grams: 180

2. **Navy Blue - Medium**
   - Details: "Navy Blue, Medium"
   - Variant SKU: "TSHIRT-001-NAVY-M"
   - Color: "Navy Blue"
   - Color HEX: "#000080"
   - Size: Medium
   - Price: 24.99
   - Variant Image: Navy t-shirt image
   - Stock Quantity: 25
   - Length MM: 740
   - Width MM: 540
   - Height MM: 10
   - Weight Grams: 185

3. **Heather Gray - Medium**
   - Details: "Heather Gray, Medium"
   - Variant SKU: "TSHIRT-001-GRAY-M"
   - Color: "Heather Gray"
   - Color HEX: "#808080"
   - Size: Medium
   - Price: 24.99
   - Variant Image: Gray t-shirt image
   - Stock Quantity: 20
   - Length MM: 740
   - Width MM: 540
   - Height MM: 10
   - Weight Grams: 185

---

### Product 2: Baseball Cap

**Basic Info:**
- Title: "Embroidered Baseball Cap"
- SKU: "HAT-001"
- Slug: "embroidered-baseball-cap"
- Description: "Classic baseball cap with embroidered logo. Adjustable strap for perfect fit."
- Category: Apparel
- Base Price: 19.99
- Featured Image: Upload cap image

**Variants (Add 2):**

1. **Black - One Size**
   - Details: "Black, One Size"
   - Variant SKU: "HAT-001-BLACK-OS"
   - Color: "Black"
   - Color HEX: "#000000"
   - Size: One Size
   - Price: 19.99
   - Variant Image: Black cap image
   - Stock Quantity: 30
   - Weight Grams: 90

2. **Navy - One Size**
   - Details: "Navy, One Size"
   - Variant SKU: "HAT-001-NAVY-OS"
   - Color: "Navy"
   - Color HEX: "#000080"
   - Size: One Size
   - Price: 19.99
   - Variant Image: Navy cap image
   - Stock Quantity: 25
   - Weight Grams: 90

---

### Product 3: Zip Hoodie

**Basic Info:**
- Title: "Premium Zip Hoodie"
- SKU: "HOODIE-001"
- Slug: "premium-zip-hoodie"
- Description: "Cozy fleece hoodie with full zip and kangaroo pocket. Perfect for cool weather."
- Category: Apparel
- Base Price: 49.99
- Featured Image: Upload hoodie image

**Variants (Add 3):**

1. **Charcoal - Medium**
   - Details: "Charcoal, Medium"
   - Variant SKU: "HOODIE-001-CHAR-M"
   - Color: "Charcoal"
   - Color HEX: "#36454F"
   - Size: Medium
   - Price: 49.99
   - Variant Image: Charcoal hoodie image
   - Stock Quantity: 12
   - Length MM: 750
   - Width MM: 600
   - Height MM: 15
   - Weight Grams: 520

2. **Charcoal - Large**
   - Details: "Charcoal, Large"
   - Variant SKU: "HOODIE-001-CHAR-L"
   - Color: "Charcoal"
   - Color HEX: "#36454F"
   - Size: Large
   - Price: 49.99
   - Variant Image: Charcoal hoodie image
   - Stock Quantity: 8
   - Length MM: 770
   - Width MM: 620
   - Height MM: 15
   - Weight Grams: 540

3. **Forest Green - Large**
   - Details: "Forest Green, Large"
   - Variant SKU: "HOODIE-001-GREEN-L"
   - Color: "Forest Green"
   - Color HEX: "#228B22"
   - Size: Large
   - Price: 49.99
   - Variant Image: Green hoodie image
   - Stock Quantity: 4
   - Length MM: 770
   - Width MM: 620
   - Height MM: 15
   - Weight Grams: 540

---

### Product 4: Crew Socks

**Basic Info:**
- Title: "Comfort Crew Socks"
- SKU: "SOCKS-001"
- Slug: "comfort-crew-socks"
- Description: "Soft cotton blend crew socks. Sold as a pair."
- Category: Apparel
- Base Price: 12.99
- Featured Image: Upload socks image

**Variants (Add 2):**

1. **White - One Size**
   - Details: "White, One Size"
   - Variant SKU: "SOCKS-001-WHITE-OS"
   - Color: "White"
   - Color HEX: "#FFFFFF"
   - Size: One Size
   - Price: 12.99
   - Variant Image: White socks image
   - Stock Quantity: 50
   - Weight Grams: 60

2. **Black - One Size**
   - Details: "Black, One Size"
   - Variant SKU: "SOCKS-001-BLACK-OS"
   - Color: "Black"
   - Color HEX: "#000000"
   - Size: One Size
   - Price: 12.99
   - Variant Image: Black socks image
   - Stock Quantity: 45
   - Weight Grams: 60

---

## Step 10: Configure Stripe

1. **Get Stripe API Keys:**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy your Publishable Key
   - Copy your Secret Key

2. **Update `.env.local`:**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```

3. **Set Up Webhook:**
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copy the webhook signing secret
   - Add to `.env.local`:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
     ```

4. **For Production:**
   - Create webhook endpoint in Stripe Dashboard
   - Point to: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy webhook secret to production environment variables

---

## Step 11: Add Components to Pages

1. **Create a Products Page:**
   - Create new page in Agility: "Products"
   - Add `ProductListing` component
   - Configure settings (grid/list, filters, etc.)

2. **Or Use Direct Routes:**
   - The code already includes `/products` and `/products/[slug]` routes
   - These work independently of Agility pages
   - Products will automatically load from Agility CMS

---

## Step 12: Test the Site

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Products:**
   - Visit: http://localhost:3000/products
   - You should see your demo products

3. **Test Add to Cart:**
   - Click on a product
   - Select variant (color/size)
   - Add to cart
   - Verify cart drawer opens

4. **Test Checkout:**
   - Go to cart
   - Click "Checkout"
   - Use Stripe test card: 4242 4242 4242 4242
   - Test successful payment flow

---

## Troubleshooting

**Products not showing?**
- Verify products are published in Agility CMS
- Check console for API errors
- Verify AGILITY_API_FETCH_KEY in .env.local

**Cart not working?**
- Check browser console for errors
- Verify CartProvider is wrapping the app
- Clear localStorage and try again

**Stripe errors?**
- Verify API keys are correct
- Check webhook secret is configured
- Test with Stripe test mode first

**Images not loading?**
- Verify images are uploaded to Agility CMS
- Check next.config.js has proper image domains
- Use Agility CDN URLs

---

## Next Steps

1. **Customize Styling:** Update colors and styles in Tailwind CSS
2. **Add More Products:** Create additional product content
3. **Configure Shipping:** Set up shipping rates in Stripe
4. **Add Analytics:** Track conversions with PostHog (already integrated)
5. **Deploy:** Push to production and update environment variables

---

## Support

For Agility CMS issues: https://help.agilitycms.com
For Stripe issues: https://support.stripe.com
For Next.js issues: https://nextjs.org/docs
