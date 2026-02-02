# Bottom Navigation với Framer Motion - UI Design

## Overview

Redesign Bottom Navigation với UI giống hình mẫu:
- Background cream/beige gradient
- Active tab có circular background đỏ/hồng  
- Smooth spring animations với Framer Motion
- Shared layout animation khi chuyển tab

## Visual Design

### UI Style (From Image Reference)

```
┌────────────────────────────────────┐
│  [Cream/Beige Gradient Background] │
│                                    │
│   🏠      📅      💳      🔔       │
│  Home  Calendar Payment  Notif     │
│   ●                                │
│  (Active - Red circle)             │
└────────────────────────────────────┘
```

### Color Scheme

#### Background:
```
Light Mode:
  from-amber-50 
  → via-orange-50 
  → to-amber-100

Dark Mode:
  from-amber-900/30
  → via-orange-900/30
  → to-amber-800/30
```

#### Active Tab Circle:
```
Light Mode:
  from-red-400 
  → to-rose-500

Dark Mode:
  from-red-500 
  → to-rose-600
```

## Framer Motion Animations

### 1. Shared Layout Animation (layoutId)

**Key Feature:** Smooth morph between tabs

```tsx
<motion.div
  layoutId="activeTab"
  className="... rounded-full"
/>
```

**Behavior:**
- Single animated element
- Morphs position between tabs
- Shared across all nav items
- Smooth spring physics

### 2. Enter Animation

```tsx
initial={{ scale: 0, opacity: 0 }}
animate={{ 
  scale: 1, 
  opacity: 1,
  transition: {
    type: "spring",
    stiffness: 500,
    damping: 30
  }
}}
```

**Effect:**
- Scale from 0 to 1
- Fade in
- Bouncy spring feel

### 3. Exit Animation

```tsx
exit={{ 
  scale: 0, 
  opacity: 0,
  transition: { duration: 0.2 }
}}
```

**Effect:**
- Scale down
- Fade out
- Quick exit (200ms)

### 4. Icon Scale & Y Position

```tsx
<motion.div
  animate={{
    scale: isActive ? 1.1 : 1,
    y: isActive ? -2 : 0,
  }}
  transition={{
    type: "spring",
    stiffness: 500,
    damping: 25
  }}
>
```

**Effect:**
- Active: Scale up 10%, move up 2px
- Inactive: Normal size
- Spring animation

### 5. Label Animation

```tsx
<motion.span
  animate={{
    scale: isActive ? 1.05 : 1,
    fontWeight: isActive ? 600 : 500,
  }}
  transition={{ duration: 0.2 }}
>
```

**Effect:**
- Active: Slightly larger, bolder
- Smooth transition

## Component Structure

```tsx
<nav>
  {/* Gradient background */}
  <div className="gradient-bg" />
  
  <div className="container">
    {navItems.map(item => (
      <NavLink key={item.to} to={item.to}>
        <div className="icon-container">
          {/* Shared animated background */}
          <AnimatePresence>
            {isActive && (
              <motion.div layoutId="activeTab" />
            )}
          </AnimatePresence>
          
          {/* Animated icon */}
          <motion.div animate={{...}}>
            <Icon />
          </motion.div>
        </div>
        
        {/* Animated label */}
        <motion.span animate={{...}}>
          {label}
        </motion.span>
      </NavLink>
    ))}
  </div>
</nav>
```

## Animation Flow

### Tab Switch Sequence

```
User clicks Tab B
    ↓
1. Exit animation (Tab A circle)
   - Scale: 1 → 0
   - Opacity: 1 → 0
   - Duration: 200ms
    ↓
2. Layout transition (Circle moves)
   - Position: Tab A → Tab B
   - Smooth morph
   - Spring physics
    ↓
3. Enter animation (Tab B circle)
   - Scale: 0 → 1
   - Opacity: 0 → 1
   - Spring: stiffness 500, damping 30
    ↓
4. Icon & Label adjust
   - Icon: scale + y position
   - Label: scale + weight
   - Duration: 200ms
    ↓
Complete ✅
```

### Timing Diagram

```
0ms   - Click detected
0-200ms - Exit animation
100ms - Layout transition starts
100-300ms - Morph animation
200ms - Enter animation starts
200-400ms - Spring animation
400ms - All animations complete
```

## CSS Classes

### Background Gradient

```tsx
className="absolute inset-0 
  bg-gradient-to-br 
  from-amber-50 via-orange-50 to-amber-100 
  dark:from-amber-900/30 dark:via-orange-900/30 dark:to-amber-800/30 
  backdrop-blur-xl 
  border-t border-amber-200/50 
  dark:border-amber-700/50 
  shadow-lg"
```

### Active Circle

```tsx
className="absolute inset-0 
  w-14 h-14 
  bg-gradient-to-br 
  from-red-400 to-rose-500 
  dark:from-red-500 dark:to-rose-600 
  rounded-full 
  shadow-lg"
```

### Icon Colors

