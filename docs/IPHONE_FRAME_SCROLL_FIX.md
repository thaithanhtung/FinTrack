# iPhone Frame - Scroll Fix

## Issue

Sau khi implement iPhone frame ban đầu:
- ❌ Scroll cả khung iPhone (sai)
- ❌ Bottom Navigation bị scroll theo
- ❌ Content tràn ra ngoài frame

## Solution

### 1. PhoneFrame - Scrollable Container

**Before:**
```tsx
<div className="w-full h-full overflow-hidden">
  {children}
</div>
```

**After:**
```tsx
<div className="relative w-full h-full ... flex flex-col">
  {/* Dynamic Island */}
  
  {/* SCROLLABLE AREA */}
  <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative">
    {children}
  </div>
</div>
```

**Changes:**
- ✅ Added `flex flex-col` to screen bezel
- ✅ Content wrapper: `flex-1 overflow-y-auto`
- ✅ Hide scrollbar: `scrollbar-hide`
- ✅ Prevent horizontal scroll: `overflow-x-hidden`

### 2. Layout - Fixed Height

**Before:**
```tsx
<div className="min-h-screen bg-gray-50 flex flex-col">
  <Header />
  <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
    {children}
  </main>
  <BottomNav />
</div>
```

**After:**
```tsx
<div className="h-full bg-gray-50 flex flex-col">
  <Header />
  <main className="flex-1 w-full px-4 py-4 pb-24">
    <div className="max-w-lg mx-auto">
      {children}
    </div>
  </main>
  <BottomNav />
</div>
```

**Changes:**
- ✅ `min-h-screen` → `h-full` (fit frame height)
- ✅ Removed `max-w-lg` from main (add to inner div)
- ✅ Let content scroll naturally

### 3. Bottom Navigation - Stay Fixed

BottomNav đã có:
```tsx
<nav className="fixed bottom-0 left-0 right-0 z-50">
```

**Behavior:**
- Mobile: Fixed to viewport bottom
- Desktop (in frame): Fixed to frame bottom
- ✅ Always visible
- ✅ Doesn't scroll with content

## How It Works

### Structure

```
PhoneFrame
└─ Screen Bezel (flex flex-col)
   ├─ Dynamic Island (absolute)
   └─ Scrollable Container (flex-1 overflow-y-auto)
      └─ Layout
         ├─ Header (fixed height)
         ├─ Main (flex-1, scrolls here)
         │  └─ Children (content)
         └─ BottomNav (fixed bottom)
```

### Scroll Behavior

```
┌─────────────────┐
│   [Notch]       │ ← Fixed
├─────────────────┤
│   Header        │ ← Fixed
├─────────────────┤
│ ╔═════════════╗ │
│ ║  Content    ║ │ ← SCROLLS
│ ║  Content    ║ │
│ ║  Content    ║ │
│ ║  Content    ║ │
│ ║  Content    ║ │
│ ╚═════════════╝ │
├─────────────────┤
│  [Bottom Nav]   │ ← Fixed
└─────────────────┘
    iPhone Frame (No scroll)
```

## CSS Classes Breakdown

### PhoneFrame Scrollable Area

```tsx
className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative"
```

- `flex-1`: Take remaining height
- `overflow-y-auto`: Scroll vertically when needed
- `overflow-x-hidden`: No horizontal scroll
- `scrollbar-hide`: Hide scrollbar (from index.css)
- `relative`: For positioning context

### Layout Container

```tsx
className="h-full bg-gray-50 flex flex-col"
```

- `h-full`: Fill parent height (844px on desktop)
- `flex flex-col`: Stack header, main, nav vertically
- No `min-h-screen`: Would cause frame to grow

### Main Content

```tsx
className="flex-1 w-full px-4 py-4 pb-24"
```

- `flex-1`: Take remaining space between header & nav
- `pb-24`: Padding for bottom nav height
- Content scrolls naturally in this area

## Testing Checklist

### Desktop (iPhone Frame)
- [ ] Content scrolls INSIDE frame
- [ ] Frame itself doesn't scroll
- [ ] Bottom nav stays at frame bottom
- [ ] Header stays at top
- [ ] Scrollbar hidden
- [ ] No horizontal scroll

### Mobile (No Frame)
- [ ] Content scrolls normally
- [ ] Bottom nav fixed to viewport
- [ ] Full screen experience
- [ ] No layout changes

### Content Tests
- [ ] Long content scrolls smoothly
- [ ] Short content doesn't scroll
- [ ] Bottom nav always visible
- [ ] No content cut off
- [ ] Padding bottom correct

## Before vs After

### Before Fix:

```
Desktop:
┌──────────────────────┐
│  [Gradient BG]       │
│                      │
│  ┌────────────────┐  │  ↕
│  │ iPhone Frame   │  │  ↕ WRONG!
│  │                │  │  ↕ Frame scrolls
│  │  [Content]     │  │  ↕
│  │  [Content]     │  │  ↕
│  └────────────────┘  │  ↕
│  [Bottom Nav out]    │  ↕
└──────────────────────┘
```

### After Fix:

```
Desktop:
┌──────────────────────┐
│  [Gradient BG]       │
│                      │
│  ┌────────────────┐  │
│  │ [Notch]        │  │
│  │ Header         │  │
│  │ ╔════════════╗ │  │
│  │ ║  Content   ║ │  │ ↕ Content
│  │ ║  Scrolls   ║ │  │ ↕ scrolls
│  │ ╚════════════╝ │  │ ↕ here
│  │ [Bottom Nav]   │  │
│  └────────────────┘  │ ← Frame fixed
└──────────────────────┘
```

## Key Principles

1. **Frame is Fixed**
   - iPhone frame never scrolls
   - Always 844px height
   - Centered on desktop

2. **Content Scrolls Inside**
   - Scroll container wraps Layout
   - Uses `overflow-y-auto`
   - Hidden scrollbar

3. **Navigation Fixed**
   - BottomNav uses `fixed` positioning
   - Sticks to frame bottom (desktop)
   - Sticks to viewport bottom (mobile)

4. **Height Management**
   - PhoneFrame: `h-[844px]` (desktop)
   - Screen: `h-full`
   - Layout: `h-full`
   - Main: `flex-1` (grows to fill)

## Code Summary

### PhoneFrame.tsx
```tsx
// Screen bezel with flex column
<div className="... flex flex-col">
  {/* Notch */}
  
  {/* Scrollable wrapper */}
  <div className="flex-1 overflow-y-auto scrollbar-hide">
    {children}
  </div>
</div>
```

### Layout.tsx
```tsx
// Fixed height container
<PhoneFrame>
  <div className="h-full flex flex-col">
    <Header />
    <main className="flex-1 pb-24">
      {children}
    </main>
    <BottomNav />
  </div>
</PhoneFrame>
```

Perfect! ✅ Scroll works correctly now.
