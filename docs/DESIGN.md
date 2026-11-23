# DESIGN — Countdown Lock Screen

Status: **Draft for human review** · Related: `SPEC.md`, `ARCHITECTURE.md`

## 1. Reference & originality policy

`docs/reference/examples.png` (four community wallpapers) is used **only** for layout patterns, hierarchy, and mood:

| Pattern seen in reference | How we use it |
|---|---|
| Bold goal title + hero number ("15 Days to Go") | Header and hero block in every theme |
| Deadline date badge ("18 Nov 2026") | Pill/badge next to or under the title |
| T-minus milestone labels with dates ("T-30 Days (Dec 2): Complete OAs") | Canonical milestone label format: `T-30 · Dec 2` + title |
| Checklist rows with checkbox + one icon per row | Milestone row anatomy (§5) |
| A "path"/trail connecting milestones | Each theme has its own path style (circuit rail, pixel trail, ribbon stitch, road) |

**Never copy** artwork, characters (e.g., no geese/nurse mascots), photos, textures, or exact compositions from the reference. Every background, mascot, and decoration is drawn from primitive SVG shapes defined in this doc. Fonts are open-license (OFL). Icons are Lucide (ISC).

## 2. Design principles

1. **Glanceable in 1 second:** the hero number is the largest element. The next milestone is second.
2. **Respect the OS:** the clock/widgets area and the bottom shortcuts area stay calm.
3. **Deterministic art:** decorations use a seeded PRNG keyed by countdown ID, so re-renders don't jitter.
4. **One accent per glance:** each theme uses one dominant accent and one secondary.
5. **Readable at arm's length:** minimum wallpaper text size is 2.6u (≈ 28 px at 1080 w).

## 3. Canvas units & sizing

All wallpaper dimensions are in **canvas units `u`**:

```
u = min(canvasWidth, canvasHeight × 0.5) / 100
```

- Portrait phone 1080×2400 (layout dp 360×800 @3x): `u = 1% of width`.
- Landscape desktop 2560×1600: `u = 800/100 = 8 px` (keeps text proportional to the shorter side).
- The mini preview (e.g., 72×160 dp) uses the same math, so it is a faithful miniature.

The `<Wallpaper>` receives `size` in **layout units (dp)**. The capture pipeline makes the layout size equal to `targetPx / PixelRatio.get()`, so the native snapshot is exactly `targetPx` (ARCHITECTURE §7).

## 4. Wallpaper layout anatomy & safe zones

### 4.1 Portrait (phones) — exact percentages of canvas height

```
 ┌──────────────────────────────────────┐ 0%
 │                                      │
 │   TOP SAFE ZONE (30%)                │  OS clock, date, lock-screen widgets
 │   Background + low-contrast deco     │  NO text, NO icons, NO milestones
 │   only (≤ 25% opacity)               │
 │                                      │
 ├──────────────────────────────────────┤ 30%
 │ ▸ HEADER  (14% of content)           │  🎯 Goal title (≤2 lines)  [📅 Nov 18, 2026]
 │ ▸ HERO    (22% of content)           │        15
 │                                      │     DAYS TO GO
 │ ▸ PROGRESS(4%  of content, optional) │  ▓▓▓▓▓▓░░░░ 3/6 milestones
 │ ▸ PATH    (48% of content)           │  ●─ T-30 · Dec 2   Complete OAs     ☐ </>
 │   (≤5 rows; PQ ≤4)                   │  │
 │                                      │  ●─ T-20 · Dec 12  Mock interview   ☐ ◎
 │                                      │  │
 │                                      │  ◆─ T-0  · Jan 1   DEADLINE
 │ ▸ MOTIVATION (12% of content)        │  "Because future me deserves it."
 ├──────────────────────────────────────┤ 88%
 │   BOTTOM SAFE ZONE (12%)             │  Flashlight / camera / home indicator
 │   Background only                    │  NO text, NO interactive-looking shapes
 └──────────────────────────────────────┘ 100%

 Horizontal padding: 7u each side (content width = 86u at portrait).
```

- **Content zone = 58%** of canvas height (from 30% to 88%).
- When `showProgress = false`, PATH grows to 52%. When `showMotivation = false` or the motivation is empty, PATH grows by another 12%.
- When the content overflows, drop rows in this order: completed rows → farthest-future rows → show a `+N more` chip as the last row.

### 4.2 Landscape (desktop, web stretch)

