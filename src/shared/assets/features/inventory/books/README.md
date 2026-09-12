# Book spread generation prompts

Generated with the built-in image generation tool. Open spreads are 1536×1024 PNGs;
edge-on pickup sprites are 1983×793 PNGs. All six exported assets use real RGBA alpha.

The active `-v3` spreads remove decoration from the paper itself to leave more room for
book text and have a genuine transparent background. Cover hardware, bindings, and
bookmarks still distinguish the three books.

The `pickups/` directory contains closed, transparent, edge-on versions for inventory
thumbnails and for placing collectible books directly onto location artwork. Each book is
lying flat and is viewed from surface height, so the visible silhouette is a low horizontal
page-block edge rather than the broad front cover.

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

> Re-render the supplied closed collectible book lying completely flat on a horizontal
> surface, seen strictly edge-on from tabletop height. Use an orthographic-like side
> elevation facing the long page-block edge. The sprite must be a low, wide horizontal
> object, approximately 4:1 width-to-height. Show the cream page block, thin colored cover
> edges, spine end, small brass hardware and ribbon; show at most a razor-thin sliver of the
> top cover. Match the polished hand-painted tropical cartoon style. Exactly one book,
> genuine transparent RGBA background from the start, clean antialiased alpha, no floor,
> cast-shadow patch, top-down view, broad cover face, text, scenery or extra objects.
