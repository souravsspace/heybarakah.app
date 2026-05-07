---
version: alpha
name: Barakah App
description: A calm, editorial faith-based marketing system with a clean white canvas, deep green accents, and high-contrast serif headlines.
colors:
  primary: "#29603E"
  primary-dark: "#1F4A30"
  primary-soft: "#E8F0EA"
  secondary: "#000000"
  tertiary: "#6B7280"
  neutral: "#E5E7EB"
  neutral-soft: "#F5F5F4"
  divider: "#EFEFEF"
  placeholder: "#9CA3AF"
  cream: "#F5EBDB"
  cream-soft: "#FAF4E8"
  competitor-tone: "#EAB5A8"
  barakah-tone: "#B5CFC0"
  surface: "#FFFFFF"
  ink: "#000000"
  ink-soft: "#0F1311"
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
    typography: "Inter 24px / 700"
    rounded: "16px"
    padding: "24px"
    minHeight: "64px"
    width: "100%"
    pressedOpacity: 0.92
  button-secondary:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    typography: "Inter 24px / 700"
    rounded: "16px"
    padding: "24px"
    minHeight: "64px"
    width: "100%"
    pressedOpacity: 0.92
  button-disabled:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.tertiary}"
    typography: "Inter 24px / 700"
    rounded: "16px"
    padding: "24px"
    minHeight: "64px"
    width: "100%"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.tertiary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "0px"
    decoration: "underline"
  card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "16px"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.neutral}"
    placeholderColor: "{colors.placeholder}"
    textColor: "{colors.ink}"
    typography: "Inter 18px / 500"
    rounded: "18px"
    padding: "18px"
    borderWidth: "1.5px"
  chip:
    backgroundColor: "{colors.neutral-soft}"
    textColor: "{colors.tertiary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "5px 14px"
  option-row:
    backgroundColor: "{colors.surface}"
    selectedBackgroundColor: "{colors.primary-soft}"
    borderColor: "{colors.neutral}"
    selectedBorderColor: "{colors.primary}"
    textColor: "{colors.ink}"
    selectedTextColor: "{colors.primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.lg}"
    padding: "14px 24px"
    minHeight: "60px"
  progress-bar:
    backgroundColor: "{colors.neutral}"
    fillColor: "{colors.primary}"
    height: "6px"
    rounded: "{rounded.full}"
  auth-button:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    typography: "Inter 16px / 600"
    rounded: "18px"
    height: "60px"
    borderWidth: "1.5px"
  stat-chart:
    competitorBarColor: "{colors.competitor-tone}"
    barakahBarColor: "{colors.barakah-tone}"
    axisColor: "{colors.neutral}"
    labelColor: "{colors.tertiary}"
    barWidth: "64px"
    barTopRadius: "14px"
  eyebrow:
    textColor: "{colors.tertiary}"
    ruleColor: "{colors.primary}"
    typography: "Inter 10px / 700"
    letterSpacing: "2px"
    ruleSize: "28px × 1px"
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
- **Primary (#29603E):** A deep mosque-green used for the brand mark, full-screen green moments, the main CTA, selected states, progress fills, switches, and emphasis accents. It communicates trust, growth, and a grounded Islamic identity.
- **Primary dark (#1F4A30):** A deeper green reserved for pressed, dense, or high-contrast green surfaces when primary needs extra depth.
- **Primary soft (#E8F0EA):** A pale green selection fill used behind chosen option rows, selected plan cards, and gentle success/confirmation surfaces.
- **Secondary / ink (#000000):** Crisp black used for headline text, navigation details, and strong contrast on white surfaces. It anchors the editorial serif typography and keeps messaging highly legible.
- **Tertiary (#6B7280):** A muted gray used for supporting copy, hints, captions, secondary annotations, and inactive icons. It softens the hierarchy without feeling weak.
- **Neutral (#E5E7EB):** A light gray border and inactive-track tone used for subtle dividers, card outlines, unselected radio circles, and disabled button fills.
- **Neutral soft (#F5F5F4):** A warmer pale gray used for low-emphasis pills, placeholder blocks, and quiet utility backgrounds.
- **Divider (#EFEFEF):** A near-white hairline used inside list cards and thin loading tracks when `neutral` would feel too prominent.
- **Placeholder (#9CA3AF):** Placeholder and pending-state text/icons. Keep it secondary to `tertiary` and never use it for body copy.
- **Ink soft (#0F1311):** A near-black used for small icons or dense paywall badges when pure black feels too stark.
- **Cream (#F5EBDB) / cream soft (#FAF4E8):** Warm editorial support tones for illustrations or special onboarding/paywall accents. Use sparingly; green remains the only brand accent.
- **Chart support tones (#EAB5A8 / #B5CFC0):** Muted comparison-chart bars only. These are data colors, not brand accents, and should not replace green for UI state.
- **Surface / background (#FFFFFF):** The dominant page and component canvas. It reinforces openness, clarity, and a minimal reading experience.
- **Accent / success (#29603E):** Reuses the primary green for positive confirmations and trusted success messaging.
- **Error (#B42318):** Reserved for invalid states only; never use it decoratively.

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
The interface is intentionally flat and low-elevation. Instead of heavy shadows, hierarchy comes from contrast, border outlines, selected fills, and tonal separation: white surfaces against white backgrounds, green fills against white, and thin borders around cards. The welcome swipe-card stack is the main exception: it may use a soft green-black shadow (`#0B1710`, 4–8px vertical offset, 0.04–0.08 opacity, 10–18px radius) to clarify layering. Avoid using this shadow language on ordinary cards.

## Shapes
The shape language is soft and friendly, with large rounded-rectangle CTAs, compact pill badges, and lightly rounded cards. Primary app buttons use `rounded-2xl` (`16px`) rather than full pills, while badges and progress tracks use `rounded.full`. Content containers use `rounded-md`, `rounded-lg`, or `rounded-2xl` depending on scale. Overall the geometry is approachable rather than sharp, reinforcing the app’s educational and reassuring tone.

## Components
- **Buttons:** Match `packages/app/components/ui/button.tsx`. Primary buttons are full-width rounded rectangles, not narrow pills: `bg-primary`, `text-surface`, `rounded-2xl` (`16px`), `px-md py-md`, minimum height `64px`, Inter `24px` at `700`, and `0.2px` letter spacing. Secondary buttons use the same structure with `bg-surface`, `border-neutral`, and `text-ink`. Disabled buttons use `bg-neutral` and `text-tertiary`.
- **Button states:** Pressed state lowers opacity only (`0.92` for main buttons, `0.6` for link buttons). Native app buttons trigger light haptic feedback. Avoid dramatic color shifts, shadows, scale, or bouncy motion.
- **Link buttons:** Use a transparent pressable with centered `body-sm` tertiary underlined text for secondary navigation such as terms, restore purchase, or “not now”.
- **Cards:** Cards and content panels use a white surface, `1px` neutral border, `rounded-2xl` or `rounded-lg`, and `24px` padding. Cards should feel like outlined containers, not floating panels. Internal list dividers use `divider` (`#EFEFEF`) hairlines.
- **Welcome swipe cards:** Welcome cards use `rounded-xl`, neutral border, white surface, centered image, serif `h2` title, and caption text. Stack cards offset by small 8–10px steps, rotate only during swipe, and keep shadows soft and low-opacity.
- **Option rows / radio rows:** Unselected rows use white fill, neutral border, black label, tertiary hint text, and a small neutral radio circle. Selected rows animate to `primary-soft` fill, `primary` border, primary label/icon, and a green checkmark. Use `1.5px` borders, `60px` minimum height, `rounded-lg`, and a restrained `160ms` ease-out transition.
- **Plan cards:** Paywall plan cards use stronger conversion emphasis than ordinary options: `rounded-2xl`, `24px` horizontal/vertical padding, `2.5px` border, selected border `primary`, unselected border `neutral`, selected fill white, and unselected fill `#F4F2EE`. Use compact pill badges (`7 DAY FREE TRIAL`, `BEST VALUE`) at the top edge and a 22px green selected check.
- **Auth provider buttons:** Social/email sign-in buttons are white, centered rows with `60px` height, `18px` radius, `1.5px` neutral border, 22px icon, 12px icon gap, and Inter `16px / 600` label.
- **Toggles:** Toggle rows are white, bordered, `rounded-md`, with label + muted hint. Switch tracks are neutral off and primary on, with a white thumb.
- **Inputs:** Text inputs use white fill, `1.5px` neutral border, `18px` radius, `18px` horizontal/vertical padding, Inter `18px / 500`, ink text, and placeholder `#9CA3AF`.
- **Chips / badges:** Default utility chips use `neutral-soft` with tertiary caption text. Promotional or recommended badges may use primary green with white uppercase text, but keep them compact and rare.
- **Banner / filled green screens:** Full green surfaces use `bg-primary` with white text and restrained spacing. They should feel ceremonial and calm, not loud. White decorative marks on green should stay very low opacity.
- **Eyebrows:** Use a 28px × 1px green rule above small uppercase Inter text (`10px`, `700`, `2px`–`2.4px` letter spacing) for setup screens such as stats, prayer times, and calculating.
- **Progress / step indicators:** Use a `6px` rounded full-width bar with neutral track and primary fill for step progress. Loading/computing bars may be thinner (`2px`) with a `divider` track. Animate progress changes with short ease-out timing.
- **Prayer/status rows:** Prayer and calculating rows use icon cells around 22–36px, active green icon/text treatment, pending placeholder gray, and `divider` hairlines between rows. “NEXT” badges use pale green fill and tiny uppercase green text.
- **Charts:** Bar charts use flat vertical bars with rounded top corners only (`14px`), tertiary uppercase labels, and neutral axis hairlines. Use peach/sage support tones for comparison data; use primary green only for Barakah-highlighted data or interactive emphasis.
- **Motion:** Default entrance motion is `FadeSlideIn`: opacity 0→1 and translateY 8→0 over `220ms` ease-out cubic, with small staggered delays. Count-ups may run around `800–1400ms`. Breathing or loading loops should be slow and calm; avoid bounce.
- **Text hierarchy blocks:** Headline + supporting body + CTA should remain stacked and centered, with the headline taking priority and the body copy using clear weight contrast rather than decorative styling.

## Do's and Don'ts
- Do keep the interface bright, minimal, and centered around a strong hero message.
- Do use Libre Baskerville for large editorial headlines and Inter for everything functional.
- Do reserve the deep green accent for primary actions, trust cues, and brand highlights.
- Do preserve the large rounded-rectangle CTA language and generous whitespace around key actions.
- Don't introduce dark backgrounds, heavy gradients, or noisy decorative textures.
- Don't replace the serif headline style with a generic sans-serif hero treatment.
- Don't add large shadows or glassmorphism; rely on borders, selected fills, and contrast instead.
- Don't overuse uppercase or letter spacing; the brand feels refined, not shouty.
