
# Olivia Nguyen Portfolio

## Responsive launch pad

The launch pad defaults to the destination list at widths of 860px or less,
and to the star map on wider screens. The view toggle remains available in
both layouts; crossing the breakpoint restores the default for that layout.
The narrow-screen list flows below the introduction without covering it.
At 560px or less, the profile job title appears beneath the large name.

## Project case studies

The [BOM BOM SINGAPORE case study](src/pages/projects/bom-bom-singapore.astro)
uses the same mission-report layout as Boulder Box Saigon and is registered in
[missions](src/data/missions.ts) for the project grid, star map, and report navigation.
Its brand and product descriptions are based on the live Singapore homepage,
food overview, pricing, and about pages at [bombom.com](https://bombom.com/sg/).
Local gallery screenshots were captured in October 2026.

The portfolio owner confirmed the Lead Designer role, covering UX research,
UI execution, and development coordination from June to September 2026, with
launch in September 2026. One month after launch, website visitors increased
30% and returning visitors increased 20%. The comparison baseline has not
been specified; these are separate metrics, not an additive 50% uplift or
a claim about revenue, orders, or conversion growth.

## Fonts and licensing

Font audit: October 24, 2026. All web fonts loaded by the site are free,
open-source fonts licensed under the SIL Open Font License 1.1, which permits
commercial use and web embedding.

| Font | Usage | License |
| --- | --- | --- |
| Orbitron | Titles, navigation, Explorer UI | [SIL OFL 1.1](https://github.com/google/fonts/blob/main/ofl/orbitron/OFL.txt) |
| Exo 2 | Body text and Explorer UI | [SIL OFL 1.1](https://github.com/google/fonts/blob/main/ofl/exo2/OFL.txt) |
| JetBrains Mono | Labels and metadata | [SIL OFL 1.1](https://github.com/google/fonts/blob/main/ofl/jetbrainsmono/OFL.txt) |
| Albert Sans | Legacy Framer exports and components | [SIL OFL 1.1](https://github.com/google/fonts/blob/main/ofl/albertsans/OFL.txt) |
| Inter / Inter Display | Legacy Framer exports | [SIL OFL 1.1](https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt) |

The [favicon](public/favicon.svg) uses the actual Orbitron Bold (700) capital O
outline, matching the navigation brand, in the title color `#F7FFC7`. The glyph
was sourced from Google Fonts and converted to SVG paths so it does not require
a font download. The OFL does not impose its license on artwork made with a font.

No font binaries are bundled in this repository. Legacy exports reference
operating-system fallbacks such as Arial, Helvetica, Menlo, and Input Mono;
these are not all open-source, but no copies are bundled or loaded by the site.
Generic `sans-serif` and `monospace` fallbacks depend on the visitor's system.
