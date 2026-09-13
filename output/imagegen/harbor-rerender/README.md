# Причал — новая генерация

[Готовое изображение](harbor-fresh.png)

Сцена заново сгенерирована по сюжетному референсу встроенным ImageGen. Камера ближе к берегу, слева деревянный помост с двумя лодками, справа широкий песчаный проход на пляж. Сохранены библиотека, моряк под навесом, корги-тотемы и жёлтый знак. После новой генерации проведена локальная правка пересечений лодок.

Игровой фон и код пока не заменялись.

## Новая генерация

```text
Use case: stylized-concept.
Primary request: REGENERATE THIS ENTIRE HAWAIIAN POINT-AND-CLICK GAME SCENE FROM SCRATCH as one clean unified illustration, incorporating the requested composition improvements. Input image is ONLY a STORY, SPATIAL LAYOUT AND CHARACTER REFERENCE, NOT an image to patch or preserve pixel by pixel. Rebuild every object with clean construction, consistent perspective, confident edges and coherent lighting, eliminating accumulated iterative-edit artifacts.
Format: one continuous ultra-wide 8:3 landscape panorama, highest practical detail, polished painterly cartoon adventure game environment. Clear large shapes with controlled detail, no gritty over-sharpening or repeating texture noise.
CAMERA: first-person eye-level standing ON a timber pier facing shore, moved forward about 2 metres compared with reference, closer to where pier meets land. Only the last short stretch of pier beneath the camera remains across lower center/right (roughly 12-18% of image height), leading continuously onto dry stone-and-sand shore. NO huge empty foreground deck and no frontal symmetrical composition. Natural oblique view, no avatar hands/body.
SPATIAL LAYOUT AND REQUESTED IMPROVEMENTS:
LEFT: turn the rough landing at left into a modest cared-for timber boardwalk / small mooring platform following the curved lava shore. Straight sound weathered planks, a few sturdy vertical supports and neat mooring posts, sparse rope handrail at dangerous water edges ONLY. It must connect on foot to the main dry landing and follow the irregular shore, no intersecting disconnected platforms. TWO modest wooden boats float alongside this LEFT-SIDE platform in sheltered water, one Hawaiian outrigger canoe with one coherent side float and one small rowboat. Correct boat anatomy, separate hulls, clear waterlines and soft reflections, natural mooring ropes. Boats are side scenery near the left margin, not a giant interactive-looking centerpiece; do not place them in the center foreground. Water remains a substantial left-side visual space.
LEFT BACKGROUND: same quiet sandy library cove, a SMALL enclosed warm wooden hut with steep thatched gable roof, turquoise doorway/window frames, an open-book pictogram over the open entrance; exactly two pale lounge chairs beneath one cream fabric canopy beside it. Continuous dry shore path leads there, not an island.
CENTER: a natural irregular lava-and-sand landing, not a straight seawall. Gentle scalloped shoreline with basalt projections, a small inlet and sandy pockets, the left boardwalk fits into this coastline organically. A safe broad walking area connects all routes. Inland stone stairs climb into green foliage between exactly TWO CORGI WOOD CARVINGS: upright triangular ears, short foxlike corgi muzzles, clearly carved wood heads with grain/chisel facets rather than furry living heads, deep carved wave and paw relief on cylindrical posts, restrained turquoise/ochre bands. Keep their scale like the reference. Beside the left totem one small YELLOW warning board on a wooden post. BLACK folded-map icon with a YELLOW exclamation mark in the EXACT CENTER OF THE MAP. Under icon, black lettering in exactly two lines: "take a map!" and "возьми карту!". Preserve spelling and punctuation, no other words.
RIGHT MIDDLE: same weathered teal timber boathouse with a coherent covered veranda. Elderly anthropomorphic dog sailor with navy cap, striped shirt and light trousers sits at a small card table FULLY UNDER the roof, holding cards, face clearly visible. Exactly one sailor, clean hands/paws and limbs, one table with four plausible legs and one spare chair. Modest lei and woven hanging lamps. No boat stored here.
FAR RIGHT: Make the WALKING PASSAGE TO THE TOURIST BEACH noticeably wider and more obvious than in the reference. Frame a broad sunlit strip of DRY SAND beyond the veranda, at least 12-16% image width unobstructed at its narrow point; it connects directly from the main landing around the right side of the hut to the beach. Move/resize veranda foliage or outer wall as needed so the passage is not squeezed behind a post or hidden by hibiscus. Its curve and light lead the eye to a distant single beach shop matching game identity: broad thatched roof, turquoise rope-bound posts, open timber counter, colored swim rings and dark blue/purple arcade cabinet, a couple of parasols beyond. Shop stays secondary, not a large foreground building. No visual roadblocks, no bridge crossing the route.
HAWAIIAN SETTING: emerald fluted volcanic mountain ridges, dark basalt, clear turquoise Pacific water, reef surf in distance, hala and coconut palms, limited hibiscus and plumeria clusters. Three small bamboo torches near path/veranda, safely offset from roofs. Warm tropical daytime, single consistent sun direction.
QUALITY CONSTRAINTS: coherent single perspective and scale; structurally believable pier/boardwalk/roof; planks and posts do not melt into stone or one another; paving follows terrain and stops cleanly; plants have intentional silhouettes without random tendrils. Avoid unnecessary clutter, warped objects, duplicated boats, duplicate characters, overlapping limbs, floating props, straight ruler-like coastline, exaggerated polished 3D plastic, UI/labels/watermark/collage. Full opaque background, NOT a transparent tile. One complete freshly rendered image.
```

## Проверка и исправление лодок

```text
Use case: precise-object-edit.
Input is the newly regenerated Hawaiian harbor EDIT TARGET.
Fix ONLY the boats and their ropes in the lower-left water; leave the rest exactly unchanged. Current boat cluster has confusing overlapping hulls and crossbars.
Replace this cluster with exactly TWO clearly separated modest boats floating next to the left boardwalk:
- farther LEFT and slightly BACK, one slender weathered wooden Hawaiian outrigger canoe, single long hull, ONE small narrow cylindrical side float on its left/ocean side, exactly two simple gently curved crossbeams linking hull to float. The float is NOT a second hull. Keep all parts easy to distinguish, no phantom hull behind. Partially cropped by the far left frame is fine.
- slightly RIGHT and FRONT of that canoe, one simple small white-and-blue wooden rowboat with a complete coherent hull and two internal bench seats. No extra protruding boards.
A visible strip of WATER must separate both vessels. No hulls, crossbeams or ropes intersect each other. Boats modest scale, correct waterlines and natural reflections. One simple mooring rope per boat to a nearby left boardwalk post, each rope routed separately without crossing other boats. No additional boats or parts.
Preserve all architecture, camera standing forward on the pier, foreground deck, left boardwalk, library and loungers, corgi carvings, yellow map warning sign and its exact bilingual lettering, sailor under veranda, broad right beach passage and beach shop, terrain, vegetation, lighting, palette and style. One complete opaque 8:3 panorama.
```

