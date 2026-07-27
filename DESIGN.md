---
name: Sezzam Precision
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1b1c1a'
  on-surface-variant: '#434843'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#737973'
  outline-variant: '#c3c8c1'
  surface-tint: '#4d6453'
  primary: '#061b0e'
  on-primary: '#ffffff'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  inverse-primary: '#b4cdb8'
  secondary: '#5b5f60'
  on-secondary: '#ffffff'
  secondary-container: '#e0e3e4'
  on-secondary-container: '#616566'
  tertiary: '#0c1728'
  on-tertiary: '#ffffff'
  tertiary-container: '#212c3d'
  on-tertiary-container: '#8893a8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9d4'
  primary-fixed-dim: '#b4cdb8'
  on-primary-fixed: '#0b2013'
  on-primary-fixed-variant: '#364c3c'
  secondary-fixed: '#e0e3e4'
  secondary-fixed-dim: '#c4c7c8'
  on-secondary-fixed: '#181c1d'
  on-secondary-fixed-variant: '#434748'
  tertiary-fixed: '#d8e3fa'
  tertiary-fixed-dim: '#bcc7dd'
  on-tertiary-fixed: '#111c2c'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2e0'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system is rooted in the philosophy of "Industrial Elegance." It translates the rugged nature of building materials into a premium, digital boutique experience. The visual language is heavily influenced by high-end electronics storefronts, prioritizing clarity, technical precision, and a sense of calm reliability.

The aesthetic follows a **Refined Minimalist** approach. It utilizes expansive whitespace to allow product photography—often featuring raw textures like concrete, timber, and steel—to serve as the primary visual driver. The emotional response should be one of absolute confidence and professional order, stripping away the "warehouse" clutter typical of the industry in favor of a curated, high-fidelity gallery.

## Colors
The palette is architectural and grounded. 

*   **Primary (#1B3022):** A deep, sophisticated Forest Green used exclusively for primary actions and key brand touchpoints. It conveys growth and sustainability while remaining heavy enough to feel structural.
*   **Neutral Foundation:** We utilize a trio of whites and grays to create subtle depth. Pure White is for the primary canvas; the soft warm off-white (#F9F8F6) is used for section containers to prevent "starkness"; the light gray (#F2F2F2) is reserved for utility backgrounds like input fields or table headers.
*   **Typography:** Slate Gray (#2D3132) provides high legibility for headings without the harshness of pure black, while the accent Slate (#4A5568) is used for secondary metadata and icons.

## Typography
The system uses **Inter** exclusively to maintain a systematic, utilitarian aesthetic. 

The type hierarchy is designed for quick scanning of technical specifications. Large "Display" and "Headline" levels use tighter letter spacing and semi-bold weights to feel impactful and modern. Body text is set with generous line heights (1.6) to ensure technical descriptions remain readable. 

A specific "Label Caps" style is used for categories, overlines, and technical tags to provide a structured, "blueprinted" look to the information architecture.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to maintain the "editorial" feel of premium electronics sites. 

*   **Grid:** A 12-column grid with a 24px gutter. 
*   **Margins:** Large 48px outer margins on desktop create a "frame" effect, pushing content toward the center for better focus. On mobile, this reduces to 16px to maximize screen real estate.
*   **Rhythm:** We use an 8px base unit. Vertical spacing between sections (Stack LG) should be aggressive (48px+) to allow the design to "breathe," signaling that this is a premium experience, not a discount hardware store.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.

*   **Surfaces:** Backgrounds move from White (Level 0) to Off-White (Level 1) to indicate containment.
*   **Borders:** Most components use a thin 1px border (#E2E8F0) to define their shape. 
*   **Shadows:** When used (e.g., on hover for cards), shadows are "Ambient"—extremely diffused with a large blur radius (20px+) and very low opacity (0.04), making the element appear to float slightly off the page without adding visual weight.

## Shapes
The shape language balances industrial precision with modern approachability. 

The standard corner radius is **8px (Level 2)** for cards and input fields. This provides a "softened-technical" look. For buttons and interactive chips, the system pivots to **Pill-shaped** (fully rounded) geometries to clearly differentiate "active" clickable elements from "passive" layout containers.

## Components
Consistent execution of components is vital for the "Sezzam" identity:

*   **Buttons:** Primary buttons are pill-shaped, filled with Deep Forest Green (#1B3022), using white centered text. Secondary buttons use a 1px Slate border with no fill.
*   **Cards:** Product cards use a white background with an 8px radius and a subtle 1px border. There is no shadow in the default state; a soft ambient shadow appears only on hover.
*   **Input Fields:** Text inputs use the light gray (#F2F2F2) background with no border, transitioning to a white background with a 1px Forest Green border when focused.
*   **Chips & Tags:** Small pill-shaped containers with a light gray fill and "Label-Caps" typography, used for product attributes like "In Stock" or "Eco-Friendly."
*   **Lists:** Technical specifications should be presented in clean, border-bottom separated lists with generous padding (16px) between items, using the Slate Gray for labels and muted gray for values.
*   **Icons:** Use thin-stroke (1.5px) linear icons to match the weight of the typography.