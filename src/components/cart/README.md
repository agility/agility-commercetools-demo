# Shopping Cart Components

A complete shopping cart implementation with React 19, TypeScript, Tailwind CSS, and Motion animations.

## Components

### CartProvider
Wrap your app with the CartProvider to enable cart functionality:

```tsx
import { CartProvider } from "@/lib/hooks/useCart"

export default function Layout({ children }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  )
}
```

### CartButton
A header button that displays the cart icon with an item count badge and pulse animation.

```tsx
import { CartButton } from "@/components/cart"

export function Header() {
  return (
    <header>
      <CartButton />
    </header>
  )
}
```

### CartDrawer
A slide-out drawer that displays cart contents. Automatically controlled by the cart state.

```tsx
import { CartDrawer } from "@/components/cart"

export function Layout({ children }) {
  return (
    <>
      {children}
      <CartDrawer />
    </>
  )
}
```

### CartLineItem
Individual cart item component (used internally by CartDrawer).

## Usage Example

```tsx
import { useCart } from "@/lib/hooks/useCart"

function ProductCard({ product, variant }) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product, variant, 1)
  }

  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  )
}
```

## useCart Hook API

```tsx
const {
  cart,              // Current cart state { items, total, itemCount }
  addItem,           // (product, variant, quantity?) => void
  removeItem,        // (variantSKU) => void
  updateQuantity,    // (variantSKU, quantity) => void
  clearCart,         // () => void
  isCartOpen,        // boolean
  openCart,          // () => void
  closeCart,         // () => void
  itemJustAdded,     // boolean - for pulse animation
} = useCart()
```

## Features

- Local storage persistence
- Add/remove/update cart items
- Quantity controls with +/- buttons
- Animated slide-in drawer from right
- Empty cart state with icon and message
- Pulse animation when items are added
- Backdrop click to close
- Responsive design with dark mode support
- Product images with fallback
- Variant details (color, size)
- Price formatting with Intl.NumberFormat
- Smooth animations with Motion library

## Styling

All components use Tailwind CSS with dark mode support. The components follow the existing design system with:

- Gray scale for neutral colors
- Rounded corners for modern look
- Smooth transitions and hover states
- Accessible focus states
- Motion animations for delightful UX
