---
name: Chantilly Science Olympiad
description: The team portal laid out like a science-fair tri-fold, with purple board, white mounted sheets and one gold title strip per event.
colors:
  chantilly-purple: "#4b2a8a"
  purple-deep: "#3b2170"
  purple-night: "#2a1752"
  fold-line: "#8665bd"
  lilac-wash: "#e6ddf3"
  lilac-tint: "#f3eff9"
  title-gold: "#f2c230"
  gold-wash: "#fbedb8"
  ink: "#141018"
  board-grey: "#ece9f2"
  rule: "#ddd8e6"
  muted-ink: "#5b546a"
  sheet-white: "#ffffff"
  signal-red: "oklch(50.5% 0.213 27.518)"
  signal-red-deep: "oklch(44.4% 0.177 26.899)"
typography:
  display:
    fontFamily: "Archivo Black, Archivo, ui-sans-serif, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Archivo Black, Archivo, ui-sans-serif, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0.01em"
    fontFeature: "tnum"
  title:
    fontFamily: "Archivo Black, Archivo, ui-sans-serif, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
    fontFeature: "tnum"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "tnum"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "0.025em"
    fontFeature: "tnum"
  chip:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.025em"
    fontFeature: "tnum"
rounded:
  sheet: "2px"
  none: "0px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
components:
  button-primary:
    backgroundColor: "{colors.chantilly-purple}"
    textColor: "{colors.sheet-white}"
    typography: "{typography.body}"
    rounded: "{rounded.sheet}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.purple-deep}"
  button-secondary:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sheet}"
    padding: "8px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.gold-wash}"
  button-danger:
    backgroundColor: "{colors.signal-red}"
    textColor: "{colors.sheet-white}"
    rounded: "{rounded.sheet}"
    padding: "8px 16px"
  button-danger-hover:
    backgroundColor: "{colors.signal-red-deep}"
  button-ghost:
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.sheet}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sheet}"
    padding: "8px 12px"
  sheet:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
  board:
    backgroundColor: "{colors.chantilly-purple}"
    padding: "16px"
  title-strip:
    backgroundColor: "{colors.title-gold}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    padding: "20px 16px"
  chip-not-started:
    backgroundColor: "{colors.board-grey}"
    textColor: "{colors.muted-ink}"
    typography: "{typography.chip}"
    padding: "4px 8px"
  chip-in-progress:
    backgroundColor: "{colors.gold-wash}"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    padding: "4px 8px"
  chip-ready:
    backgroundColor: "{colors.chantilly-purple}"
    textColor: "{colors.sheet-white}"
    typography: "{typography.chip}"
    padding: "4px 8px"
  nav-item:
    textColor: "{colors.lilac-wash}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.purple-deep}"
    padding: "8px 12px"
---

# Design System: Chantilly Science Olympiad

## Overview

**Creative North Star: "The Science Fair Tri-fold"**

Every surface is a display board. A Chantilly purple board carries the navigation rail and backs each event; white sheets are mounted on it, each one framed by a purple gap and a thin ink mat, the way paper is glued to a tri-fold. An event reads left to right like the board it imitates: what to prepare, the event and its team under a gold title strip, then results. Headings are cut letters (Archivo Black, uppercase) set over plain Archivo body.

The world is flat, square and dense. Depth comes from mounting and framing, never from blur. Every number uses tabular figures so scores, dates and counts line up in columns. Status words are a fixed vocabulary, and nothing is labeled twice. The single authored motion is the board sliding in when you switch events.

The system rejects the SaaS dashboard default: no greeting banner, no row of stat tiles, no soft rounded cards with drop shadows.

**Key Characteristics:**
- Purple board (rail, fold backing) with white mounted sheets on it
- One gold title strip names each event
- Cut-letter uppercase headings over a plain sans body
- Near-square corners (2px), 2px ink borders, no blurred shadows
- Tabular figures everywhere; fixed status vocabulary
- One 220ms fold-in slide, removed under reduced motion

## Colors

One saturated school purple carries the board, one gold names things, and everything else is ink on white or a cool lilac-grey.

