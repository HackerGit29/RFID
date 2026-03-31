# Design System Specification: Industrial Precision

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Foreman."** 

In an industrial context, precision isn't just a preference—it’s a safety requirement. This system moves away from the "bubbly" consumer SaaS aesthetic toward a high-fidelity, editorial experience that feels authoritative, rugged, yet technologically advanced. We achieve this through **Atmospheric Depth**: replacing harsh lines with tonal shifts, using intentional asymmetry in data visualization, and employing "Glassmorphism" to mimic the high-tech heads-up displays (HUDs) found in modern industrial machinery. 

The goal is to make the user feel like they are operating a premium instrument, not just a tracking app.

---

## 2. Colors & Surface Philosophy
We utilize a sophisticated Material 3-inspired tonal palette. The core of the experience is built on `surface` (#0b1326) and its derivatives to create a sense of deep, focused space.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning or grouping. 
Boundaries must be defined through background color shifts. For example, a card should not have a border; it should be a `surface_container_low` (#131b2e) element sitting on a `surface` (#0b1326) background. 

### Surface Hierarchy
Create "nested" depth using the container tiers:
- **Lowest (`#060e20`):** Used for deep background elements or recessed "well" areas.
- **Low (`#131b2e`):** The standard background for secondary content.
- **Surface (`#0b1326`):** The primary app canvas.
- **High (`#222a3d`):** Primary card backgrounds.
- **Highest (`#2d3449`):** Elements that require immediate interaction (e.g., active input fields).

### The "Glass & Gradient" Rule
To elevate the "Industrial Tech" feel, use **Glassmorphism** for floating elements like navigation bars or modal headers. 
- **Effect:** Background `surface_variant` (#2d3449) at 60% opacity with a 20px Backdrop Blur.
- **Gradients:** Use a subtle "Signature Glow" for primary CTAs: a linear gradient from `primary` (#adc6ff) to `on_primary_container` (#357df1) at a 135-degree angle.

---

## 3. Typography
The system uses a dual-font approach to balance industrial utility with editorial elegance.

*   **Display & Headlines (Manrope):** High-character, modern sans-serif. Used for data totals, tool names, and page titles. The wide apertures feel "Industrial Modern."
*   **Body & Labels (Inter):** Highly legible at small scales. Used for technical specs, serial numbers, and status updates.

| Role | Font | Size | Weight | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Display-LG** | Manrope | 3.5rem | Bold | -0.02em |
| **Headline-SM** | Manrope | 1.5rem | SemiBold | -0.01em |
| **Title-MD** | Inter | 1.125rem | Medium | 0 |
| **Body-MD** | Inter | 0.875rem | Regular | 0 |
| **Label-SM** | Inter | 0.6875rem | Bold | +0.05em (Caps) |

---

## 4. Elevation & Depth
We eschew traditional "drop shadows" in favor of **Tonal Layering**.

### The Layering Principle
Hierarchy is achieved by "stacking" surface tiers. An item of high importance (like an active tool alert) should be placed in a `surface_container_highest` container. The contrast between `#0b1326` (Canvas) and `#2d3449` (High Card) creates a natural lift.

### Ambient Shadows
If a floating effect is required (e.g., a Draggable Bottom Sheet):
- **Shadow:** 0px 16px 40px
- **Color:** `surface_container_lowest` (#060e20) at 40% opacity. 
- **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` (#45464d) at **15% opacity**. Never use a 100% opaque stroke.

---

## 5. Components

### Buttons
- **Primary:** Gradient (`primary` to `on_primary_container`). Roundedness: `xl` (1.5rem). Use `on_primary` (#002e6a) for text.
- **Secondary:** Surface-tonal. `secondary_container` background with `on_secondary_container` text. No border.
- **Tertiary:** Text-only using `primary` color, strictly for low-priority actions like "View Specs."

### Cards & Lists
**Forbid the use of divider lines.** 
- To separate tools in a list, use a vertical spacing of `spacing.3` (0.75rem) and alternate background shades if necessary.
- Use `xl` (1.5rem) corner radius for all primary cards to match the iOS 16+ high-fidelity aesthetic.

### Input Fields
- **Default State:** `surface_container_high` background. No border.
- **Focus State:** `outline` (#909097) "Ghost Border" at 40% with a subtle `primary` outer glow.
- **Industrial Detail:** Use `label-sm` in all-caps for field headers to evoke technical blueprints.

### Draggable Bottom Sheets
Used for tool diagnostics.
- **Material:** Glassmorphic `surface_container_high` (80% opacity) with a 32px blur.
- **Handle:** A `secondary_fixed_dim` pill, 40px wide, 4px tall, with 20% opacity.

### Specialized Component: "The Status HUD"
A high-contrast chip for tool health.
- **Healthy:** `tertiary_container` background with `on_tertiary` text.
- **Critical:** `error_container` background with `on_error` text.

---

## 6. Do's and Don'ts

### Do
- **Do** use `spacing.8` (2rem) as your standard "breath" between major content sections.
- **Do** lean into asymmetry. For example, a "Tool Image" can bleed off the right edge of a card to create a sense of scale.
- **Do** use `surface_bright` for interactive icons to ensure they "pop" against the deep navy background.

### Don't
- **Don't** use pure black (#000000) or pure white (#FFFFFF). Always use the provided tonal tokens to maintain the "Industrial Tech" atmosphere.
- **Don't** use standard 1px dividers. They clutter the UI and break the premium "Liquid Glass" feel.
- **Don't** use a corner radius smaller than `md` (0.75rem) for interactive elements. We want a "hardened" but ergonomic look.

---

## 7. Spacing Scale
Maintain a rigid 4px/8px grid system to ensure "Industrial" precision.

- **Micro:** `0.5` (2px), `1` (4px), `2` (8px)
- **Layout:** `4` (16px), `6` (24px), `8` (32px), `10` (40px)
- **Sectioning:** `16` (64px) for massive hero breathing room.