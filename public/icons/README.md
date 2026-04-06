# App Icons

Generate all icon sizes from your logo SVG using:

```bash
npx pwa-asset-generator logo.svg ./public/icons \
  --background '#FFF8F0' \
  --padding '20%'
```

Required sizes:
- icon-72.png
- icon-96.png
- icon-128.png
- icon-144.png
- icon-152.png
- icon-192.png  ← primary Android + PWA
- icon-384.png
- icon-512.png  ← primary splash
- apple-touch-icon.png (180x180) ← iOS home screen
- favicon-32.png
- favicon-16.png
- og-image.png (1200x630) ← social sharing preview
- badge-72.png ← push notification badge