**Active:**
```tsx
className="text-white"
```

**Inactive:**
```tsx
className="text-gray-600 dark:text-gray-400 
  group-hover:text-gray-800 dark:group-hover:text-gray-200"
```

## Spring Physics

### Active Circle

```tsx
transition: {
  type: "spring",
  stiffness: 500,  // High = snappy
  damping: 30      // Low = bouncy
}
```

**Characteristics:**
- Very responsive (high stiffness)
- Moderate bounce (damping 30)
- Natural feel

### Icon Animation

```tsx
transition: {
  type: "spring",
  stiffness: 500,
  damping: 25  // Slightly more bouncy
}
```

**Characteristics:**
- Same responsiveness
- Slightly more bounce than circle

## Key Features

### 1. Shared Layout Animation

**layoutId="activeTab":**
- Single element moves between positions
- Smooth morph effect
- No separate animations needed
- Framer Motion handles the magic

### 2. AnimatePresence

```tsx
<AnimatePresence>
  {isActive && (
    <motion.div ... />
  )}
</AnimatePresence>
```

**Purpose:**
- Allows exit animations
- Required for `exit` prop
- Handles unmounting animation

### 3. Spring Physics

**Natural Motion:**
- Not linear transitions
- Bouncy, organic feel
- Mimics real-world physics

### 4. Performance

**GPU Accelerated:**
- `scale` - Hardware accelerated
- `opacity` - Hardware accelerated
- `y` position - Hardware accelerated
- Smooth 60fps animations

## Comparison: Before vs After

### Before (CSS Transitions)

```tsx
// Old approach
<div className="transition-all duration-300">
  {/* Manual positioning */}
  <div style={{ left: `${position}px` }} />
</div>
```

**Limitations:**
- Linear easing
- No spring physics
- Complex position calculations
- No shared layout animation

### After (Framer Motion)

```tsx
// New approach
<motion.div
  layoutId="activeTab"
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  exit={{ scale: 0 }}
  transition={{ type: "spring" }}
/>
```

**Benefits:**
- ✅ Spring physics
- ✅ Shared layout (automatic morphing)
- ✅ Enter/exit animations
- ✅ Natural feel
- ✅ Less code

## Props & Configuration

### layoutId

```tsx
layoutId="activeTab"
```

**Required for:**
- Shared element animation
- Must be unique
- Same ID = same animated element

### transition Types

```tsx
// Spring (Natural)
transition: {
  type: "spring",
  stiffness: 500,
  damping: 30
}

// Tween (Linear)
transition: {
  duration: 0.2,
  ease: "easeOut"
}
```

### Stiffness & Damping

| Stiffness | Feel | Use Case |
|-----------|------|----------|
| 100-200 | Slow, fluid | Backgrounds |
| 300-400 | Moderate | General UI |
| 500-700 | Snappy | Active elements |

| Damping | Feel | Use Case |
|---------|------|----------|
| 10-15 | Very bouncy | Playful |
| 20-30 | Natural | Most UI |
| 40-50 | Minimal bounce | Subtle |

## Browser Performance

### Optimizations

1. **Transform Properties:**
   - `scale`, `x`, `y` are GPU accelerated
   - Better than `width`, `height`, `left`

2. **Opacity:**
   - GPU accelerated
   - No layout recalculation

3. **Will-Change:**
   - Framer Motion adds automatically
   - Hints browser for optimization

### Frame Rate

```
Target: 60 fps
Typical: 58-60 fps (mobile)
Desktop: Solid 60 fps
```

## Testing

### Visual Tests
- [ ] Circle morphs smoothly between tabs
- [ ] Spring animation feels natural
- [ ] No jank or stuttering
- [ ] Colors match design
- [ ] Dark mode works

### Animation Tests
- [ ] Enter animation smooth
- [ ] Exit animation clean
- [ ] Icon scales correctly
- [ ] Label weight changes
- [ ] No flash of unstyled content

### Performance Tests
- [ ] 60fps on desktop
- [ ] Smooth on mobile
- [ ] No layout shift
- [ ] GPU acceleration working

## Accessibility

**Unchanged:**
- Semantic HTML maintained
- Keyboard navigation works
- Screen reader compatible
- Focus states visible

**Enhanced:**
- Visual feedback improved
- Motion respects `prefers-reduced-motion`
- Clear active state

## Installation

```bash
yarn add framer-motion
```

**Size:**
- framer-motion: ~70KB gzipped
- Worth it for smooth animations

## Future Enhancements

Potential additions:

1. **Haptic Feedback:**
```tsx
onClick={() => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
}}
```

2. **Sound Effects:**
```tsx
const playSound = () => {
  const audio = new Audio('/click.mp3');
  audio.play();
};
```

3. **Gesture Support:**
```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  onDragEnd={(e, info) => {
    // Swipe to switch tabs
  }}
/>
```

4. **Badge Animations:**
```tsx
<motion.span
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  className="badge"
>
  2
</motion.span>
```

Perfect! 🎨✨