```
 ┌───────────────────────────────────────────────────────────────────┐ 0%
 │  TOP SAFE (8%)  — menu bar / notch                                │
 ├──────────────────────────────┬────────────────────────────────────┤ 8%
 │  LEFT COLUMN (42% width)     │  RIGHT COLUMN (50% width)          │
 │  Goal title + date badge     │  PATH (≤ 6 rows)                   │
 │  HERO number                 │                                    │
 │  Progress                    │                                    │
 │  Motivation                  │                                    │
 ├──────────────────────────────┴────────────────────────────────────┤ 88%
 │  BOTTOM SAFE (12%) — dock / taskbar                               │
 └───────────────────────────────────────────────────────────────────┘
 Side padding 4% width; column gap 8% width.
```

### 4.3 Safe-zone overlay (Studio only)

- Top and bottom zones get a diagonal-hatched tint `rgba(255, 64, 64, 0.18)` with labels "Clock & widgets" and "Shortcuts". The content zone gets a dashed outline `rgba(255,255,255,0.6)`.
- Rendered as a **sibling** layered above the preview, **outside** the captured view, so it is never in the PNG.

## 5. Shared wallpaper components (all themes)

| Part | Content | Rules |
|---|---|---|
| Goal title | `emoji + title` | Display font, ≤ 2 lines, ellipsis |
| Deadline badge | `Nov 18, 2026` (+ ` · 6:00 PM` if time set) | Pill, badge colors |
| Hero | Number + unit line. Variants: `15` / `DAYS TO GO`; `1` / `DAY TO GO`; `TODAY` / `DEADLINE DAY`; `OVERDUE` / `3 DAYS PAST`; `DONE` / `FINISHED NOV 16` | Number font = display, tabular if available |
| Progress (opt.) | Thin bar + `3/6 milestones` | Height 1.2u, radius per theme |
| Milestone row | status mark (checkbox/node) · `T-30 · Dec 2` · title · icon | Done rows: strikethrough title + success color mark, 60% opacity |
| Next-milestone emphasis | The first pending row gets the `nodeActive` color + a "NEXT" micro-badge | Exactly one row |
| Finish row | Always last: deadline node `T-0 · <date>` + "Deadline" (or goal title) | Uses accent |
| Motivation | Quoted one-liner | Optional |

T-minus label format: `T-{n} · {MMM d}` where `n = differenceInCalendarDays(deadlineDate, milestoneDate)`. On the deadline itself: `T-0`.

## 6. Theme token tables

Color values are hex (`#RRGGBBAA` where alpha is needed). Sizes are in **u**. Each theme declares `contrastPairs` that the contrast test checks (NFR-04).

### 6.1 Glass Terminal (`glass-terminal`)

Mood: late-night dev console. Translucent glass cards over a dark gradient with neon mint/cyan glow.

| Group | Token | Value |
|---|---|---|
| **Colors** | `background` | `#05080F` |
| | `backgroundAlt` (gradient end) | `#0A1B24` |
| | `surface` (glass card) | `#FFFFFF0F` |
| | `surfaceStrong` | `#FFFFFF1A` |
| | `surfaceBorder` | `#7FFFD440` |
| | `surfaceHighlight` (top edge 1px) | `#FFFFFF2E` |
| | `textPrimary` | `#E6FFF7` |
| | `textSecondary` | `#9FC7C0` |
| | `textMuted` | `#6B8A86` |
| | `accent` | `#3DFFC5` (mint) |
| | `accentAlt` | `#22D3EE` (cyan) |
| | `success` | `#3DFFC5` |
| | `danger` | `#FF5C7A` |
| | `trail` | `#22D3EE66` |
| | `node` / `nodeActive` / `nodeDone` | `#0A1B24` stroke `#22D3EE` / `#3DFFC5` / fill `#3DFFC5` |
| | `badgeBg` / `badgeText` | `#3DFFC51F` / `#3DFFC5` |
| **Typography** | display | `JetBrainsMono_700Bold` |
| | body | `Inter_600SemiBold` (rows), `Inter_400Regular` (captions) |
| | sizes (u) | title 6.5 · hero 26 · heroUnit 4.4 (letterSpacing 0.6u) · badge 3.4 · tLabel 3.8 · rowTitle 3.6 · motivation 3.6 · caption 2.8 |
| **Radii** (u) | card / badge / node / checkbox | 3 / 999 / 0.8 (rounded square) / 1 |
| **Spacing** (u) | xxs/xs/sm/md/lg/xl/xxl | 0.5 / 1 / 2 / 3 / 4.5 / 6 / 8 |
| **Borders** | card | 0.25u `surfaceBorder` + 1px `surfaceHighlight` inner top line |
| **Background** | treatment | Linear gradient `background`→`backgroundAlt` (top→bottom). Two radial "glow orbs": mint `#3DFFC5` @ 18% at (85%, 38%) r=45u, cyan `#22D3EE` @ 14% at (10%, 75%) r=55u. Grid pattern lines `#7FFFD4` @ 5%, 6u pitch. Glass is **simulated** (layered translucent fills), not real blur. Native blur doesn't capture reliably. |
| **Path style** | `circuit` | A vertical rail at x = 9u (0.4u, `trail`). Each row connects to the rail with a 90° trace. Nodes are rounded squares. The finish node is a diamond. |
| **Icons** | style | Lucide outline, strokeWidth 1.5, color `accentAlt`, inside a 7u rounded-square outline (`surfaceBorder`). Geometric tech feel. |
| **Contrast pairs** | | `textPrimary/backgroundAlt`, `textSecondary/backgroundAlt`, `textMuted/backgroundAlt`, `accent/backgroundAlt` |

