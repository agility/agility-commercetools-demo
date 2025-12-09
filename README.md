# Agility Demo Site 2025

A modern, full-featured e-commerce demo site built with Next.js 15, Agility CMS, and commercetools. This project demonstrates best practices for headless CMS architecture, e-commerce functionality, AI-powered search, and internationalization.

## 🚀 Features

### E-Commerce
- ✅ **Product Catalog** - Full product management powered by commercetools
- ✅ **Shopping Cart** - Persistent cart with localStorage
- ✅ **Custom Checkout** - Stripe payment processing with commercetools cart/order integration
- ✅ **Product Variants** - Color, size, and custom attributes
- ✅ **Order Management** - Order creation and tracking via commercetools
- ✅ **Payment Processing** - Stripe Checkout integration

### Content Management
- ✅ **Agility CMS Integration** - Headless CMS with inline editing
- ✅ **Dynamic Routing** - CMS-driven page routing
- ✅ **Content Zones** - Flexible page layouts
- ✅ **Preview Mode** - Real-time content preview

### AI & Search
- ✅ **AI-Powered Search** - Streaming AI search with tool calling
- ✅ **Algolia Integration** - Fast, relevant search results
- ✅ **AI Agent** - Conversational interface with contact capture

### Personalization
- ✅ **Audience Targeting** - Content personalization by audience
- ✅ **Regional Content** - Location-based content variations
- ✅ **A/B Testing** - Hero component with variant testing

### Internationalization
- ✅ **Multi-Locale Support** - Configurable locales
- ✅ **Locale Routing** - Clean URL structure with locale prefixes
- ✅ **Language Switching** - Seamless language transitions

### Analytics & Tracking
- ✅ **PostHog Integration** - Product analytics and feature flags
- ✅ **Google Analytics** - Traditional analytics tracking
- ✅ **View Transitions** - Smooth page transitions

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 (App Router)
- **React**: 19.1.1
- **TypeScript**: Full type safety
- **CMS**: Agility CMS (@agility/nextjs 15.0.7)
- **Styling**: Tailwind CSS v4
- **E-commerce Backend**: commercetools (@commercetools/sdk-client-v2, @commercetools/platform-sdk)
- **AI**: Azure OpenAI / OpenAI with Algolia
- **Analytics**: PostHog, Google Analytics
- **Animations**: Motion (Framer Motion alternative)
- **UI Components**: Radix UI, Headless UI, shadcn/ui
- **Icons**: Heroicons, Lucide React, Tabler Icons

## 📋 Prerequisites

- Node.js 20+
- npm or yarn
- Agility CMS account
- commercetools account (for e-commerce features)
- (Optional) Azure OpenAI or OpenAI API key (for AI search)
- (Optional) Algolia account (for search)
- (Optional) PostHog account (for analytics)

## 🏃 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd democommerce2025
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
# Agility CMS (Required)
AGILITY_GUID=your-guid-here
AGILITY_API_FETCH_KEY=your-fetch-key
AGILITY_API_PREVIEW_KEY=your-preview-key
AGILITY_SECURITY_KEY=your-security-key
AGILITY_LOCALES=en-us,fr-ca
AGILITY_SITEMAP=main-sitemap
AGILITY_FETCH_CACHE_DURATION=3600
AGILITY_PATH_REVALIDATE_DURATION=3600

# PostHog (Required)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# commercetools (Required for e-commerce)
CTP_PROJECT_KEY=your-project-key
CTP_CLIENT_ID=your-client-id
CTP_CLIENT_SECRET=your-client-secret
CTP_AUTH_URL=https://auth.us-east-2.aws.commercetools.com
CTP_API_URL=https://api.us-east-2.aws.commercetools.com

# ⚠️ IMPORTANT: Configure scopes in commercetools Merchant Center, not here!
# Required scopes for your API client:
# - view_products:{projectKey}
# - manage_orders:{projectKey}
# - manage_customers:{projectKey}
# - manage_payments:{projectKey}  ← REQUIRED for checkout
# - manage_carts:{projectKey}
#
# To add scopes: Merchant Center → Settings → Developer settings → Your API client → Edit → Add scopes

# Stripe (Required for checkout)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AI Search (Optional)
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=...
# OR
OPENAI_API_KEY=...

# Algolia (Optional - for search)
NEXT_PUBLIC_ALGOLIA_APP_ID=...
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=...
ALGOLIA_ADMIN_KEY=...
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run prebuild  # Rebuild redirect cache (IMPORTANT!)
npm run build
npm run start
```

**⚠️ Important**: Always run `npm run prebuild` before building. This rebuilds the redirect cache from bloom filters.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   │   ├── [...slug]/     # Dynamic Agility CMS pages
│   │   └── layout.tsx    # Locale-specific layout
│   └── api/               # API routes
│       ├── ai/            # AI search endpoints
│       ├── checkout/      # commercetools checkout
│       ├── products/      # Product API (commercetools)
│       └── webhooks/      # Payment webhooks (if configured)
├── components/            # React components
│   ├── agility-components/ # CMS-connected components
│   ├── cart/              # Shopping cart
│   ├── ai-search/         # AI search UI
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities and helpers
│   ├── cms/               # Agility CMS functions
│   ├── cart/              # Cart context
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
└── middleware.ts          # Next.js middleware
```

