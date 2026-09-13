# Book spread generation prompts

Generated with the built-in image generation tool. Open spreads are 1536×1024 PNGs;
the active `-v2` pickup sprites are 2172×724 PNGs. All exported assets use real RGBA alpha.

The active `-v3` spreads remove decoration from the paper itself to leave more room for
book text and have a genuine transparent background. Cover hardware, bindings, and
bookmarks still distinguish the three books.

The `pickups/` directory contains closed, transparent versions for inventory thumbnails
and for placing collectible books directly onto location artwork. Each active `-v2` book
lies flat and is viewed from slightly above the long page-block edge. The edge remains
prominent while a shallow foreshortened strip of the top cover stays visible.

## Tropical field journal

> An open tropical explorer's field journal for a game inventory. Warm honey-brown
> leather, two large blank ivory parchment pages, tropical leaves, hibiscus and paw-print
> ornaments restricted to the margins, green ribbon bookmark. Polished colorful cartoon
> game UI style with crisp dark-brown contours and golden highlights. Centered, slightly
> top-down, fully visible. Genuine transparent background and clean alpha. No writing,
> letters, numbers, watermark, cropped edges or background rectangle.

## Sailor logbook

> An open sailor's logbook for a game inventory. Weathered teal-blue cloth and leather,
> two large blank cream parchment pages, restrained rope, shell and wave ornaments at the
> margins, brass anchor clasp and blue bookmark. Polished colorful cartoon game UI style
> with crisp dark-brown contours and turquoise-gold palette. Slight top-down three-quarter
> view, fully visible. Genuine transparent background and clean alpha. No writing, letters,
> numbers, watermark, cropped edges or background rectangle.

## Treasure atlas

> An open treasure hunter's adventure atlas for a game inventory. Burgundy and plum
> leather, two large blank aged parchment pages, gold corner plates with small compass,
> star and dog-bone ornaments at the extreme margins, red bookmark. Polished colorful
> cartoon game UI style with crisp dark-brown contours, ruby and antique-gold accents.
> Slight three-quarter view, fully visible. Genuine transparent background and clean alpha.
> No maps, writing, letters, numbers, watermark, cropped edges or background rectangle.

## Pickup sprites

All three pickup sprites were derived from their matching transparent spread with this
shared prompt structure:

> Render one closed collectible book lying completely flat on a horizontal surface and
> viewed from slightly above its long page-block edge, as if it sits just below eye level.
> Use a shallow 15–20 degree downward camera angle: keep the cream page block prominent,
> but reveal a foreshortened part of the top cover. Match the polished hand-painted tropical
> cartoon style. Exactly one low, wide book, genuine transparent RGBA background from the
> start, clean antialiased alpha, no floor, cast-shadow patch, top-down view, writing,
> scenery or extra objects.
