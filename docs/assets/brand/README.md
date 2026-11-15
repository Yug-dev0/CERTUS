<div align="center">

<img src="certus-lockup-light.svg#gh-light-mode-only" alt="CERTUS" width="420">
<img src="certus-lockup-dark.svg#gh-dark-mode-only" alt="CERTUS" width="420">

# Brand kit

</div>

The CERTUS mark is the **caliper C and ASME diamond proof seal**: a precision engineering caliper with measuring jaws closing on an action-lime diamond proof stamp.

- **The caliper C** represents precision physical engineering, dimensional verification, and tolerance verification. Its chamfered 45° industrial edges and open measuring jaws embody deterministic calculation and physical plant measurement.
- **The diamond** is the seal: the ASME Code Symbol Stamp and mathematical Q.E.D. / Ed25519 cryptographic hash verification ("Answers your plant can prove").

The mark moves the way the product does. Where it animates (the landing header), the caliper C locks into place and the diamond proof seal ticks on after it, on the same curve the product uses to lock onto evidence.

## Files

| File | Use it for |
|---|---|
| [`certus-mark.svg`](certus-mark.svg) | Dark caliper, lime diamond seal. Light grounds. |
| [`certus-mark-white.svg`](certus-mark-white.svg) | Paper caliper, lime diamond seal. Dark grounds and photographs. |
| [`certus-mark-mono.svg`](certus-mark-mono.svg) | All ink, for print, stamps and anything that cannot carry colour. |
| [`certus-lockup-light.svg`](certus-lockup-light.svg) | Mark, name and product line, on light grounds. |
| [`certus-lockup-dark.svg`](certus-lockup-dark.svg) | The same, on dark grounds. |
| [`certus-app-icon.svg`](certus-app-icon.svg) | Square icon on a night tile, for launchers, social cards and slides. |

In the product the mark is drawn by [`frontend/components/certus-logo.tsx`](../../../frontend/components/certus-logo.tsx) (`CertusMark` and `CertusLogo`), and the browser tab icon is [`frontend/app/icon.svg`](../../../frontend/app/icon.svg). Change the drawing there and every screen follows.

## Colour: Hi-Vis Monochrome

| Swatch | Name | Hex | Role |
|---|---|---|---|
| ![](https://img.shields.io/badge/-%20%20%20%20%20%20-070707?style=flat-square) | Night | `#070707` | The ground |
| ![](https://img.shields.io/badge/-%20%20%20%20%20%20-f7f7f4?style=flat-square) | Paper | `#f7f7f4` | Text at night; the light ground |
| ![](https://img.shields.io/badge/-%20%20%20%20%20%20-d4f24a?style=flat-square) | Hi-vis lime | `#d4f24a` | The one accent: what you can act on, what is cited, the seal |
| ![](https://img.shields.io/badge/-%20%20%20%20%20%20-5f6e00?style=flat-square) | Olive | `#5f6e00` | The seal on paper, where lime would not read |
| ![](https://img.shields.io/badge/-%20%20%20%20%20%20-4cc38a?style=flat-square) | Pass | `#4cc38a` | Status only |
| ![](https://img.shields.io/badge/-%20%20%20%20%20%20-ffb224?style=flat-square) | Held | `#ffb224` | Status only |
| ![](https://img.shields.io/badge/-%20%20%20%20%20%20-ff5a4f?style=flat-square) | Critical | `#ff5a4f` | Status only |

Lime is the only accent. It marks what is actionable or proven, never decoration. Status colours report state and nothing else.

## Type

- **Archivo**, variable weight and width. Display lines are light (300) and semi-condensed (about 88%), with one word set heavy. The name is set bold, wide (about 112%) and tracked open by about 0.14 em.
- **Martian Mono** for labels, ids and hashes: 10–11 px, capitals, tracked +0.08–0.12 em.

Both are SIL Open Font License and ship in `frontend/app/fonts`, so nothing is fetched at build or run time.

## Using the mark

- **Clear space:** keep at least half the mark's width empty on every side.
- **Minimum size:** 16 px on screen, 6 mm in print. Below that, use the name alone.
- **Angles are precise 45° chamfers.** Do not round the caliper edges or diamond seal, add a glow or shadow, or distort the mark.
- **Lime stays in the diamond seal.** Do not colour the caliper frame lime, and do not put the mark on a lime ground; use the mono mark there.
