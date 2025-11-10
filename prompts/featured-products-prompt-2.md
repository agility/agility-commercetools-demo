# Create Featured Products Component

Create a "Featured Products" component for this Agility CMS Next.js site following the Figma design.

**Figma Design Reference**: https://www.figma.com/design/tFmEClxa2O65nA7m6XWOc9/Collection-of-25--Figma-Hero-Section-Template-Components--Community-?node-id=0-667

## Design Requirements

- **Two-column layout**: Text content on left, product grid on right (gap: ~146px)
- **Left column**:
  - Large heading: Satoshi Bold, text-5xl (52px), leading-[63px], tracking-tight (-1.04px), text-gray-600 (#545454)
  - Subheading: Satoshi Regular, text-2xl (26px), tracking-tight (-0.52px), text-gray-600 (#545454)
  - Gap between heading and subheading: 20px
  - CTA button below (30px gap):
    - Background: gray-200 (#dddddd) with border-gray-600 (#545454)
    - Rounded-lg (10px), padding: py-3 px-6
    - Icon on left (30px size) + button text (16px)
- **Right column - Bento Grid**:
  - Displays exactly 5 products in an artistic overlapping layout
  - Uses CSS Grid with grid-area placements for responsive bento style
  - Card backgrounds: gray-200 (#dddddd)
  - Card sizes (desktop):
    1. Top-left small: 143px × 143px (rounded-[13.67px])
    2. Middle-left large: 229px × 229px (rounded-[21.892px])
    3. Top-right tall: 268.723px × 324px (rounded-[21.892px])
    4. Bottom-right small: 143px × 143px (rounded-[13.67px])
    5. Bottom-wide: 276px × 193px (rounded-[13.67px])
  - Product images fill cards with AgilityPic
  - Hover overlay: dark semi-transparent overlay with product title in white
  - Total height: ~625px
- **Responsive Behavior**:
  - **Mobile**: Stack vertically - text content on top, simplified 2-column product grid below
  - **Tablet**: Reduce gap, adjust card sizes proportionally
  - **Desktop**: Full bento layout as designed
- **Animations**: Staggered fade-in effects using Motion library

## Technical Requirements

### 1. Agility Component Model

- Create component model named "FeaturedProducts"
- Fields:
  - `heading` (text, required)
  - `subheading` (text)
  - `ctaLabel` (text, default: "Shop Now")
- Products field: LinkedContentSearchListBox pointing to "Products" container
- Use proper hidden fields for value/text storage

### 2. Code Structure

- Follow existing component patterns in `src/components/agility-components/`
- Server component: Use `getContentItem()` with `contentLinkDepth: 2` to fetch linked products as ContentItem array
- Client component: Render the two-column layout with bento grid
- TypeScript interfaces in `src/lib/types/`
- Register in `src/components/agility-components/index.ts`

### 3. Important Pattern

- LinkedContentSearchListBox returns `ContentItem<IProduct>[]` when using `contentLinkDepth > 0`
- Do NOT use `getContentList()` - the products are already fetched
- Products field type: `ContentItem<IProduct>[]` not `{ referencename: string }`

### 4. Styling & Layout Implementation

- Use Tailwind CSS v4 (CSS-file based, no config)
- Implement bento grid using CSS Grid with named grid areas
- Example grid structure for desktop:
  ```css
  grid-template-columns: 143px 86px 143px 125.723px 143px;
  grid-template-rows: 143px 31px 150px 48px 193px;
  grid-areas for products 1-5 with overlapping placements
  ```
- Use `group` and `group-hover` for product card hover effects
- Dark mode support: Convert gray colors to dark mode equivalents
- Animations with Motion library (staggered fade-in)
- AgilityPic for product images with object-fit cover
- Include proper data-agility attributes for inline editing:
  - `data-agility-component={contentID}` on container
  - `data-agility-field="heading"` on heading
  - `data-agility-field="subheading"` on subheading
  - `data-agility-field="ctaLabel"` on button text

### 5. Grid Area Mapping (Example)

Map products array indices to grid positions:
- products[0] → Top-left small (grid-area: 1 / 1 / 2 / 2)
- products[1] → Middle-left large (grid-area: 2 / 1 / 4 / 3)
- products[2] → Top-right tall (grid-area: 1 / 4 / 4 / 6)
- products[3] → Bottom-right small (grid-area: 4 / 4 / 6 / 6)
- products[4] → Bottom-wide (grid-area: 5 / 1 / 6 / 4)

Responsive: Simplify to 2-column grid on mobile/tablet

## Deliverables

1. Create the Agility component model in CMS (show me first before creating)
2. All component code files
3. TypeScript interfaces
4. Component registration
5. Verify build succeeds
