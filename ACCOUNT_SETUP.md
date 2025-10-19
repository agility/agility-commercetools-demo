# Account Section Setup Guide

## Overview
This guide explains how to set up and use the customer account section with magic link email authentication.

## Features
- ✅ Passwordless authentication via magic links
- ✅ Customer profile display (name, email, phone, address)
- ✅ Order history from Stripe
- ✅ Direct access to Stripe Customer Portal
- ✅ Automatic session management
- ✅ Email sent via Resend

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Resend Email Service (for magic links)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Or use onboarding@resend.dev for testing

# Stripe (already configured)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Update for production
```

## Setup Steps

### 1. Get Resend API Key
1. Sign up at [https://resend.com](https://resend.com)
2. Navigate to API Keys
3. Create a new API key
4. Copy it to `RESEND_API_KEY` in `.env.local`

### 2. Configure Email Domain (Optional)
For production, verify your domain in Resend:
- For testing: Use `onboarding@resend.dev` as `RESEND_FROM_EMAIL`
- For production: Verify your domain and use `noreply@yourdomain.com`

### 3. Add Account Page in Agility CMS
1. Log into Agility CMS
2. Create a new page (e.g., "/account")
3. Add the **Account Overview** component to the page
4. Configure the component fields:
   - **Heading**: "My Account" (or customize)
   - **Description**: Optional welcome message
   - **Portal Button Text**: "Manage Billing & Subscriptions"
5. Publish the page

## How It Works

### User Flow
1. **Visit `/account`** → Shows login form (if not authenticated)
2. **Enter email** → System looks up customer in Stripe
3. **Receive email** → Magic link sent (15-minute expiration)
4. **Click link** → Redirected to `/account?token=xxx`
5. **Auto-verify** → Token verified, customer ID stored in session
6. **View account** → See profile, orders, and access to Stripe Portal

### URL Patterns
- `/account` - Main account page (handles all states)
- `/account?token=xxx` - Magic link verification
- `/account?session_id=xxx` - Post-checkout redirect

### Session Storage
Customer ID is stored in `sessionStorage` as `stripe_customer_id` after:
- Successful magic link verification
- Completing a Stripe checkout

## API Routes Created

### Authentication
- `POST /api/auth/send-magic-link` - Send magic link email
- `POST /api/auth/verify-magic-link` - Verify token and return customer ID

### Customer Data
- `GET /api/customer/details?customerId=xxx` - Fetch customer profile
- `GET /api/customer/orders?customerId=xxx` - Fetch order history
- `POST /api/customer-portal` - Create Stripe Customer Portal session

### Existing Routes
- `GET /api/checkout/session?session_id=xxx` - Get customer from checkout session (updated)

## Testing

### Test Magic Link Flow
1. Complete a checkout to create a Stripe customer
2. Visit `/account`
3. Enter the email used during checkout
4. Check your email for the magic link
5. Click the link to access your account

### Test Direct Access
After completing a checkout with `session_id`:
```
http://localhost:3000/account?session_id=cs_test_xxxxx
```

## Security Features
- ✅ 15-minute token expiration
- ✅ One-time use tokens
- ✅ Secure random token generation (32 bytes)
- ✅ Email validation
- ✅ Doesn't reveal if customer exists
- ✅ Stripe customer verification

## Production Considerations

### Token Storage
Current implementation uses in-memory storage (tokens cleared on server restart). For production:

**Option 1: Redis**
```typescript
// lib/auth/magic-link-redis.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function generateMagicLinkToken(email: string, customerId: string) {
  const token = crypto.randomBytes(32).toString('hex')
  await redis.setex(`magic:${token}`, 900, JSON.stringify({ email, customerId }))
  return token
}
```

**Option 2: Database**
Store tokens in a database table with expiration timestamps.

### Email Customization
Update the email template in [src/app/api/auth/send-magic-link/route.ts](src/app/api/auth/send-magic-link/route.ts:59) to match your brand.

### Rate Limiting
Consider adding rate limiting to prevent abuse:
```typescript
// Example with Upstash Rate Limit
import { Ratelimit } from "@upstash/ratelimit"
```

## Troubleshooting

### Email not sending
- Check `RESEND_API_KEY` is correct
- Verify `RESEND_FROM_EMAIL` domain is verified (or use `onboarding@resend.dev`)
- Check Resend dashboard for delivery logs

### "No customer session found"
- Complete a checkout first to create a Stripe customer
- Or use an existing customer email from your Stripe dashboard

### Token expired
- Tokens expire after 15 minutes
- Request a new magic link

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check that `@react-email/components` and `resend` are installed

## Files Created

### Components
- `src/components/agility-components/account-overview/AccountOverview.server.tsx`
- `src/components/agility-components/account-overview/AccountOverviewClient.tsx`

### API Routes
- `src/app/api/auth/send-magic-link/route.ts`
- `src/app/api/auth/verify-magic-link/route.ts`
- `src/app/api/customer/details/route.ts`
- `src/app/api/customer/orders/route.ts`
- `src/app/api/customer-portal/route.ts`

### Utilities
- `src/lib/auth/magic-link.ts`
- `src/lib/types/ICustomer.ts`

## Support
For issues or questions, refer to:
- [Resend Documentation](https://resend.com/docs)
- [Stripe Customer Portal](https://docs.stripe.com/customer-management/integrate-customer-portal)
- [Agility CMS Documentation](https://help.agilitycms.com)
