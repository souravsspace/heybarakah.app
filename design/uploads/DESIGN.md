---
version: alpha
name: Barakaah App
description: A faith-centered, trust-forward learning brand that pairs classical serif headlines with clean modern UI.
colors:
  primary: "#29603E"
  secondary: "#000000"
  tertiary: "#6B7280"
  neutral: "#FFFFFF"
  surface: "#FFFFFF"
  on-surface: "#000000"
  error: "#B91C1C"
  border: "#E5E7EB"
  muted: "#F3F4F6"
typography:
  headline-display:
    fontFamily: "Libre Baskerville"
    fontSize: "38px"
    fontWeight: 700
    lineHeight: "45px"
    letterSpacing: "0px"
  headline-lg:
    fontFamily: "Libre Baskerville"
    fontSize: "31px"
    fontWeight: 700
    lineHeight: "37px"
    letterSpacing: "0px"
  headline-md:
    fontFamily: "Libre Baskerville"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "30px"
    letterSpacing: "0px"
  headline-sm:
    fontFamily: "Inter"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Inter"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "26px"
    letterSpacing: "0px"
  body-md:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0px"
  label-lg:
    fontFamily: "Inter"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "22px"
    letterSpacing: "0px"
  label-md:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
    letterSpacing: "0px"
  label-sm:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
    letterSpacing: "0px"
  caption:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0px"
rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "14px"
  md: "24px"
  lg: "40px"
  xl: "100px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "25px 30px"
    height: "75px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "25px 30px"
    height: "75px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "25px 30px"
    height: "75px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: "14px"
  banner:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-sm}"
    padding: "6px"
  chip:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: "6px"
---

# Barakaah App

## Overview

Barakaah App feels calm, faith-centered, and highly trustworthy, with a clear educational mission rather than a playful consumer-app tone. The visual language balances a classical editorial serif for emotional impact with a modern sans-serif system for readability and conversion-focused clarity. Overall the layout is spacious, minimal, and persuasive, aimed at users who want legitimacy, simplicity, and a gentle sense of momentum.

## Colors

- **Primary (#29603E):** A deep mosque-green used for brand accents, the top announcement bar, CTA buttons, iconography, and subtle highlights. It carries the strongest identity and should remain the main action color.
- **Secondary (#000000):** Pure black for the most important headline text and strong contrast moments. It gives the page an editorial, serious tone.
- **Tertiary (#6B7280):** A cool gray for supportive body copy and secondary metadata, helping the hierarchy stay soft without looking faded.
- **Neutral (#FFFFFF):** The base canvas color for the entire experience. White space is a major part of the brand’s calm, premium feel.
- **Surface (#FFFFFF):** Card and panel surfaces remain white, reinforcing the clean, low-noise presentation.
- **On-surface (#000000):** Primary readable text on light surfaces; use when black is required for maximum legibility.
- **Border (#E5E7EB):** A pale gray border used for cards and dividers, providing structure without introducing visual weight.
- **Muted (#F3F4F6):** A very light gray for soft UI backgrounds, chips, and understated containers when separation is needed.
- **Error (#B91C1C):** Reserved for destructive or validation states; it is not prominent in the screenshot but should remain restrained.

## Typography

The system uses two distinct voices: **Libre Baskerville** for editorial headlines and **Inter** for everything functional. Libre Baskerville brings a traditional, scholarly feel to the promise and key messaging, while Inter keeps buttons, UI chrome, and body content clean and modern.

Headlines should use the serif family with strong weight and generous line height. The largest display copy is dramatic and centered, with no added letter spacing and a confident, book-like rhythm. Supporting headlines can shift to Inter when the content becomes more UI-like or instructional.

Body text uses Inter at medium-to-regular weights for easy scanning. The interface avoids heavy uppercase styling in paragraphs; the only all-caps treatment is in the top announcement and primary CTA, where the brand wants urgency and clarity. Labels and small UI text should stay compact and highly legible, with minimal tracking and no decorative effects.

## Layout

The page is built around a centered, fixed-width hero column with broad side margins and lots of vertical breathing room. Content is stacked in a single column, creating a clear conversion funnel from announcement bar to headline, subheadline, CTA, trust line, and supporting preview card. Spacing follows a roomy rhythm using the `xs`, `sm`, `md`, `lg`, and `xl` scale, with especially large gaps between major hero sections.

Sections should feel open rather than dense, with the main message occupying the visual center of the page. Padding inside cards is modest, while outer section spacing is much larger to preserve the premium, contemplative feel. The layout favors alignment and restraint over complexity.

## Elevation & Depth

The design is mostly flat, relying on contrast, borders, and whitespace instead of layered shadows. The main CTA is the exception: it uses a soft green glow/shadow effect to draw attention without breaking the calm tone. Cards use thin borders and subtle separation rather than heavy elevation, keeping the interface grounded and easy to read.

## Shapes

The shape language is soft and friendly, with `rounded.full` dominant for buttons and pill-like controls. Cards use a modest `rounded.sm` radius, which keeps the interface from feeling too playful. Overall the system blends gentle curvature with strong structure, so elements feel accessible but not whimsical.

## Components

Buttons are the most expressive component in the system. Use `button-primary` for the main conversion action: filled green, white text, pill-shaped, large enough to feel substantial, and padded generously at `25px 30px` with a `75px` height. The primary button should remain visually dominant and can carry a subtle glow or shadow in implementation. Use `button-secondary` for secondary actions; it should stay transparent with a dark outline/text treatment and similar sizing so it reads as a true alternate action. Use `button-link` for understated text links such as policy or trust copy; it should be unboxed and underlined.

Cards should use the `card` treatment: white surface, `1px` light border, `rounded.sm`, and `16px` padding. They should feel informational rather than elevated, suitable for preview modules, lesson examples, and trust blocks. Keep card content high-contrast and compact, with clear typographic hierarchy.

Inputs should follow the same restrained card logic: white background, light border, modest radius, and comfortable padding. Focus states should lean on the primary green rather than loud glows or thick borders. Avoid overly rounded or playful form fields; they should feel dependable and plainspoken.

The announcement bar and small status strips should use the `banner` style: solid primary green, white text, and compact padding. Chips and tags should be quiet and neutral, using `chip` with a muted background and full rounding. Lists and lesson preview modules should favor simple borders, bold subheads, and sparse spacing rather than decorative icons or complex separators.

## Do's and Don'ts

- Do keep the hero centered, spacious, and highly legible.
- Do use the primary green only for real emphasis and conversion actions.
- Do pair serif headlines with sans-serif body text to preserve the brand’s editorial-meets-modern balance.
- Do rely on borders and whitespace before adding shadows or gradients.
- Do keep CTA buttons large, pill-shaped, and confident.
- Don't introduce bright accent colors that compete with the green brand color.
- Don't make cards or inputs heavily elevated or overly playful.
- Don't crowd the layout with dense blocks of text or multiple competing calls to action.