### 6.2 Pixel Quest (`pixel-quest`)

Mood: original 8-bit adventure map. Milestones are glowing level nodes on a winding trail.

| Group | Token | Value |
|---|---|---|
| **Colors** | `background` | `#0B0A1F` |
| | `backgroundAlt` | `#1A1240` |
| | `surface` (label plate) | `#12102BE6` |
| | `surfaceBorder` | `#39FF88` |
| | `textPrimary` | `#F5F3FF` |
| | `textSecondary` | `#B8B3E0` |
| | `textMuted` | `#8A84C2` |
| | `accent` | `#39FF88` (neon green) |
| | `accentAlt` | `#FFD23F` (gold) |
| | `success` | `#39FF88` |
| | `danger` | `#FF4F6D` |
| | `trail` / `trailGlow` | `#39FF88` / `#39FF8840` |
| | `node` / `nodeActive` / `nodeDone` | fill `#12102B` border `#39FF88` / fill `#FFD23F` border `#FFF3B0` / fill `#39FF88` |
| | `badgeBg` / `badgeText` | `#FFD23F` / `#0B0A1F` |
| **Typography** | display | `PressStart2P_400Regular` (title, hero, T-labels) |
| | body | `VT323_400Regular` (row titles, motivation, captions) |
| | sizes (u) | title 4.2 · hero 17 · heroUnit 3.2 · badge 2.6 · tLabel 2.8 · rowTitle 4.6 · motivation 4.6 · caption 3.6 |
| **Radii** | all | 0 (stepped "pixel corners": 1u notches cut from each corner via SVG path) |
| **Spacing** (u) | scale | Same as 6.1 but snapped to a **2u pixel grid** (xs=2, sm=2, md=4, lg=4, xl=6, xxl=8) |
| **Borders** | plate | 0.6u solid `surfaceBorder`, double outline (outer `trailGlow` 1.2u) |
| **Background** | treatment | Vertical gradient `background`→`backgroundAlt`, quantized into 8 hard bands (no smooth gradient). Seeded star field: 40 squares of 0.6u–1u, white @ 30–70%. In the top safe zone only ≤ 25% opacity stars. Original pixel hills silhouette (stepped polygon, `#140F33`) behind the lower content. |
| **Path style** | `pixel-trail` | An S-shaped trail through node centers, alternating x at 22u / 78u. Drawn as a 3u-wide stepped polyline (segments quantized to 2u) with a 6u `trailGlow` underlay. Nodes are 9u octagons. The label plate sits beside each node on the opposite side. The finish node is a 12u gold "castle-flag" glyph (original: square tower + triangle flag). Max 4 rows. |
| **Icons** | style | Lucide, strokeWidth 2.5, `strokeLinecap="square"`, `strokeLinejoin="miter"`, color `accentAlt`, 5u, no container. |
| **Contrast pairs** | | `textPrimary/background`, `textSecondary/background`, `textMuted/background`, `badgeText/badgeBg` |

### 6.3 Sticker Planner (`sticker-planner`)

Mood: pastel planner page with stacked ribbon cards, sticker pills, and an original mascot.

