## Color tokens

Source of truth for Bozor-Analitika. Map these roles in `frontend/src/styles.css`. Do not introduce colors that are not listed here.

Wholesale produce desk: warm paper surfaces, forest navigation, and separate sell/buy colors. High-chroma green is reserved for the primary action and positive price movement.

### Surfaces and text

- `color-bg-canvas`: `#F3F0E8` — page background.
- `color-bg-surface`: `#FFFCF8` — cards, inputs, menus.
- `color-bg-subtle`: `#E8E2D6` — grouped strips, table header, hover.
- `color-bg-nav`: `#163028` — sidebar.
- `color-fg-default`: `#1C2420` — primary text on paper.
- `color-fg-muted`: `#4E5A54` — secondary text and metadata. AA on canvas and surface.
- `color-fg-on-nav`: `#F3F0E8` — text on the sidebar.
- `color-fg-on-nav-muted`: `#C5D2CB` — inactive nav labels. AA on nav.
- `color-fg-on-accent`: `#FFFFFF` — text on the primary button.

### Actions and lines

- `color-accent-primary`: `#146B43` — primary buttons and the current section.
- `color-accent-primary-hover`: `#0F5534` — primary button hover and pressed.
- `color-accent-soft`: `#E3F2EA` — selected chips and soft highlights on paper.
- `color-border-subtle`: `#D5CFC3` — cards, inputs, dividers.
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

- `shadow-overlay`: `0 12px 32px rgba(22, 48, 40, 0.16)` — dialogs only.
- `color-bg-nav-hover`: `rgba(243, 240, 232, 0.08)` — sidebar item hover.
- `color-scrim`: `rgba(22, 48, 40, 0.45)` — overlay behind the dialog and the mobile menu.
