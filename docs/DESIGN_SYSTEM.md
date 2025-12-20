# Fry Exchange Design System

This document outlines the design system and branding guidelines for Fry Exchange.

## Brand Identity

### Logo

The Fry Exchange logo features a 3D red paper airplane/arrow shape, representing:
- **Speed** - Lightning-fast trade execution
- **Direction** - Forward momentum and growth
- **Innovation** - Cutting-edge technology

The logo comes in several variants:
- **Full logo** - Icon + wordmark
- **Icon only** - For favicons, app icons
- **Wordmark only** - Text-based "FryExchange"

### Logo Usage

```tsx
import { Logo, FryNetworksLogo, FryExchangeWordmark } from '@/components/brand/Logo';

// Full logo with icon and text
<Logo size="md" />

// Full Fry Networks logo with network orbits
<FryNetworksLogo size="lg" />

// Wordmark only
<FryExchangeWordmark className="text-2xl" />
```

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Fry Red 500 | `#FF0000` | Primary brand color, CTAs, highlights |
| Fry Red 600 | `#E60000` | Hover states, gradients |
| Fry Red 700 | `#CC0000` | Active states |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| Dark 900 | `#1A1A1A` | Dark backgrounds |
| Dark 800 | `#383838` | Cards, elevated surfaces |
| Dark 700 | `#434343` | Borders, dividers |
| Dark 400 | `#818181` | Muted text |
| Dark 100 | `#E3E3E3` | Light mode text |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Buy/Profit | `#00C853` | Buy orders, positive changes |
| Sell/Loss | `#FF1744` | Sell orders, negative changes |

### CSS Variables

```css
:root {
  --primary: 0 100% 50%;      /* Fry Red */
  --background: 0 0% 100%;    /* Light mode background */
  --foreground: 0 0% 10%;     /* Light mode text */
  --buy: #00C853;
  --sell: #FF1744;
}

.dark {
  --background: 0 0% 7%;      /* Dark mode background */
  --foreground: 0 0% 95%;     /* Dark mode text */
}
```

## Typography

### Font Families

- **Sans-serif**: Inter - Primary UI font
- **Monospace**: JetBrains Mono - Numbers, prices, code

### Font Sizes

| Name | Size | Usage |
|------|------|-------|
| xs | 0.75rem (12px) | Captions, labels |
| sm | 0.875rem (14px) | Body text, buttons |
| base | 1rem (16px) | Default body text |
| lg | 1.125rem (18px) | Subheadings |
| xl | 1.25rem (20px) | Card titles |
| 2xl | 1.5rem (24px) | Section headings |
| 3xl | 1.875rem (30px) | Page titles |
| 4xl | 2.25rem (36px) | Hero text |

### Font Weights

- **Regular (400)**: Body text
- **Medium (500)**: Emphasis, labels
- **Semibold (600)**: Headings, buttons
- **Bold (700)**: Strong emphasis, logos

## Components

### Buttons

```tsx
// Primary action (Fry branded)
<Button variant="fry">Get Started</Button>

// Buy/Sell trading buttons
<Button variant="buy">Buy BTC</Button>
<Button variant="sell">Sell BTC</Button>

// Secondary actions
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Learn More</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Order Book</CardTitle>
    <CardDescription>Real-time order data</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Inputs

```tsx
<Input
  label="Price"
  placeholder="0.00"
  suffix="USDT"
  error="Invalid price"
/>
```

## Trading UI Patterns

### Price Display

```tsx
// Positive change
<span className="text-buy">+2.45%</span>

// Negative change
<span className="text-sell">-1.23%</span>
```

### Order Book

- Bids (buys) shown with green depth indicator
- Asks (sells) shown with red depth indicator
- Depth visualization uses semi-transparent backgrounds
- Current price highlighted between bid/ask

### Order Form

- Buy/Sell toggle with distinct colors
- Limit/Market order type selector
- Percentage buttons (25%, 50%, 75%, 100%)
- Clear total and available balance display

## Animations

### Keyframes

```css
/* Fade in */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slide-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Pulse glow (for logo) */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4); }
  50% { box-shadow: 0 0 20px 10px rgba(255, 0, 0, 0.1); }
}
```

### Usage

```tsx
<div className="animate-fade-in">Fading content</div>
<div className="animate-slide-up">Sliding content</div>
<Logo className="animate-pulse-glow" />
```

## Responsive Design

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Extra large screens |

### Mobile Considerations

- Collapsible header navigation
- Stacked trading layout on mobile
- Touch-friendly button sizes (min 44px)
- Simplified order form

## Dark Mode

The default theme is dark mode, optimized for trading:
- Reduces eye strain during extended sessions
- Better contrast for price data
- Professional trading aesthetic

Light mode is available via theme toggle in the header.

## Accessibility

- WCAG 2.1 AA compliant color contrast
- Keyboard navigation support
- Focus visible indicators
- Screen reader friendly labels
- Reduced motion support

## File Structure

```
apps/web/src/
├── components/
│   ├── brand/
│   │   └── Logo.tsx          # Logo components
│   ├── layout/
│   │   ├── Header.tsx        # Site header
│   │   └── Footer.tsx        # Site footer
│   ├── trading/
│   │   ├── OrderBook.tsx     # Order book display
│   │   ├── OrderForm.tsx     # Trading form
│   │   ├── TradeHistory.tsx  # Trade list
│   │   └── MarketSelector.tsx # Market picker
│   └── ui/
│       ├── button.tsx        # Button component
│       ├── card.tsx          # Card component
│       └── input.tsx         # Input component
├── lib/
│   └── utils.ts              # Utility functions
└── styles/
    └── globals.css           # Global styles & theme
```