| Group | Token | Value |
|---|---|---|
| **Colors** | `background` | `#FFF1F6` |
| | `backgroundAlt` (grid lines) | `#FFD3E2` |
| | `surface` (ribbon card) | `#FFFFFF` |
| | `surfaceBorder` | `#FF8FB3` |
| | `surfaceShadow` (solid offset) | `#F7B3CA` |
| | `textPrimary` | `#4A1530` |
| | `textSecondary` | `#7A3B5A` |
| | `textMuted` | `#9C5C7C` |
| | `accent` | `#FF6FA0` |
| | `accentAlt` | `#FFB86B` (peach) |
| | `success` | `#2E9E6A` |
| | `danger` | `#C81E4A` |
| | `trail` (stitch) | `#FF8FB3` |
| | `node` / `nodeActive` / `nodeDone` | ring `#FF8FB3` / fill `#FF6FA0` / fill `#2E9E6A` |
| | `badgeBg` / `badgeText` | `#D6336C` / `#FFFFFF` |
| **Typography** | display | `Fredoka_700Bold` |
| | body | `Fredoka_500Medium` |
| | hand | `Caveat_700Bold` (motivation) |
| | sizes (u) | title 7 · hero 26 · heroUnit 5 · badge 3.6 · tLabel 4.0 · rowTitle 3.8 · motivation 5.4 · caption 3.0 |
| **Radii** (u) | card / badge / node / checkbox | 4 / 999 / 999 / 1.2 |
| **Spacing** (u) | scale | 0.5 / 1 / 2 / 3 / 4.5 / 6 / 8 |
| **Borders** | card | 0.6u `surfaceBorder` + a solid offset shadow (0, 0.8u) `surfaceShadow`. No blur, so capture is identical across platforms. |
| **Background** | treatment | Flat `background` + a 6u grid (0.25u lines, `backgroundAlt`). Seeded sticker confetti: 4-point sparkles `#FFB3CC`, mini hearts `#FF8FB3`, dots `#FFB86B`, ≤ 25% opacity in safe zones and ≤ 70% in the content margins. |
| **Path style** | `ribbon-stack` | Cards are stacked full-width and alternately rotated −1.2° / +0.8°. Each card has notched ribbon ends (a 2u chevron cut on the right). A dashed "stitch" line (0.4u, dash 1.2u/1u, `trail`) runs down the left gutter. The T-label is a sticker pill (`badgeBg`) overlapping the card's top-left edge. |
| **Mascot** | "Mochi" (original) | A 20u round peach blob (`#FFD9C2`, outline `#E89A7F` 0.4u). Two 1u dot eyes (`#4A1530`), blush ovals (`#FF9DB8` @ 70%), and a tiny smile arc. A two-leaf sprout (`#7FD1A0`) on top. Holds a mini pennant showing the days count. Placed at the bottom-right of the content zone, overlapping the last card by 30%. Expressions: normal (pending), star-eyes (all done), sweat-drop (overdue). Pure SVG primitives only. |
| **Icons** | style | Lucide, strokeWidth 2.25, white glyph on an 6.5u circle "sticker" (`accent`, 0.5u white outline). |
| **Contrast pairs** | | `textPrimary/background`, `textSecondary/surface`, `textMuted/background`, `badgeText/badgeBg` |

### 6.4 Field Journal (`field-journal`)

Mood: an explorer's map page. Parchment, a winding road with location pins, and a paired checklist panel.

| Group | Token | Value |
|---|---|---|
| **Colors** | `background` | `#F1E4C8` (parchment) |
| | `backgroundAlt` (vignette) | `#D9C29A` |
| | `surface` (panel) | `#FBF4E2` |
| | `surfaceBorder` | `#8B6B3E` |
| | `tape` | `#E8D3A8B3` |
| | `textPrimary` | `#2B2118` (ink) |
| | `textSecondary` | `#5A4632` |
| | `textMuted` | `#6E5940` |
| | `accent` | `#C2462E` (pin red) |
| | `accentAlt` | `#2F5D50` (forest) |
| | `success` | `#2F5D50` |
| | `danger` | `#A3301C` |
| | `road` / `roadDash` / `roadEdge` | `#3B3A36` / `#F1E4C8` / `#24231F` |
| | `node` / `nodeActive` / `nodeDone` | pin `#C2462E` / pin `#C2462E` + pulse ring / pin `#2F5D50` + check |
| | `badgeBg` / `badgeText` | `#2F5D50` / `#FBF4E2` |
| **Typography** | display | `PlayfairDisplay_700Bold` |
| | body | `Lora_500Medium` |
| | hand | `Caveat_700Bold` (date labels on road, motivation) |
| | sizes (u) | title 7 · hero 26 · heroUnit 4.6 · badge 3.4 · tLabel 3.8 (Caveat 4.4 on road) · rowTitle 3.6 · motivation 4.8 · caption 2.8 |
| **Radii** (u) | card / badge / node / checkbox | 1.5 / 1 / pin shape / 0.6 |
| **Spacing** (u) | scale | 0.5 / 1 / 2 / 3 / 4.5 / 6 / 8 |
| **Borders** | panel | 0.3u `surfaceBorder`, with a tape strip (14u × 3.5u, `tape`, rotated −4°) at the top center |
| **Background** | treatment | Flat `background`, a radial vignette to `backgroundAlt` @ 60% at the edges, seeded ink speckles (120 dots, 0.2–0.5u, `#8B6B3E` @ 6–12%), 5 topographic contour lines (smooth closed paths, `#B89A6A` @ 15%), and an original compass rose (8-point star, 14u, `#8B6B3E` @ 25%) in the top-right of the **top safe zone** (calm, low opacity). |
| **Path style** | `road` | Content splits into a **left 52% map** and a **right 48% checklist panel**. The map holds a winding road (cubic Bézier S-curve, 4.5u wide `road`, 0.3u `roadEdge`, center dash `roadDash` 1.5u/1.5u). Teardrop pins (6u) sit on the road at each milestone, with Caveat date labels in small parchment tags. Small original pine-tree glyphs (triangles) dot the roadside. The finish is a flag pin. The panel holds a header "Checklist" (display font) and rows with checkbox · T-label · title · icon. |
| **Icons** | style | Lucide, strokeWidth 1.75, color `textSecondary`, 4.5u, no container. |
| **Contrast pairs** | | `textPrimary/surface`, `textSecondary/surface`, `textMuted/background`, `badgeText/badgeBg` |

