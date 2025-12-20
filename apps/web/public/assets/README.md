# Fry Exchange Assets

This directory contains static assets for the Fry Exchange web application.

## Logo Files

Place logo files in the following structure:

```
public/
├── favicon.ico              # 32x32 favicon
├── apple-touch-icon.png     # 180x180 iOS icon
├── assets/
│   ├── logo/
│   │   ├── fry-logo.svg              # Main logo (icon only)
│   │   ├── fry-logo-full.svg         # Full logo with wordmark
│   │   ├── fry-networks-logo.svg     # Fry Networks logo with orbits
│   │   ├── fry-logo.png              # PNG version (512x512)
│   │   ├── fry-logo-full.png         # Full logo PNG
│   │   └── fry-networks-logo.png     # Fry Networks logo PNG
│   ├── og/
│   │   └── og-image.png              # Open Graph image (1200x630)
│   └── icons/
│       ├── icon-192.png              # PWA icon
│       └── icon-512.png              # PWA icon large
```

## Brand Colors

When creating new assets, use these colors:

- **Primary Red**: `#FF0000`
- **Dark Red**: `#CC0000`
- **Black**: `#1A1A1A`
- **White**: `#FFFFFF`

## Logo Guidelines

1. **Minimum Size**: Logo should never be smaller than 32px in height
2. **Clear Space**: Maintain padding equal to the height of the "F" around the logo
3. **Background**: Use on dark backgrounds for best visibility
4. **Do Not**: Stretch, rotate, or change logo colors

## SVG Logo Template

The paper airplane logo can be recreated using:

```svg
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF0000" />
      <stop offset="100%" stop-color="#CC0000" />
    </linearGradient>
  </defs>
  <polygon points="20,50 80,15 50,85" fill="url(#fryGradient)" />
  <polygon points="20,50 50,85 45,55" fill="#990000" />
  <polygon points="80,15 50,85 55,45" fill="#FF3333" />
</svg>
```
