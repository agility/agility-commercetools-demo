# Cursor AI Development Guide

This guide is specifically tailored for working with this project in Cursor AI.

## Quick Reference

### Key Files for Cursor AI

**Configuration:**
- `.cursorrules` - Cursor-specific rules and patterns
- `CLAUDE.md` - Project context (this file)
- `COMMERCETOOLS_INTEGRATION.md` - commercetools setup guide

**Core Integration Points:**
- `src/lib/commercetools/` - commercetools SDK integration
- `src/lib/cms/` - Agility CMS SDK integration
- `src/middleware.ts` - Routing logic (handles `/products/[slug]` specially)
- `src/app/api/products/` - Product API endpoints
- `src/app/api/checkout/` - Checkout API endpoints

## Cursor-Specific Workflows

### 1. Code Generation

**When generating new components:**
- Use Cursor's chat to ask: "Create a new Agility component for [feature]"
- Reference existing components in `src/components/agility-components/`
- Always register new components in `src/components/agility-components/index.ts`

**When modifying existing code:**
- Use Cursor's inline editing for quick fixes
- Use Cursor's multi-file editing for related changes
- Leverage Cursor's codebase understanding for context-aware suggestions

### 2. Understanding the Architecture

**Ask Cursor:**
- "How does product routing work in this project?"
- "Where are products fetched from?"
- "How does checkout work?"
- "What's the difference between Agility CMS and commercetools in this project?"

**Key Concepts:**
- **Agility CMS**: Handles all content except products (pages, components, blog, etc.)
- **commercetools**: Handles all product data, cart, and orders
- **Routing**: Most routes go through Agility CMS, except `/products/[slug]` which is direct
- **API Routes**: Bridge between frontend and commercetools backend

### 3. Debugging with Cursor

**Common Issues:**

1. **Products not loading:**
   - Check `.env.local` has `CTP_*` variables set
   - Verify commercetools credentials are correct
   - Check browser console for API errors
   - Ask Cursor: "Why aren't products loading?"

2. **Routing issues:**
   - Check `src/middleware.ts` for route handling
   - Verify product routes match pattern `/products/[slug]`
   - Ask Cursor: "How does the middleware handle product routes?"

3. **Checkout failures:**
   - Verify cart items have valid SKUs
   - Check commercetools API logs
   - Ask Cursor: "Why is checkout failing?"

### 4. Adding New Features

**For commercetools features:**
1. Check `src/lib/commercetools/` utilities first
2. Use existing patterns from `products.ts` and `cart.ts`
3. Add new utilities if needed
4. Update API routes if necessary
5. Ask Cursor: "How do I add [feature] using commercetools?"

**For Agility CMS features:**
1. Check existing components in `src/components/agility-components/`
2. Follow `UnloadedModuleProps` pattern
3. Register component in `index.ts`
4. Add TypeScript interfaces in `src/lib/types/`
5. Ask Cursor: "How do I create a new Agility component?"

### 5. Environment Variables

**Cursor can help:**
- "What environment variables are needed for commercetools?"
- "Where are environment variables validated?"
- "How do I add a new environment variable?"

**Key Files:**
- `src/lib/env.ts` - Environment variable validation
- `.env.local` - Local environment variables (not in git)
- `.env.local.example` - Example environment variables

### 6. Testing with Cursor

**Ask Cursor to help:**
- "How do I test the product API?"
- "How do I test checkout?"
- "What test data should I use?"

**Quick Tests:**
```bash
# Test product API
curl http://localhost:3000/api/products?limit=5

# Test single product
curl http://localhost:3000/api/products/classic-coffee-cup

# Test checkout (requires valid cart items)
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[...]}'
```

## Common Cursor Prompts

### Architecture Questions
- "Explain the data flow for products in this project"
- "How does routing work for product pages vs CMS pages?"
- "What's the difference between server and client components?"

### Implementation Questions
- "How do I add a new product field?"
- "How do I modify the checkout flow?"
- "How do I add a new Agility CMS component?"

### Debugging Questions
- "Why is [feature] not working?"
- "Where should I look for [error]?"
- "How do I troubleshoot [issue]?"

### Code Generation
- "Create a new component for [feature]"
- "Add [functionality] to [component]"
- "Refactor [code] to use [pattern]"

## Best Practices

1. **Always check existing patterns** before creating new code
2. **Use TypeScript interfaces** from `src/lib/types/` for consistency
3. **Follow the established patterns** for Agility CMS and commercetools
4. **Test locally** before committing changes
5. **Update documentation** when adding new features
6. **Use Cursor's chat** for architectural questions
7. **Leverage Cursor's codebase understanding** for context-aware suggestions

## Resources

- **Project Documentation**: See `README.md` and other `.md` files
- **commercetools**: `COMMERCETOOLS_INTEGRATION.md`
- **Agility CMS**: `AGILITY_SETUP_GUIDE.md`
- **E-commerce**: `ECOMMERCE_README.md`
- **Cursor Rules**: `.cursorrules`

## Getting Help

If you're stuck:
1. Ask Cursor specific questions about the codebase
2. Check the relevant `.md` documentation files
3. Review existing code patterns
4. Check browser console and server logs
5. Verify environment variables are set correctly