### 6.5 App chrome (non-wallpaper UI)

The app UI is neutral, so any theme's wallpaper looks good inside it. It follows system light/dark mode, and **accent = active theme `accent`** (or `badgeBg` when the accent fails contrast on the chrome background).

| Token | Light | Dark |
|---|---|---|
| `bg` | `#F7F7FA` | `#0E0F13` |
| `card` | `#FFFFFF` | `#181A20` |
| `border` | `#E3E4EA` | `#2A2D36` |
| `text` | `#14151A` | `#F2F3F7` |
| `textSecondary` | `#5B5F6B` | `#A3A7B3` |
| `danger` | `#C62828` | `#FF6B6B` |
| `success` | `#1E8E5A` | `#4ADE80` |
| Font | `Inter_400Regular` / `Inter_600SemiBold` / `Inter_800ExtraBold` (hero countdown) | same |
| Radii (pt) | card 16 · button 12 · chip 999 | same |
| Spacing (pt) | 4 / 8 / 12 / 16 / 24 / 32 | same |

## 7. Typography & bundled font loading

**Font set (12 files, all SIL OFL 1.1):**

| File key (`fontFamily`) | Used by |
|---|---|
| `Inter_400Regular`, `Inter_600SemiBold`, `Inter_800ExtraBold` | App chrome, Glass Terminal body |
| `JetBrainsMono_400Regular`, `JetBrainsMono_700Bold` | Glass Terminal |
| `PressStart2P_400Regular` | Pixel Quest display |
| `VT323_400Regular` | Pixel Quest body |
| `Fredoka_500Medium`, `Fredoka_700Bold` | Sticker Planner |
| `PlayfairDisplay_700Bold` | Field Journal display |
| `Lora_500Medium` | Field Journal body |
| `Caveat_700Bold` | Sticker Planner + Field Journal hand-written accents |

**Strategy:**
1. During the build (T1.3), install the `@expo-google-fonts/<family>` packages with `npx expo install`. **Copy** the exact `.ttf` files into `assets/fonts/` (locate them with `find node_modules/@expo-google-fonts -name '*.ttf'`), copy each family's OFL license into `assets/fonts/LICENSES/`, then uninstall the packages. The app references only `assets/fonts/*.ttf`, so it needs no network at runtime or build time beyond the initial copy.
2. `src/themes/fonts.ts` exports `FONT_MAP: Record<FontKey, number>` (the `require()`d files).
3. The root `app/_layout.tsx` calls `useFonts(FONT_MAP)` and keeps the splash screen visible (`SplashScreen.preventAutoHideAsync()`) until fonts **and** store hydration are ready (NFR-09).
4. Each weight is its own `fontFamily` (no `fontWeight` on custom fonts). Android ignores `fontWeight` for custom families.
5. **Capture guard:** the Studio's capture function asserts `fontsLoaded === true`. If font loading failed, show a warning banner ("Custom fonts unavailable — wallpaper will use system fonts") and allow capture with system fallbacks.
6. If fonts can't be downloaded during the build, log a blocker and fall back to system fonts (`monospace`, `serif`), and record it in an ADR.

## 8. Iconography & decoration strategy

### 8.1 Icons
- Library: `lucide-react-native` (depends on `react-native-svg`). The data stores **string IDs**, never components.
- Curated registry `src/themes/icons.ts`: `flag, target, book-open, graduation-cap, file-text, code, terminal, briefcase, send, mic, users, plane, map-pin, luggage, camera, piggy-bank, wallet, dumbbell, heart, calendar, clock, star, trophy, rocket`. Before use, confirm the component names in the installed lucide version.
- **Offline keyword → icon mapping** (`suggestIcon(title)`): lower-case word match, first hit wins. For example `resume|cv|portfolio → file-text`, `code|leetcode|build|app → code`, `exam|study|read|course|lab → book-open`, `interview|call|network → users`, `apply|submit|send|outreach → send`, `travel|trip|flight|visa → plane`, `pack|bag → luggage`, `save|money|\$|budget|expense → piggy-bank`, `gym|run|workout → dumbbell`. Default: `flag`.