## 📚 Documentation

This project includes comprehensive documentation:

- **[QUICK_START.md](./QUICK_START.md)** - Get running in 15 minutes
- **[AGILITY_SETUP_GUIDE.md](./AGILITY_SETUP_GUIDE.md)** - Complete CMS setup guide

### Additional Docs

- `docs/AUDIENCE_REGION_SYSTEM.md` - Personalization system
- `docs/ENVIRONMENT_VARIABLES.md` - Environment variable reference
- `docs/VIEW_TRANSITIONS.md` - View transitions guide

### AI Coding Helpers

- **[CLAUDE.md](./CLAUDE.md)** - Project context for Claude AI
- **[CURSOR.md](./CURSOR.md)** - Cursor AI development guide
- **[.cursorrules](./.cursorrules)** - Cursor-specific rules and patterns

## 🎯 Key Features Explained

### E-Commerce Flow

1. **Products** → Managed in commercetools with variants
2. **Cart** → React Context with localStorage persistence
3. **Checkout** → Custom checkout form → Stripe Checkout Session → commercetools cart
4. **Payment** → Stripe processes payment → Webhook creates commercetools order
5. **Orders** → Order creation and management via commercetools

**Checkout Process:**
- User fills shipping address form
- Creates commercetools cart with line items
- Creates Stripe Checkout Session
- User completes payment on Stripe
- Webhook creates order in commercetools with payment reference
- User redirected to success page

### CMS Integration

- **Dynamic Pages**: Routes generated from Agility sitemap
- **Content Zones**: Flexible page layouts
- **Inline Editing**: Edit content directly in the CMS
- **Preview Mode**: Real-time content preview

See [AGILITY_SETUP_GUIDE.md](./AGILITY_SETUP_GUIDE.md) for setup.

### AI Search

- **Streaming Responses**: Real-time AI search results
- **Tool Calling**: Integrates with Algolia for search
- **Configurable**: Settings managed in Agility CMS
- **Floating UI**: Accessible search interface

### Internationalization

- **Multi-Locale**: Support for multiple languages
- **Clean URLs**: Locale prefixes in paths
- **Query Params**: `?lang=` parameter support
- **Middleware**: Automatic locale routing

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run prebuild     # Rebuild redirect cache
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Style

- **TypeScript**: Full type safety
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **Tailwind CSS**: Utility-first styling

### Component Patterns

- **Server Components**: Default for data fetching
- **Client Components**: Use `"use client"` for interactivity
- **Agility Components**: Register in `src/components/agility-components/index.ts`

See `.cursorrules` for detailed development guidelines.

## 🔧 Configuration

### Environment Variables

All environment variables are validated via `src/lib/env.ts`. Use `env.get('VAR_NAME')` instead of `process.env` for type safety.

**Required Variables:**
- Agility CMS credentials
- PostHog keys
- Node environment

**Optional Variables:**
- commercetools credentials (for e-commerce)
- Stripe keys (for checkout - required if using e-commerce)
- AI provider keys (for AI search)
- Algolia keys (for search)

### Middleware

The middleware (`src/middleware.ts`) handles:
- Preview mode entry/exit
- Dynamic redirects by ContentID
- Redirect cache lookups
- Locale routing
- Search param encoding

## 🚢 Deployment

### Pre-Deployment Checklist

1. ✅ Run `npm run prebuild` to rebuild redirect cache
2. ✅ Set all environment variables in your hosting platform
3. ✅ **Configure commercetools API client scopes** (CRITICAL):
   - Go to commercetools Merchant Center → Settings → Developer settings
   - Edit your API client
   - Ensure these scopes are enabled:
     - `view_products:{projectKey}`
     - `manage_orders:{projectKey}`
     - `manage_customers:{projectKey}`
     - `manage_payments:{projectKey}` ← **Required for checkout**
     - `manage_carts:{projectKey}`
4. ✅ Configure Stripe API keys and webhook endpoint
5. ✅ Set up PostHog project (if using analytics)
6. ✅ Configure Agility CMS preview URLs
7. ✅ Set up Stripe webhook: `https://yourdomain.com/api/webhooks/stripe` with events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

### Recommended Platforms

- **Vercel** - Optimized for Next.js
- **Netlify** - Great DX
- **AWS** - Enterprise scale

## 🤝 Contributing

1. Follow the code style guidelines in `.cursorrules`
2. Use TypeScript for all new code
3. Register new Agility components in `index.ts`
4. Add tests for new features
5. Update documentation as needed

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Agility CMS](https://agilitycms.com) - Headless CMS
- [Next.js](https://nextjs.org) - React framework
- [commercetools](https://commercetools.com) - E-commerce platform
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS

---

**Need Help?** Check the documentation files listed above or open an issue.
