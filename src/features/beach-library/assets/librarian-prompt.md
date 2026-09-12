# Library librarian background edit

## Current upright librarian revision

Tool: built-in image_gen. Style reference: `src/shared/assets/features/dialogues/aussie-barista.png`.
Portrait output: `src/shared/assets/features/dialogues/poodle-librarian.png`, transparent PNG, connected through the dialogue speaker's `sprite`.

Portrait prompt: Create a standalone waist-up game dialogue character with genuinely transparent alpha, matching the illustrated adult anthropomorphic female dog style and framing of aussie-barista. Cream curly female poodle with round brown spectacles, warm brown eyes and welcoming smile; ivory collared blouse, teal knitted cardigan with buttons, muted brown skirt. Both forepaws hold a burgundy book against her chest. Keep ears and paws in frame, detailed fur and warm rim light, no background or text.

Scene prompt: Replace the existing four-legged dog with the exact poodle from the new portrait, full body standing upright on TWO hind paws, wearing the same blouse, cardigan and long brown skirt and holding the book. Position closer to the player beside the right foreground flower planter: feet at 88% height, head at 43%, whole character between 81% and 96% width. Keep all playable shelving clear. Preserve original 1672x941 framing, shelf geometry, windows, floor, rug and plants; remove the previous dog completely; no extra books or text.

Final scene correction prompt: Shift the entire dressed upright poodle 85 pixels to the right without changing size or vertical position, restoring the wood and floor behind her. Keep the leftmost skirt and ear beyond x=1340 so playable shelving remains clear. Allow overlap with the right flower planter, keep face, book, clothes and both feet visible, and preserve the 1672x941 framing and shelf coordinates.

## Earlier four-legged version

Generated with the built-in image_gen tool. Target: `src/shared/assets/locations/tourist/library.png`.
Style reference: the dog in `src/shared/assets/locations/tourist/shop.png`.

Initial prompt: Preserve the tropical library's framing, empty shelves and their geometry, floor, windows, plants, rug and lighting. Add one friendly female cream curly poodle librarian with round glasses and a teal neck scarf, standing on all four paws by the right window. Match the game's polished cartoon dog style. Keep the dog clear of the playable shelves; add no books or text.

After reducing the generated dog's size, the final correction prompt was:

> Precise object edit. Move the existing small poodle 100 pixels horizontally to the RIGHT. Keep its size, design, glasses, scarf and vertical position exactly unchanged. Restore wood behind its old location. Its LEFTMOST ear must start at x=1360 pixels, completely beyond the right edge of the bookcase at x=1325. It is fine for its rightmost tail to overlap the foreground plants. Change nothing else. Preserve exact 1672x941 image dimensions, all shelf geometry, windows, floor and rug.