### 8.2 Original SVG decorations (per theme)

All drawn with `react-native-svg` primitives in `src/components/wallpaper/themes/<theme>/`:
- Glass Terminal: grid pattern, glow orbs (RadialGradient), circuit rail and traces, diamond finish node, `>_` prompt glyph next to the title.
- Pixel Quest: stepped gradient bands, star field, pixel hills, octagon level nodes, castle-flag finish glyph.
- Sticker Planner: grid paper, sparkles/hearts/dots confetti, notched ribbon cards, washi-tape strip on the header, **Mochi** mascot.
- Field Journal: vignette, speckles, contour lines, compass rose, road + dashes, teardrop pins, pine trees, tape strip.

Every random placement uses `mulberry32(hash(countdown.id + themeId))` (NFR-06).

### 8.3 Size presets (Studio)

| ID | Label | Pixels | Orientation | Platforms |
|---|---|---|---|---|
| `device` | This device (default) | screen dp × pixelRatio | portrait | all |
| `android-fhd` | Android FHD+ | 1080×2400 | portrait | all |
| `android-qhd` | Android QHD+ | 1440×3120 | portrait | all |
| `iphone-pro` | iPhone Pro | 1179×2556 | portrait | all |
| `iphone-pro-max` | iPhone Pro Max | 1290×2796 | portrait | all |
| `desktop-16x10` | Laptop 16:10 | 2560×1600 | landscape | web (stretch) |
| `desktop-mbp` | MacBook Pro 14" | 3024×1964 | landscape | web (stretch) |

## 9. Screen wireframes

App chrome uses the §6.5 tokens. All screens use `SafeAreaView`.

### 9.1 Onboarding — shared frame

```
┌────────────────────────────────┐
│ ←  Step 2 of 6     ●●○○○○      │  progress dots + back arrow
│                                │
│  <Question headline, 28pt>     │
│  <helper text, 15pt secondary> │
│                                │
│  [ input area ]                │
│                                │
│                                │
│ ┌────────────────────────────┐ │
│ │          Next  →           │ │  primary, disabled until valid
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

### 9.2 Step 1 — Goal

```
 Step 1 of 6  ●○○○○○
 What is your main upcoming
 goal or task?
 ┌──────────────────────────────┐
 │ 🎯 │ Land a summer internship │   emoji button + title (max 60)
 └──────────────────────────────┘
  42/60
 Quick picks:  🎓  ✈️  💰  💼  🏃  📚  🚀  ❤️
 [ Next → ]
```

### 9.3 Step 2 — Deadline

```
 Step 2 of 6  ●●○○○○
 What is the deadline?
 ┌──────────────────────────────┐
 │ 📅  Fri, Jan 1, 2027      ▾  │   native date picker (web: <input type=date>)
 └──────────────────────────────┘
 [ ] Add a specific time
     ┌───────────┐
     │ 🕘 18:00 ▾│
     └───────────┘
 ⓘ 38 days from today · uses your local time zone (Asia/Kolkata)
 ⚠ "Deadline can't be in the past"  (inline error state)
 [ Next → ]
```

### 9.4 Step 3 — Motivation

```
 Step 3 of 6  ●●●○○○
 Why does it matter?
 Optional — shown on your lock screen.
 ┌──────────────────────────────┐
 │ Future me will thank me.     │  max 90
 └──────────────────────────────┘
  24/90
 [ Skip ]           [ Next → ]
```

### 9.5 Step 4 — Milestones

```
 Step 4 of 6  ●●●●○○
 Plan backward from Jan 1
 ┌──────────────────────────────┐
 │ ✨ Auto-plan backward         │  secondary button
 └──────────────────────────────┘
 ┌──────────────────────────────┐
 │ 📄 T-30 · Dec 2              │
 │ [Build list & polish resume] │  title input
 │ [📅 Dec 2, 2026]   ↑ ↓  🗑   │  date · move up/down · delete
 └──────────────────────────────┘
 ┌──────────────────────────────┐
 │ 👥 T-20 · Dec 12             │
 │ [Mock interviews         ]   │
 │ [📅 Dec 12, 2026]  ↑ ↓  🗑   │
 │ ⚠ Date must be on or before   │  inline error
 │   Jan 1, 2027                │
 └──────────────────────────────┘
 ⚠ Milestones aren't in date order  [Sort by date]
 [ + Add milestone ]   (disabled at 12 · "Max 12 milestones")
 [ Next → ]
 Empty state: illustration-free card "No milestones yet. Auto-plan or add your own — or skip."
