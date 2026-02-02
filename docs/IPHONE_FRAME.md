# iPhone Frame - Desktop Mockup

## Overview

Thêm iPhone mockup frame khi xem app trên desktop để tạo trải nghiệm xem đẹp hơn, giống như đang xem app chạy trên iPhone thật.

## Visual Design

### Mobile View (< 768px)
```
┌─────────────────────────┐
│                         │
│     Full Screen App     │
│     (No Frame)          │
│                         │
└─────────────────────────┘
```

### Desktop View (≥ 768px)
```
┌───────────────────────────────────────────────┐
│                                               │
│         Gradient Background                   │
│                                               │
│         ┌─────────────────┐                  │
│         │  ╔═══════════╗  │                  │
│         │  ║  Dynamic  ║  │ ← iPhone Notch   │
│         │  ║  Island   ║  │                  │
│         │  ╚═══════════╝  │                  │
│         │ ┌─────────────┐ │                  │
│         │ │             │ │                  │
│    ┃    │ │  App        │ │    ┃             │
│    ┃    │ │  Content    │ │    ┃             │
│  Volume │ │             │ │  Power           │
│    ┃    │ │             │ │    ┃             │
│    ┃    │ └─────────────┘ │    ┃             │
│         │                 │                  │
│         └─────────────────┘                  │
│              iPhone 14 Pro                    │
│                                               │
│     "Trải nghiệm tốt nhất trên mobile"       │
│                                               │
└───────────────────────────────────────────────┘
```

## Features

### 1. Responsive Behavior

**Mobile (< 768px):**
- No frame
- Full screen app
- Native mobile experience

**Desktop (≥ 768px):**
- iPhone 14 Pro mockup
- Centered on screen
- Gradient background
- Decorative elements

### 2. iPhone 14 Pro Design

**Dimensions:**
```
Width:  390px (iPhone 14 Pro)
Height: 844px (iPhone 14 Pro)
Border Radius: 60px (outer) / 48px (screen)
```

**Elements:**
- Dynamic Island (notch)
- Camera dot
- Side buttons (volume, power)
- Black bezel
- Shadow effect

### 3. Visual Effects

**Background:**
```css
background: gradient-to-br
  from-gray-100 via-gray-50 to-blue-50 (light)
  from-gray-900 via-gray-800 to-blue-900/20 (dark)
```

**Decorative Blurs:**
- Blue blur (top-right)
- Purple blur (bottom-left)
- Shadow underneath phone

**Shadows:**
- Phone shadow: `blur-3xl, translate-y-8`
- Device shadow: `shadow-2xl`

## Implementation

### Component Structure

```tsx
<PhoneFrame>
  {/* Mobile: Direct render */}
  <div className="md:hidden">
    {children}
  </div>

  {/* Desktop: iPhone frame */}
  <div className="hidden md:flex">
    <div className="phone-frame">
      <div className="dynamic-island" />
      <div className="screen">
        {children}
      </div>
      <div className="side-buttons" />
    </div>
  </div>
</PhoneFrame>
```

### Integration

```tsx
// Layout.tsx
<PhoneFrame>
  <div className="min-h-screen">
    <Header />
    <main>{children}</main>
    <BottomNav />
  </div>
</PhoneFrame>
```

## Styling Details

### Dynamic Island

```tsx
Position: Absolute, top: 0, center
Size: 126px × 37px
Shape: Rounded bottom (radius: 20px)
Content: Camera dot (10px)
```

### Side Buttons

**Volume Buttons (Left):**
```
Position: left-0
Top: 140px (Volume Up)
Top: 180px (Volume Down)
Size: 3px × 30px
```

**Power Button (Right):**
```
Position: right-0
Top: 180px
Size: 3px × 50px
```

### Phone Bezel

```
Outer: w-[390px] h-[844px] rounded-[60px]
Color: Black (#000000)
Padding: 3px (bezel thickness)

Inner Screen: rounded-[48px]
Background: App background
Overflow: Hidden
```

## Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  .phone-frame { display: none; }
  .direct-content { display: block; }
}