### Primary
- **Chantilly Purple** (#4b2a8a): The board. Navigation rail, mobile top bar, tri-fold backing, the gap around mounted sheets, primary buttons, the active event tab, the "Ready" status, and progress fills. Also the browser theme color.
- **Purple Deep** (#3b2170): Hover on purple surfaces (rail items, primary button) and the active nav item's text on white. Also figures that need brand emphasis, such as the score average and join code.
- **Purple Night** (#2a1752): The rule under the rail, and the 70% scrim behind modals and the mobile drawer.
- **Fold Line** (#8665bd): The dashed 2px creases between tri-fold panels. Nothing else.
- **Lilac Wash** (#e6ddf3): Idle nav text on the rail and the avatar tile.
- **Lilac Tint** (#f3eff9): Quiet emphasis bands, such as the results average footer and checked rows in pickers.

### Secondary
- **Title Gold** (#f2c230): The event title strip, the pinned-announcement strip, the auth wordmark tag, the focus ring and text selection. Gold names or flags something. It is not a general fill.
- **Gold Wash** (#fbedb8): Hover on white rows and secondary buttons, the "In progress" status, the Practice calendar type, and inline notices.

### Tertiary
- **Signal Red** (oklch 50.5% 0.213 27.518): Deadlines on the calendar and the danger button. Signal Red Deep is its hover.

### Neutral
- **Ink** (#141018): All body text, the 2px borders, the mat line around mounted sheets, and the Coach role tag.
- **Board Grey** (#ece9f2): The page background behind the work area, empty progress tracks, the "Not started" status and the Student role tag.
- **Rule** (#ddd8e6): 1px dividers between list rows inside a sheet, and chart gridlines.
- **Muted Ink** (#5b546a): Secondary text such as metadata, timestamps, subtitles and type labels.
- **Sheet White** (#ffffff): Every mounted sheet, card, input and inactive tab.

### Named Rules
**The Board Is Purple Rule.** Purple is the structure (rail, fold backing, sheet gap), not decoration. If a purple area is not something a sheet could be mounted on, or a primary action, it should not be purple.

**The Gold Names It Rule.** Gold strips name an event or flag a pinned item. Each event gets one strip. Gold Wash is the hover and the in-between state.

## Typography

**Display Font:** Archivo Black (with Archivo, ui-sans-serif)
**Body Font:** Archivo 400/500/600/700 (with ui-sans-serif, system-ui)

**Character:** Heavy cut-out capitals on a poster board, over a sturdy grotesque that stays readable at 14px on a phone.

### Hierarchy
- **Display** (Archivo Black, 2.75rem at sm and up, 1.875rem on phones, line-height 1, uppercase): The page title, one per page, sitting on a 2px ink rule.
- **Headline** (Archivo Black, 1.75rem / 1.5rem on phones, line-height 1.25, uppercase): The event name in its gold title strip. Modal titles use the same voice at 1.25rem.
- **Title** (Archivo Black, 1.125rem, uppercase): Tri-fold panel labels (white on purple), empty-state titles and the results average. Sheet headers use it at 1rem.
- **Body** (Archivo 400, 0.875rem, line-height 1.43): Lists, descriptions and form text. Row titles use 600 and figures use 700. Descriptions cap around max-w-lg (32rem).
- **Label** (Archivo 700, 0.75rem, letter-spacing 0.025em, uppercase): Form labels, the "View all" and "All resources" links, and the label on a value such as "Average · 3 tests".
- **Chip** (Archivo 700, 11px, letter-spacing 0.025em, uppercase): State tags only.

### Named Rules
**The Tabular Figures Rule.** `font-variant-numeric: tabular-nums` is set on the root. Never turn it off, since scores, dates and counts must align.

**The Cut Letter Rule.** Archivo Black is always uppercase with 0.01em tracking. It is for headings, never for running text.

## Layout

On desktop (1024px and up), a fixed purple rail 16rem wide sits on the left with a 2px ink right edge. It holds the logo sheet, the wordmark and the nav, with the user and sign-out at the foot. The work area is centred at max 72rem with 40px side and vertical padding. Below 1024px, the rail turns into a sticky purple top bar (menu, logo, wordmark) and an 18rem slide-in drawer over a Purple Night scrim. Phone padding is 16px, rising to 24px at 640px.

Spacing follows a 4px module: 4, 8, 12, 16, 24, 32 and 40px. Pages stack in 32px bands. Each page header has 32px below it and a 2px ink bottom rule. Rows inside sheets use 16px horizontal and 12px vertical padding.

The tri-fold is a three-column grid at 768px and up (1fr / 1.3fr / 1fr). The wider centre panel carries the gold title strip and the team details. Panels sit on a purple board with 16px padding (12px on phones), and each has a white label above its sheet. Below 768px the panels stack as three sheets with a 24px gap, so one event fills the phone screen. Square tabs above the board switch events. Under the tri-fold, the dashboard uses a two-column grid (1fr / 20rem) at 1024px and up.

## Elevation & Depth

There are no blurred shadows. Depth is shown by mounting: a sheet sits on the purple board with a 4px purple gap and then a 4px ink mat, drawn as zero-blur spread rings. Sheets that are not on a board (cards, modals) get a 2px ink border instead. Board Grey sits behind everything. The only translucent layer is the 70% Purple Night scrim behind modals and the drawer. Focus is a 3px Title Gold outline offset 2px.

### Shadow Vocabulary
- **Mount** (`box-shadow: 0 0 0 4px #4b2a8a, 0 0 0 8px #141018`): Any white sheet placed on a purple board. This is a frame, not a lift, and it is the system's own device.

### Named Rules
**The Mounted, Not Lifted Rule.** Shadows here are zero-blur frame rings. A blurred or offset drop shadow breaks the board.

## Shapes

Corners are near-square. Cards, buttons, inputs and modals use a 2px radius. Mounted sheets, tabs, nav items, chips, avatars and the logo frame have no radius at all. Borders are 2px ink. Inside a sheet, row dividers are 1px Rule. Board creases are 2px dashed Fold Line, and empty states use a 2px dashed border at 30% ink. Icons are 24px-grid SVG line icons with a 2px stroke, round caps and joins, shown at 16 to 20px.

## Components

### Buttons
Flat, bordered and blunt.
- **Shape:** near-square (2px), 2px border, 8px by 16px padding, Archivo 700 at 0.875rem, 8px gap to the icon.
- **Primary:** Chantilly Purple with white text and an ink border. Hover goes to Purple Deep.
- **Secondary:** white with ink text and an ink border. Hover goes to Gold Wash. This is the default for links styled as actions.
- **Danger:** Signal Red with white text and an ink border, darkening on hover.
- **Ghost:** transparent border with Muted Ink text. Hover gives a white fill and Ink text.
- **Hover / Focus:** a colour transition only. Focus is the global gold outline. Disabled is 50% opacity with a not-allowed cursor.

### Chips
- **Style:** a square tag with 4px by 8px padding in the Chip type. It is used only where it carries state or role.
- **Status vocabulary (fixed):** Not started (Board Grey / Muted Ink), In progress (Gold Wash / Ink), Ready (Purple / white).
- **Roles:** Coach (Ink / white), Captain (Gold / Ink), Student (Board Grey / Muted Ink).
- **Calendar types:** Tournament (Purple), Deadline (Signal Red), Practice (Gold Wash), Other (Board Grey).
- Event types and resource types appear as plain muted text with no fill.

### Cards / Containers
- **Sheet (on Board Grey):** white, 2px ink border, 2px radius. The header row has the title on the left in the 1rem cut voice, a purple uppercase "View all" link on the right, and a 2px ink rule beneath.
- **Mounted sheet (on the purple board):** white with the Mount frame and no radius.
- **Internal padding:** 16px. Rows are 12 to 16px vertical and divided by 1px Rule lines.
- **Empty state:** a 2px dashed 30% ink border on 60% white, a purple 24px icon, a Title-voice heading and Muted Ink copy. Lists start empty and say so plainly.

### Inputs / Fields
- **Style:** white, 2px ink border, 2px radius, 8px by 12px padding, 0.875rem text, full width. The label above is the Label style with 4px below it.
- **Focus:** the border turns Chantilly Purple, plus the global gold outline. The caret is purple.
- **Error:** a 2px Signal Red bordered note on a pale red wash.

### Navigation
- **Rail items:** 15px Archivo 600 with an 18px icon and 12px by 8px padding. Idle items are Lilac Wash text and hover to Purple Deep. The active item becomes a white sheet with Purple Deep text.
- **Mobile:** a sticky purple top bar with a 2px ink bottom edge, and the same rail inside a drawer.

### Event Tabs
Square tabs with a 2px ink border on three sides, sitting on top of the board. The active tab is purple with white text. Inactive tabs are white and hover to Gold Wash.

### Tri-fold (signature)
The event board. The left panel ("Prepare") lists resources and ends with an "All resources" footer link above a 2px ink rule. The centre panel holds the gold title strip (event name in Headline, event type in Label) above a details sheet. That sheet shows Team, Status (chip) and Progress as rows with the term on the left and the value on the right. The progress bar is 8px tall: a Board Grey track with a purple fill. The right panel ("Results") lists recent scores as date / test / percent, ends with a Lilac Tint average footer, and has a secondary "Log a score" button below. Switching events replays the 220ms fold-in.

### Charts
Line charts use Rule gridlines, 11px Muted Ink ticks, 2.5px lines, and a tooltip with a 2px ink border and 2px radius. Series run in this order: purple, dark gold, ink, lilac, then two extra contrast hues for teams with more members.

## Do's and Don'ts

### Do:
- **Do** mount white sheets on the purple board with the Mount frame (4px purple gap, then 4px ink).
- **Do** give each event exactly one gold title strip.
- **Do** set headings in uppercase Archivo Black and body in Archivo, with tabular figures on every number.
- **Do** keep spacing on the 4px module (4, 8, 12, 16, 24, 32, 40px).
- **Do** use only the fixed status words: Not started, In progress, Ready.
- **Do** use the 220ms fold-in (cubic-bezier(0.16, 1, 0.3, 1)) only when switching events, and keep the reduced-motion override.
- **Do** show empty lists as empty, with a plain sentence saying what will appear.

### Don't:
- **Don't** use blurred or offset drop shadows. The only shadow is the zero-blur Mount frame.
- **Don't** round corners beyond 2px.
- **Don't** build greeting banners, stat-tile rows or soft rounded cards.
- **Don't** label a value twice, for example a heading that repeats what its chip or strip already says.
- **Don't** invent status words, or colour a status outside its fixed chip pairing.
- **Don't** use gold as a general background fill. It names or flags.