```

### 9.6 Step 5 — Theme

```
 Step 5 of 6  ●●●●●○
 Pick a look
 ┌──────┐ ┌──────┐
 │ mini │ │ mini │     2×2 grid of live <Wallpaper> previews
 │ prev │ │ prev │     (aspect = device), selected = 3pt accent ring + ✓
 └──────┘ └──────┘
 Glass     Pixel
 Terminal  Quest
 ┌──────┐ ┌──────┐
 │      │ │      │
 └──────┘ └──────┘
 Sticker   Field
 Planner   Journal
 [ Next → ]
```

### 9.7 Step 6 — Reminders

```
 Step 6 of 6  ●●●●●●
 Stay on track
 Daily refresh reminder        [● ON ]
   Time                        [ 08:00 ▾ ]
   "Tap to refresh your lock screen"
 Milestone reminders           [● ON ]
   Remind me  [0][1✓][2][3][7] days before
 ┌──────────────────────────────┐
 │ 🔕 Notifications are off.     │  permission-denied card (only if denied)
 │ [Open Settings]              │
 └──────────────────────────────┘
 [ Finish ✓ ]  → requests permission (if needed) → saves → Home
```

### 9.8 Home

```
┌────────────────────────────────┐
│ 🎯 Land a summer internship  ⚙ │  title + settings icon
│ 📅 Fri, Jan 1, 2027            │
│                                │
│        37 : 14 : 52            │  Inter 800, 56pt
│      days  hrs   min           │
│                                │
│ ┌─ NEXT MILESTONE ───────────┐ │
│ │ 📄 T-30 · Dec 2            │ │  accent left border
│ │ Build list & polish resume │ │
│ │ in 8 days                  │ │
│ └────────────────────────────┘ │
│ Milestones  ▓▓▓▓░░░░░░  2/6 33%│  dual progress
│ Time        ▓▓▓▓▓▓░░░░  58%    │
│                                │
│ Checklist                      │
│ ☑ T-60 · Nov 2  Drill LeetCode │  done = strikethrough
│ ☑ T-50 · Nov 12 Resume v1      │
│ ☐ T-30 · Dec 2  Polish resume  │  ← NEXT chip
│ ☐ T-20 · Dec 12 Mock interviews│
│                                │
│ ┌────────────────────────────┐ │
│ │ 🖼  Generate lock screen    │ │  primary
│ └────────────────────────────┘ │
│ [ ✏️  Edit plan ]               │  secondary
└────────────────────────────────┘
```

### 9.9 Lock Screen Studio

```
┌────────────────────────────────┐
│ ←  Lock Screen Studio    1080× │  back · size chip (tap → preset sheet)
│ ┌────────────────────────────┐ │
│ │ ░░ Clock & widgets ░░░░░░░ │ │  overlay (if Show safe zones)
│ │                            │ │
│ │  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │ │
│ │   wallpaper preview        │ │  scaled to fit, true aspect
│ │   (scaled <Wallpaper>)     │ │
│ │  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │ │
│ │ ░░ Shortcuts ░░░░░░░░░░░░░ │ │
│ └────────────────────────────┘ │
│ ( Glass )( Pixel )( Sticker )( Field )   theme chips, horizontal scroll
│ Motivation [●] Completed [○] Progress [●] Safe zones [●]
│ ┌──────────┐┌─────────┐┌──────┐│
│ │⤓ Save    ││🔒 Set as ││⇪Share││  Android with module
│ │          ││ Lock Scr.││      ││
│ └──────────┘└─────────┘└──────┘│
│ iOS:      [⤓ Save to Photos] [⇪ Share]  [? How to set as Lock Screen]
│ Expo Go:  [🔒 Set as Lock Screen] disabled · ⓘ "Needs the installable
│           app build (APK). Save or share for now."
└────────────────────────────────┘
 Busy state: buttons show spinner; "Rendering 1080×2400…"
 Success toast: "Lock screen updated ✓" / "Saved to Photos ✓"
