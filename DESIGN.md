---
version: alpha
name: Barakah App
description: A calm, editorial faith-based marketing system with a clean white canvas, deep green accents, and high-contrast serif headlines.
colors:
  primary: "#29603e"
  secondary: "#000000"
  tertiary: "#6B7280"
  neutral: "#E5E7EB"
  surface: "#FFFFFF"
  on-surface: "#000000"
  background: "#FFFFFF"
  accent: "#29603E"
  error: "#B42318"
  success: "#29603E"
typography:
  headline-display:
    fontFamily: "Libre Baskerville"
    fontSize: "38px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0px"
  headline-lg:
    fontFamily: "Libre Baskerville"
    fontSize: "31px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0px"
  headline-md:
    fontFamily: "Libre Baskerville"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0px"
  headline-sm:
    fontFamily: "Inter"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Inter"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0px"
  body-md:
    fontFamily: "Inter"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0px"
  label-lg:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0px"
  label-md:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0px"
  label-sm:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0px"
  caption:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0px"
  overline:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0px"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 24px
  full: 9999px
spacing:
  xs: 6px
  sm: 14px
  md: 24px
  lg: 40px
  xl: 100px
  gutter: 24px
  margin: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "25px 30px"
    height: "75px"
    width: "258px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "25px 30px"
    height: "75px"
    width: "258px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "25px 30px"
    height: "75px"
    width: "258px"
  button-link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "14px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "6px"
  banner:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-md}"
    padding: "6px"
---

# Barakah App

## Overview
Barakah App feels calm, trustworthy, and editorial, with a clear spiritual and educational mission. The page uses a bright white background, a deep green brand accent, and a classic serif headline treatment to create a premium yet approachable tone. The layout is spacious and conversion-focused, designed for mobile-first users but presented with enough breathing room to feel polished on desktop.

## Colors
- **Primary (#29603E):** A deep mosque-green used for the brand mark, the top announcement bar, the main CTA, and emphasis accents. It communicates trust, growth, and a grounded Islamic identity.
- **Secondary (#000000):** Crisp black used for headline text, navigation details, and strong contrast on white surfaces. It anchors the editorial serif typography and keeps messaging highly legible.
- **Tertiary (#6B7280):** A muted gray used for supporting copy and less prominent metadata, such as secondary annotations beneath the CTA. It softens the hierarchy without feeling weak.
- **Neutral (#E5E7EB):** A light gray border tone used for subtle dividers and card outlines. It supports structure while preserving the mostly flat, airy presentation.
- **Surface (#FFFFFF):** The dominant background and component base color. It reinforces openness, clarity, and a minimal reading experience.
- **On-surface (#000000):** The default readable text color on white cards and surfaces. It ensures strong contrast and a clean, modern look.
- **Background (#FFFFFF):** The page canvas is pure white, giving the interface a bright, distraction-free feel.
- **Accent (#29603E):** A repeated identity color matching the primary green. Use it for interactive highlights, progress indicators, and brand moments.
- **Error (#B42318):** Reserved for invalid states only; it is not visually prominent in the current screenshots.
- **Success (#29603E):** Reuses the green brand color for positive confirmations and trusted success messaging.

## Typography
The system combines two families: Libre Baskerville for expressive editorial headlines and Inter for all interface and supporting text. Headlines are bold, high-contrast, and slightly classical, while body copy stays neutral and highly legible. 

- **headline-display / headline-lg / headline-md:** Libre Baskerville, 700 weight, used for hero statements and section titles. These levels should feel dignified, confident, and slightly luxurious.
- **headline-sm:** Inter, 600 weight, used for compact strong titles or card headings where readability matters more than drama.
- **body-lg / body-md:** Inter, regular weight, used for supporting copy and explanatory text. Keep line length comfortable and line height open.
- **body-sm:** Inter, regular weight, used for fine print, metadata, and inline notes.
- **label-lg / label-md / label-sm:** Inter, medium weight, used for buttons, navigation, badges, and small UI labels. This is the primary utility language for actions.
- **caption / overline:** Inter, smaller utility levels for legal text, annotations, and tiny UI support content.

## Layout
The layout is centered and vertically stacked, with a strong hero section occupying the middle of the viewport. Content appears to live within a generous fixed-width column rather than a dense multi-column grid, which keeps attention on the headline and CTA. Spacing is roomy and rhythmic: use large section gaps, medium card padding, and small text-to-text spacing for supporting details. The observed scale favors 6px, 14px, 24px, 40px, and 100px increments, with large whitespace used as part of the brand voice.

## Elevation & Depth
The interface is intentionally flat and low-elevation. Instead of heavy shadows, hierarchy comes from contrast, border outlines, and tonal separation: white surfaces against white backgrounds, green fills against white, and thin borders around cards. Soft glow effects may appear around the primary CTA, but the core system should still feel restrained and clean rather than materially layered.

## Shapes
The shape language is soft and friendly, with prominent pill buttons and lightly rounded cards. Interactive controls lean toward `rounded.full` for a welcoming, modern conversion feel, while content containers use smaller radii such as `rounded.md` and `rounded.sm`. Overall the geometry is approachable rather than sharp, reinforcing the app’s educational and reassuring tone.

## Components
- **Buttons:** The primary action is a large pill button using `button-primary`, with a green fill, white label, and strong dimensions (`258px` wide by `75px` tall) for conversion emphasis. Secondary buttons use `button-secondary` with a white background and dark text, retaining the same pill shape and proportions. Link-style actions use `button-link` for subtle inline navigation such as terms or notes.
- **Button states:** Hover and focus states should stay calm and conservative; avoid dramatic color shifts. Maintain the pill shape, and use subtle contrast or outline changes rather than shadows.
- **Cards:** `card` uses a white surface, `1px` light border, `8px` radius, and `16px` padding. Cards should feel like light containers for content, not floating panels.
- **Inputs:** Inputs should match the card language with a white background, light border, modest radius, and Inter text. Keep borders understated so form elements blend into the overall minimalist system.
- **Chips / badges:** Use `chip` for small contextual labels, especially when the green brand accent is needed without a full button treatment. Chips should remain compact and pill-shaped.
- **Banner / announcement bar:** `banner` is a full-width green strip with white text for reassurance or promotional messaging. It should be visually prominent but not noisy.
- **Progress / step indicators:** When present, use thin green progress bars or dots with light gray inactive states, matching the carousel-like lesson preview in the screenshots.
- **Text hierarchy blocks:** Headline + supporting body + CTA should remain stacked and centered, with the headline taking priority and the body copy using clear weight contrast rather than decorative styling.

## Do's and Don'ts
- Do keep the interface bright, minimal, and centered around a strong hero message.
- Do use Libre Baskerville for large editorial headlines and Inter for everything functional.
- Do reserve the deep green accent for primary actions, trust cues, and brand highlights.
- Do preserve the pill-shaped CTA language and generous whitespace around key actions.
- Don't introduce dark backgrounds, heavy gradients, or noisy decorative textures.
- Don't replace the serif headline style with a generic sans-serif hero treatment.
- Don't add large shadows or glassmorphism; rely on borders and contrast instead.
- Don't overuse uppercase or letter spacing; the brand feels refined, not shouty.
