## Color tokens

Source of truth for marketch.uz. Map these roles in `frontend/src/styles.css`. Do not introduce colors that are not listed here.

Jury demo desk: white canvas like a market terminal, forest accent, and separate sell/buy colors. High-chroma green is reserved for the primary action and positive price movement.

### Surfaces and text

- `color-bg-canvas`: `#FFFFFF` — page background.
- `color-bg-surface`: `#FFFFFF` — cards, inputs, menus.
- `color-bg-subtle`: `#F4F6F5` — grouped strips, table header, hover.
- `color-bg-nav`: `#FFFFFF` — top bar.
- `color-fg-default`: `#1C2420` — primary text.
- `color-fg-muted`: `#4E5A54` — secondary text and metadata. AA on canvas and surface.
- `color-fg-on-nav`: `#1C2420` — text on the top bar.
- `color-fg-on-nav-muted`: `#4E5A54` — inactive nav labels.
- `color-fg-on-accent`: `#FFFFFF` — text on the primary button.

### Actions and lines

- `color-accent-primary`: `#146B43` — primary buttons and the current section.
- `color-accent-primary-hover`: `#0F5534` — primary button hover and pressed.
- `color-accent-soft`: `#E3F2EA` — selected chips and soft highlights.
- `color-border-subtle`: `#E0E3EB` — cards, inputs, dividers.
- `color-border-strong`: `#B7AFA0` — input hover.
- `color-focus`: `#146B43` — focus ring.

### Market status

Always pair these with words (Ask, Bid, up, down). Color alone does not state the status.

- `color-ask`: `#0E6B3C` — sell intentions and prices above the prior level.
- `color-bid`: `#9B1C1C` — buy intentions and prices below the prior level.
- `color-live`: `#8A4B08` — live connection. Offline uses muted text.

### Chart series

One color per region line, in this order:

1. `#146B43`
2. `#8A4B08`
3. `#1E4D7B`
4. `#6B3A4A`
5. `#3E5C4A`

### Elevation

Use elevation only for layers that sit above the page.

- `shadow-overlay`: `0 12px 32px rgba(22, 48, 40, 0.16)` — dialogs and menus only.
- `color-bg-nav-hover`: `#F4F6F5` — nav item hover.
- `color-scrim`: `rgba(22, 48, 40, 0.45)` — overlay behind the dialog and the mobile menu.