/* Desktop */
@media (min-width: 768px) {
  .phone-frame { display: flex; }
  .direct-content { display: none; }
}
```

## Color Schemes

### Light Mode

**Background:**
- from: `gray-100`
- via: `gray-50`
- to: `blue-50`

**Phone:**
- Bezel: `black`
- Screen: `gray-50`
- Buttons: `gray-800`

**Effects:**
- Blue blur: `blue-400/20`
- Purple blur: `purple-400/20`
- Shadow: `black/20`

### Dark Mode

**Background:**
- from: `gray-900`
- via: `gray-800`
- to: `blue-900/20`

**Phone:**
- Bezel: `black`
- Screen: `gray-950`
- Buttons: `gray-600`

**Effects:**
- Blue blur: `blue-500/10`
- Purple blur: `purple-500/10`
- Shadow: `black/40`

## Performance

### CSS Properties

All animations use hardware-accelerated properties:
- `transform` (not top/left)
- `opacity`
- `filter: blur()`

### Optimizations

1. **Conditional Rendering:**
   - Mobile: Direct render (no overhead)
   - Desktop: Frame wrapper

2. **Hidden on Mobile:**
   - Zero impact on mobile performance
   - No extra DOM elements

3. **Static Frame:**
   - No JavaScript required
   - Pure CSS solution

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Border Radius | ✅ | ✅ | ✅ | ✅ |
| Backdrop Blur | ✅ | ✅ | ✅ | ✅ |
| Gradient | ✅ | ✅ | ✅ | ✅ |
| Shadow | ✅ | ✅ | ✅ | ✅ |

## Customization

### Change Phone Model

**iPhone 14 Pro Max:**
```tsx
width: 430px
height: 932px
```

**iPhone SE:**
```tsx
width: 375px
height: 667px
border-radius: 40px (no notch)
```

### Adjust Position

```tsx
// Centered (default)
items-center justify-center

// Top aligned
items-start justify-center pt-8

// Custom offset
items-center justify-center translate-x-20
```

### Change Background

```tsx
// Solid color
bg-gray-100 dark:bg-gray-900

// Custom gradient
bg-gradient-to-br from-pink-100 to-purple-100

// Image
bg-[url('/pattern.svg')]
```

## Examples

### Default View

```
Desktop:
┌──────────────────────────────────┐
│     [Gradient Background]        │
│                                  │
│        ┌──────────────┐          │
│        │ ╔══════════╗ │          │
│        │ ║  Notch   ║ │          │
│        │ ╚══════════╝ │          │
│        │ ┌──────────┐ │          │
│        │ │   App    │ │          │
│        │ │ Content  │ │          │
│        │ └──────────┘ │          │
│        └──────────────┘          │
│    "Trải nghiệm tốt nhất..."    │
└──────────────────────────────────┘
```

### Mobile View

```
Mobile:
┌──────────────┐
│              │
│     App      │
│   Content    │
│  (Fullscreen)│
│              │
└──────────────┘
```

## Benefits

### User Experience

1. **Professional Look**
   - Polished desktop view
   - Clear mobile-first design

2. **Brand Identity**
   - Emphasizes mobile app nature
   - Modern, premium feel

3. **Focus**
   - Content contained in frame
   - Less distraction on large screens

### Development

1. **Simple Integration**
   - Single wrapper component
   - No complex logic

2. **Maintainable**
   - Pure CSS solution
   - Easy to customize

3. **Responsive**
   - Automatic mobile/desktop switch
   - No manual handling needed

## Testing

### Visual Tests

- [ ] Frame renders correctly on desktop
- [ ] App hidden on mobile
- [ ] Dynamic Island positioned correctly
- [ ] Side buttons visible
- [ ] Shadow effects working
- [ ] Gradient background smooth

### Responsive Tests

- [ ] Switch from mobile → desktop at 768px
- [ ] No layout shift
- [ ] Content fits in frame
- [ ] Scrolling works inside frame

### Dark Mode Tests

- [ ] Colors correct in dark mode
- [ ] Blur effects visible
- [ ] Phone bezel contrast
- [ ] Text readable

## Future Enhancements

Potential additions:

1. **Interactive Elements**
   - Click buttons for haptic feedback
   - Tilt effect on hover
   - 3D rotation

2. **Multiple Devices**
   - Switch between iPhone models
   - Android device option
   - Tablet view

3. **Themes**
   - Different phone colors
   - Custom backgrounds
   - Animated effects

4. **Screen Recording**
   - Capture mockup view
   - Export as image
   - Share functionality

## Files Structure

```
src/components/layout/
├── PhoneFrame.tsx       # Main component
├── Layout.tsx           # Updated with PhoneFrame
└── index.ts             # Export PhoneFrame
```

## Code Quality

### TypeScript

```tsx
interface PhoneFrameProps {
  children: ReactNode;
}
```

### Accessibility

- No impact on screen readers
- Content remains accessible
- Semantic HTML structure

### Performance

- Zero JavaScript
- CSS-only solution
- Hardware accelerated

Perfect! 📱✨