```

### 9.10 iOS guide (modal)

```
┌────────────────────────────────┐
│ How to set as Lock Screen    ✕ │
│ ① Saved! Open the Photos app   │  [Open Photos]  (photos-redirect://)
│ ② Open the wallpaper → Share ⇪ │
│ ③ Tap "Use as Wallpaper"       │
│ ④ Pinch to fit, tap "Add",     │
│    then "Set as Wallpaper Pair"│
│    or "Customize Home Screen"  │
│ Tip: the top 30% stays clear   │
│      for the clock — we        │
│      designed for that.        │
│ ▸ Automate with Shortcuts (optional)   collapsible
│   1. Shortcuts → Automation → Time of Day (daily)
│   2. Action: "Find Photos" (Album: Recents, latest 1)
│   3. Action: "Set Wallpaper" → Lock Screen
│   Note: still needs you to tap the daily reminder to re-render first.
└────────────────────────────────┘
```

### 9.11 Settings

```
┌────────────────────────────────┐
│ ←  Settings                    │
│ REMINDERS                      │
│ Daily refresh      [●] 08:00 ▾ │
│ Milestone reminders[●] 1 day ▾ │
│ Notification permission: Allowed / Denied [Open Settings]
│ DATA                           │
│ Export plan (JSON)          ⇪  │
│ Import plan (JSON)          ⤒  │
│ DEADLINE                       │
│ Edit plan                   ›  │
│ Mark goal complete          ✓  │
│ Reset / replace deadline    ⚠  │  destructive (red), confirm dialog
│ ABOUT                          │
│ Version x.y.z · 100% offline · Fonts: OFL · Icons: Lucide
└────────────────────────────────┘
```

## 10. Empty, error, permission & edge states

### 10.1 Empty states
| Where | Condition | UI |
|---|---|---|
| App launch | No countdown | Redirect to onboarding Step 1 |
| Milestones step | 0 milestones | Card: "No milestones yet. Auto-plan or add your own — or skip." Next stays enabled |
| Home checklist | 0 milestones | Card "Break it down" + [Auto-plan] [Add] buttons. The milestone progress bar is hidden |
| Wallpaper | 0 milestones | PATH shows only the finish node (`T-0 · Jan 1 · Deadline`) and the hero grows by 20% |
| Wallpaper | All done, before deadline | Each row done. Above the finish node: "All milestones done — final stretch!" |

### 10.2 Error states
| Error | UI |
|---|---|
| Capture failed | Toast "Couldn't render the image. Try again." + log. Buttons re-enabled |
| Save failed (non-permission) | Toast "Couldn't save. Try Share instead." + [Share] action |
| Set lock screen failed | Alert with native error message + "Saved a copy to your gallery instead?" [Save] |
| Import invalid | Inline error card listing the reason (wrong file / newer version / invalid dates). Current plan unchanged |
| Storage corrupted | One-time banner on onboarding: "We couldn't read saved data, so we started fresh." The corrupted value is discarded |
| Fonts failed | Warning banner in Studio (see §7.5) |

### 10.3 Permission-denied states
| Permission | When asked | Denied UI |
|---|---|---|
| Notifications | Step 6 **Finish**, or toggling reminders on in Settings | Inline card "Notifications are off — reminders won't arrive." [Open Settings] (`Linking.openSettings()`). The toggles stay on so a later grant just works |
| Photos (write-only) | First **Save** tap | Toast "Photos access denied." [Open Settings] + [Share instead] |
| Set wallpaper (Android) | Normal permission (`SET_WALLPAPER`), auto-granted | If `isSetWallpaperAllowed() == false` (device policy): disable the button with "Your device doesn't allow apps to change wallpaper." |

### 10.4 Deadline-day, overdue & completed states

| Status (from `getCountdownStatus`) | Home | Wallpaper hero | Other |
|---|---|---|---|
| `upcoming` (≥ 1 day) | `37 : 14 : 52` | `37` / `DAYS TO GO` (`1 / DAY TO GO`) | Normal |
| `today` (deadline date, before the instant) | `TODAY` + `hh:mm left` | `TODAY` / `DEADLINE DAY` (+ time if set) | Daily reminder text: "It's deadline day — refresh your lock screen" |
| `overdue` (after the instant, not completed) | Hero `Overdue by 3 days` (danger color). Card: "How did it go?" [Mark complete] [Set new deadline] | `OVERDUE` / `3 DAYS PAST`, rendered in `danger`. Pending rows muted (50%) with a hollow mark. Motivation is replaced by "New plan? Open the app to reset." | Daily & milestone notifications are cancelled on the next sync |
| `completed` (user marked complete) | Celebration card "Done! Finished Nov 16 🎉" + [Start a new countdown] | `DONE` / `FINISHED NOV 16` in `success`. All rows show as done. Sticker Planner Mochi star-eyes | Notifications cancelled |

## 11. Motion & accessibility (app chrome)

- Home countdown ticks every 60 s (aligned to the minute boundary), not every second (battery).
- Respect `AccessibilityInfo.isReduceMotionEnabled()`: no animated transitions in the wizard when enabled.
- Every icon-only button has an `accessibilityLabel` (e.g., "Move milestone up", "Delete milestone Mock interviews").
- Checklist rows: `accessibilityRole="checkbox"`, `accessibilityState={{checked}}`.
- The wallpaper preview has `accessibilityLabel` summarizing the content ("Lock screen preview: 37 days to Land a summer internship, next milestone Polish resume on Dec 2").
- Minimum touch target 44×44 pt. Primary buttons are 52 pt tall.
