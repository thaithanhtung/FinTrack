# Fix Bottom Navigation Inside iPhone Frame

## Problem

Bottom Navigation vẫn ở ngoài iPhone frame vì:
- `fixed` positioning relative to **viewport**
- Không relative to **parent container** (frame)

```
❌ Before:
┌──────────────────────────┐
│   [Background]           │
│                          │
│  ┌────────────────┐      │
│  │ iPhone Frame   │      │
│  │                │      │
│  │  [Content]     │      │
│  │                │      │
│  └────────────────┘      │
│                          │
│ [Bottom Nav ở ngoài]     │ ← WRONG!
└──────────────────────────┘
```

## Solution

Change positioning based on screen size:
- **Mobile:** `fixed` (to viewport)
- **Desktop:** `absolute` (to parent container)

### Changes

#### 1. BottomNav.tsx - Conditional Positioning

```tsx
// Before
<nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">

// After
<nav className="fixed md:absolute bottom-0 left-0 right-0 z-50 md:pb-0 pb-safe">
```

**Explanation:**
- `fixed`: Mobile default
- `md:absolute`: Desktop override
- `md:pb-0`: Remove safe area padding on desktop
- `pb-safe`: Keep safe area on mobile

#### 2. Layout.tsx - Add Relative Parent

```tsx
// Before
<div className="h-full bg-gray-50 flex flex-col">

// After
<div className="h-full bg-gray-50 flex flex-col relative">
```

**Explanation:**
- `relative`: Creates positioning context
- `absolute` children position relative to this

#### 3. Add overflow to main

```tsx
<main className="flex-1 w-full px-4 py-4 pb-24 overflow-y-auto">
```

**Explanation:**
- `overflow-y-auto`: Enable scroll in main content area

## How It Works

### Mobile (< 768px)

```
Viewport
┌─────────────────┐
│                 │
│    Content      │
│                 │
│                 │
└─────────────────┘
│  [Bottom Nav]   │ ← Fixed to viewport
└─────────────────┘
```

**CSS:**
```css
position: fixed;
bottom: 0;
padding-bottom: safe-area-inset;
```

### Desktop (≥ 768px)

```
iPhone Frame
┌─────────────────┐
│  [Notch]        │
│  Header         │
│  ┌───────────┐  │
│  │ Content   │  │
│  │ Scrolls   │  │
│  └───────────┘  │
│  [Bottom Nav]   │ ← Absolute to frame
└─────────────────┘
```

**CSS:**
```css
position: absolute;
bottom: 0;
padding-bottom: 0;
```

## Structure

```tsx
<PhoneFrame>
  <div className="... overflow-y-auto">  {/* Scrollable wrapper */}
    <Layout>
      <div className="... relative">  {/* Positioning context */}
        <Header />
        <main className="... overflow-y-auto">  {/* Main scroll area */}
          {children}
        </main>
        <BottomNav />  {/* fixed (mobile) / absolute (desktop) */}
      </div>
    </Layout>
  </div>
</PhoneFrame>
```

## CSS Breakdown

### BottomNav Classes

```tsx
className="fixed md:absolute bottom-0 left-0 right-0 z-50 md:pb-0 pb-safe"
```

| Class | Mobile | Desktop | Purpose |
|-------|--------|---------|---------|
| `fixed` | ✅ | ❌ | Stick to viewport |
| `md:absolute` | ❌ | ✅ | Position in frame |
| `bottom-0` | ✅ | ✅ | Align to bottom |
| `left-0 right-0` | ✅ | ✅ | Full width |
| `z-50` | ✅ | ✅ | Above content |
| `pb-safe` | ✅ | ❌ | Safe area (mobile) |
| `md:pb-0` | ❌ | ✅ | No padding (desktop) |

### Layout Container

```tsx
className="h-full bg-gray-50 flex flex-col relative"
```

| Class | Purpose |
|-------|---------|
| `h-full` | Fill frame height |
| `flex flex-col` | Stack vertically |
| `relative` | Positioning context for absolute children |

### Main Content

```tsx
className="flex-1 w-full px-4 py-4 pb-24 overflow-y-auto"
```

| Class | Purpose |
|-------|---------|
| `flex-1` | Grow to fill space |
| `pb-24` | Bottom padding for nav |
| `overflow-y-auto` | Scroll when content overflows |

## Testing Results

### Mobile
- ✅ Bottom Nav fixed to viewport bottom
- ✅ Stays visible while scrolling
- ✅ Safe area padding applied
- ✅ Full screen layout

### Desktop (iPhone Frame)
- ✅ Bottom Nav inside frame
- ✅ Stays at frame bottom
- ✅ Scroll works inside frame
- ✅ No safe area padding
- ✅ Content doesn't overflow frame

## Before vs After

### Before Fix

**Desktop:**
```
┌────────────────────────────┐
│   [Gradient Background]    │
│                            │
│  ┌──────────────────┐      │
│  │  [Notch]         │      │
│  │  Header          │      │
│  │  Content         │      │
│  │  Content         │      │
│  └──────────────────┘      │
│         iPhone             │
│                            │
└────────[Nav]───────────────┘
          ↑ Nav outside frame!
```

### After Fix

**Desktop:**
```
┌────────────────────────────┐
│   [Gradient Background]    │
│                            │
│  ┌──────────────────┐      │
│  │  [Notch]         │      │
│  │  Header          │      │
│  │  ┌────────────┐  │      │
│  │  │  Content   │  │      │
│  │  │  Scrolls   │  │      │
│  │  └────────────┘  │      │
│  │  [Bottom Nav]    │      │
│  └──────────────────┘      │
│         iPhone             │
│                            │
└────────────────────────────┘
    ✅ Nav inside frame!
```

## Code Changes Summary

### BottomNav.tsx

```diff
- <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
+ <nav className="fixed md:absolute bottom-0 left-0 right-0 z-50 md:pb-0 pb-safe">
```

### Layout.tsx

```diff
- <div className="h-full bg-gray-50 flex flex-col">
+ <div className="h-full bg-gray-50 flex flex-col relative">

- <main className="flex-1 w-full px-4 py-4 pb-24">
+ <main className="flex-1 w-full px-4 py-4 pb-24 overflow-y-auto">
```

## Key Concepts

### Fixed vs Absolute

**Fixed:**
- Position relative to **viewport**
- Stays in place when scrolling
- Use for mobile bottom nav

**Absolute:**
- Position relative to **nearest positioned ancestor**
- Moves with parent when scrolling
- Use for desktop frame nav

### Responsive Positioning

```css
/* Mobile: Fixed to viewport */
position: fixed;

/* Desktop: Absolute to parent */
@media (min-width: 768px) {
  position: absolute;
}
```

### Safe Area

```css
/* Mobile: Add safe area padding */
padding-bottom: env(safe-area-inset-bottom);

/* Desktop: No safe area needed */
@media (min-width: 768px) {
  padding-bottom: 0;
}
```

Perfect! ✅ Bottom Nav now correctly positioned.
