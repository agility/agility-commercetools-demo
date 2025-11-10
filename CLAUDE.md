# Agility Demo Site 2025 - Claude Code Project Context

## Project Overview

This is an Agility CMS-powered Next.js demo site built with React 19, TypeScript, and Tailwind CSS. The site demonstrates modern web development practices with a headless CMS architecture.

## Key Technologies

- **Framework**: Next.js 15.3.5 with App Router and TypeScript
- **Frontend**: React 19.1.0 with hooks for state management
- **Styling**: Tailwind CSS v4 (CSS-file based, no config file)
- **CMS**: Agility CMS (@agility/nextjs 15.0.7)
- **Animations**: Motion (Framer Motion alternative) 12.23.0
- **Icons**: Heroicons v2, React Icons
- **Development**: Turbopack dev server, ESLint, Prettier

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
│   ├── agility-components/ # CMS-connected components (RichTextArea, BentoSection, etc.)
│   ├── agility-pages/      # Page-level components
│   ├── header/            # Header navigation components
│   └── footer/            # Footer components
├── lib/                   # Utilities and CMS helpers
│   ├── cms/               # Agility CMS API functions and SDK
│   ├── cms-content/       # Content processing utilities
│   └── types/             # TypeScript definitions
└── public/                # Static assets organized by category
```

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Component Conventions

- Use TypeScript for all components
- Follow existing naming patterns (PascalCase for components)
- Utilize Tailwind CSS for styling
- Components are functional with modern React patterns
- Agility CMS components follow their SDK patterns

## CMS Integration

The project uses Agility CMS as a headless CMS:

- Content fetching via `@agility/nextjs` SDK
- Page routing handled by Agility's dynamic routing
- Content items are strongly typed with TypeScript interfaces

## Code Style

- Prettier configuration with Tailwind CSS plugin
- ESLint with Next.js recommended rules
- Import organization with prettier-plugin-organize-imports
- 2-space indentation, semicolons, single quotes for JSX attributes

## Type Definitions

Key TypeScript interfaces are defined in `src/lib/types/`:

- `IPost.ts` - Blog post structure
- `IAuthor.ts` - Author information
- `ICategory.ts` - Content categories
- `ITag.ts` - Content tags
- `ICustomerProfile.ts` - Customer data
- `IAudience.ts` - Audience targeting
- `IRegion.ts` - Regional content
- `SitemapNode.ts` - Site navigation structure

## Agility CMS Integration Guidelines

### Component Standards

- All components should accept `UnloadedModuleProps` with `module` and `languageCode`
- Add `data-agility-component={contentID}` to container elements
- Add `data-agility-field="fieldName"` to field containers for inline editing
- Always use `getContentItem()` for single content items
- Use `getContentList()` for collections and nested references

### Available Agility Components

- **RichTextArea** - Renders rich text content from CMS
- **BackgroundHero** - Hero section with background image
- **BentoSection** - Animated grid of cards with nested content (example of nested data fetching)
- **LogoStrip** - Display strip of logos
- **Header/Hero** - Site header and hero components
- **ContactUs** - Contact form components
- **TeamListing** - Team member display
- **BlogHeader** - Blog-specific header
- **CompanyStats** - Statistics display component
- **Testimonials** - Customer testimonial components
- **Pricing** - Pricing table components
- **Carousel** - Image/content carousel
- **PostListing/PostDetails** - Blog post components

### TypeScript Patterns

- Define interfaces for CMS content fields (e.g., `IBentoSection`, `IBentoCard`)
- Use `ContentItem<T>` type for typed content items
- Always type `ImageField` for Agility image fields

### Image Handling with AgilityPic

**IMPORTANT:** Always use the `<AgilityPic>` component from `@agility/nextjs` for rendering images from Agility CMS. Never use Next.js `<Image>` or plain `<img>` tags for Agility images.

**Import:**
```typescript
import { AgilityPic } from "@agility/nextjs"
import type { ImageField } from "@agility/nextjs"
```

**Basic Usage:**
```typescript
<AgilityPic
  image={imageField}
  fallbackWidth={600}
  className="w-full h-auto rounded-2xl"
  data-agility-field="image" // For inline editing
/>
```

**Key Props:**
- `image` (required): The `ImageField` object from Agility CMS
- `fallbackWidth`: Width in pixels for the fallback `<img>` tag
- `alt`: Optional alt text override (uses CMS alt text by default)
- `className`: CSS classes applied to the `<img>` element
- `priority`: Set to `true` for above-the-fold images (loads eagerly)
- `sources`: Array of source definitions for responsive images with media queries

**Why AgilityPic?**
- Automatically uses Agility's Image API for optimization
- Supports responsive images with `<picture>` tag and multiple sources
- Provides lazy loading by default (with priority override)
- Inherits alt text from CMS when available
- Enables inline editing in Agility CMS with `data-agility-field`

### Linked Content Field Patterns

#### Pattern 1: Nested Grid/Link Fields (Fetch Separately)

When using nested grid or link fields that only store a reference name, you need to fetch the content separately:

```typescript
// Get main content item with reference
const {
  fields: {
    nestedRef: { referencename },
  },
} = await getContentItem<MainType>({
  contentID: module.contentid,
  languageCode,
})

// Get nested collection using the reference name
const nestedItems = await getContentList<NestedType>({
  referenceName: referencename,
  languageCode,
  take: 20,
})
```

**TypeScript Interface:**

```typescript
interface IMainType {
  nestedRef: {
    referencename: string
    fulllist: boolean
  }
}
```

#### Pattern 2: Search List Box / Dropdown / Checkbox Linked Content (Auto-Populated)

When using search list box, dropdown, or checkbox linked content fields, the Agility SDK automatically populates the field with full `ContentItem<T>[]` objects. NO separate fetch is needed.

```typescript
// Get main content item - featuredProducts already contains full product objects
const { fields: { featuredProducts } } = await getContentItem<IFeaturedProducts>({
  contentID: module.contentid,
  languageCode,
})

// featuredProducts is already an array of ContentItem<IProduct> - use directly!
return <Component products={featuredProducts} />
```

**TypeScript Interface:**

```typescript
interface IFeaturedProducts {
  featuredProducts: ContentItem<IProduct>[] // Already populated by SDK
}
```

**IMPORTANT:** Do NOT use `getContentList()` when the linked content field is a search list box, dropdown, or checkbox type - the data is already there!

## Styling Conventions

- Use Tailwind CSS v4 classes (no config file approach)
- Responsive design: mobile-first with `lg:` prefixes
- Dark mode support with `dark:` variants
- Use `clsx()` for conditional classes
- Animation delays for staggered effects

## Animation Implementation

- Use Motion library for animations
- Implement staggered delays for grid items
- Fade animations from specific directions
- Calculate delays based on item index for visual interest

## Development Notes for Claude Code

- Always check existing component patterns before creating new ones
- Use the established TypeScript interfaces for consistency
- Follow the Agility CMS SDK patterns for content fetching
- Reference Tailwind CSS v4 documentation at https://tailwindcss.com/docs
- Maintain accessibility standards with Heroicons and semantic HTML
- Test responsiveness with Tailwind's mobile-first approach
