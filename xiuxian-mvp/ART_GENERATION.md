# 生成素材记录

日期：2026年10月6日。采用内置 imagegen 生图工具，未使用 CLI 或外部 API 密钥。

以下原始 PNG 保存在 public/art，生成结果未经文件级裁切或重绘。角色和道具保持透明通道；游戏在渲染时选择角色边界及图集区域。

| 文件 | 用途 |
|---|---|
| village.png | 手机竖屏山居背景 |
| hero.png | 散修角色与头像 |
| items.png | 4×2丹药、种子、灵草、矿石与内丹图集 |
| forest.png | 手机竖屏秘境背景，十个秘境共用基础素材并结合地形与色调 |

当前角色使用单张生成精灵，移动、跳跃、朝向与攻击由程序驱动；还未制作逐帧走路与攻击动画。按钮图标和妖兽暂保留程序像素图。

## 最终提示词

### village

透明背景：否。

Use case: game background asset. Create a finished pixel-art background for a PHONE PORTRAIT Chinese cultivation farming game, vertical 2:3 composition. A humble worn wooden cottage with mossy green tiled roof occupies upper right, bamboo forest and misty layered mountains in upper third, stream and small pond left, pale dirt path curving down center, a spacious CLEAR meadow occupies lower half for four interactive farm plots and a separately rendered hero. Do not draw farm plots or characters into the background. Cozy detailed handcrafted 16-bit pixel art with visible square pixels, muted jade green, warm earthy brown and soft golden daylight, strong readable silhouettes, restrained richly textured foliage. Camera elevated top-down RPG view, orthographic, no isometric perspective. No text, no buttons, no HUD, no frame, no logo. This is an actual background texture, not a screenshot or a phone mockup. Village and foreground must remain readable when used at 390px width.

### hero

透明背景：是。

Use case: transparent mobile pixel game sprite. A single full-body male low-status wandering Chinese cultivator, young adult, dark tied hair/topknot, worn ivory and muted teal Hanfu, simple belt and boots, holding an old iron sword down at his side. Facing right in a three-quarter side view appropriate for a 2D platform action game. Exact entire character visible including feet and sword, centered with small even transparent margin. Handcrafted 16-bit pixel art, crisp square pixels, no antialiasing, warm muted jade and ivory palette, readable silhouette, detailed but compact, about a classic 48x64 logical pixel sprite enlarged cleanly. True transparent background, no floor, no shadow backdrop, no scene, no UI, no text, no border, no labels, one character only.

### items

透明背景：是。

Use case: game item sprite atlas, actual transparent art asset. Generate ONE orderly 4 by 2 grid of EIGHT separated pixel-art item icons with identical cells and generous transparent gutters, no overlap. Row 1 left to right: green healing pill, blue spirit cultivation pill, purple advanced pill, luminous golden supreme aptitude pill. Row 2 left to right: small cloth pouch of grass seeds with two seeds beside it, green medicinal herb sprig with roots, orange-red copper ore rock, golden round monster inner core with a red center. 16-bit handcrafted Chinese xianxia pixel art, crisp block pixels, restrained highlights, jade/ivory/earth/gold palette, centered each object in its cell, each approximately 32x32 logical pixels, fully visible, all cells same scale. True transparent background. No labels, no text, no numbers, no grid lines, no rounded tile backgrounds, no UI, no frame.

### forest

透明背景：否。

Use case: vertical mobile action game background texture. A PHONE PORTRAIT 2:3 pixel-art landscape of an ancient Chinese bamboo forest cultivation secret realm. Twilight jade mountains in upper background, layered tall bamboo trunks and dense foliage along left and right, faint fireflies and a weathered stone shrine, open darker middle space for separately drawn side-view platforms and character. Side-view parallax platform-game environment, not top-down. Dark teal green, desaturated emerald, amber highlights; detailed handcrafted 16-bit pixel art with crisp square pixel clusters. Foreground ground surface only in bottom tenth, no raised platforms, no creatures or people, no text, no UI, no phone mockup. Actual game background, usable cropped as camera scrolls horizontally in a portrait game.



## v0.7 院落交互物件图集

工具：内置 image_gen，透明背景。保存：public/art/interactables.png。运行时按4列2行取图，不修改生成原图。

提示词：

Create ONE production game sprite atlas for a Chinese ancient xianxia farming mobile game. Transparent RGBA background, no ground scene, no text, no labels, no grid lines. Exact 4 columns x 2 rows of equal square cells. One object centered fully contained with generous transparent margins in each cell. Top row left to right: battered bronze three-legged alchemy furnace with tiny glowing ember; small wooden market stall with ochre cloth canopy and herb baskets; wooden notice board with parchment order scrolls; old wooden storage chest with brass fittings. Bottom row left to right: weathered standing stone portal with faint jade glow; woven meditation cushion beside a small incense burner; bundle of wooden-handled farming tools and seed sack; bamboo bed with a folded cream blanket. All objects strict consistent 3/4 top-down RPG view, crisp low-resolution pixel art, chunky pixels, muted moss green ochre cream bronze palette, sunlit from upper left, rustic weathered materials. No characters. Use clear readable silhouettes. Each sprite same footprint scale occupying about 75 percent cell. Atlas usable for direct equal-cell canvas cropping.


## v0.8 地图与炼丹洞

使用内置 image_gen 生成并保存至 public/art/travel-map.png 和 public/art/alchemy-cave.png。地图为独立背景，三个目的地覆盖物件点击区域；炼丹洞保留透明背景，绘制在家园右侧。

地图提示词：Create a portrait pixel art overworld map background for an ancient Chinese xianxia mobile RPG, 2:3 aspect ratio. NO TEXT NO LABELS NO CHARACTERS NO UI. Top down gently elevated 3/4 view, coherent muted moss green ochre cream palette, crisp chunky low resolution pixel game art. A winding dirt path connects exactly THREE clearly readable destinations: a rustic merchant market canopy in the lower LEFT around x25% y65%; a wooden order notice board under a pavilion in lower RIGHT around x75% y65%; a mysterious jade glowing stone gate into mountain ruins in TOP CENTER around x50% y25%. Surround paths with bamboo, streams, stone bridge, misty mountain cliffs, grass, tiny flowers. Leave clear space around these landmarks for overlaid click labels. This is actual playable map art, not UI mockup.

炼丹洞提示词：Use case stylized-concept. A single compact alchemy cave entrance sprite for an ancient Chinese xianxia farming RPG, transparent background. 3/4 top-down view, crisp chunky pixel art matching muted moss green ochre cream old rural village. Weathered gray-brown rock alcove doorway, bamboo vines and moss around rim, small battered bronze cauldron emitting warm amber light inside dark entrance, two stone steps, small hanging wooden blank plaque no text. Fully contained centered subject with transparent margins, no scenery no characters no UI. Clear readable silhouette at 70px display size.


## v0.9.2 住宅室内

内置 image_gen 制作，保存为 public/art/interior.png。提示词：Production background for portrait mobile Chinese xianxia pixel farming game. Rustic old rural cottage INTERIOR, 3/4 elevated RPG camera, 2:3 portrait composition, crisp chunky pixel art, muted moss green ochre warm cream palette. Timber plank floor, exposed rafters, plaster and bamboo walls, small paper window on rear wall admitting soft daylight, weathered wooden doorway on upper-right with a glimpse of village green outdoors, rough bamboo shelves and small clay cups in back corner. Center and lower floor mostly empty with a small round straw meditation cushion and incense stand in lower-left, a low plain writing table at rear. NO BED, NO STORAGE CABINET, NO alchemy workbench, NO characters, NO text, NO UI. Cozy but poor, ancient Chinese style, no modern objects. Room fills entire image, camera focuses indoor space not yard, enough clear floor for interactive objects and player sprite.


## v0.11 战斗反馈素材

现有角色PNG通过位置偏移形成挥剑前探动作。五行技能特效使用项目内代码绘制的 public/art/battle-fx.svg（五格金木水火土图集），配合Canvas粒子线、伤害数字和闪烁。素材没有调用生图模型或引用外部素材；音效来自 src/audio.js 的 Web Audio 振荡器合成。


## v0.11.1 集市融入地图

使用内置 image_gen 编辑原 travel-map.png，原图保留，生成结果保存为 public/art/travel-map-bazaar.png。移除独立摊位图标叠加，点击区覆盖背景内集市。

提示词：Edit this existing portrait pixel RPG map. Preserve its composition, dimensions and all original landmarks: jade portal top center, permanent shop tent mid-left, wooden notice pavilion mid-right, bridges, mountain paths, vegetation. Add ONE small mountain bazaar organically built into the LOWER CENTER clearing at x36%-66%, y76%-90%. It consists of two modest bamboo market stands with faded moss-green and ochre cloth roofs, herb baskets, clay jars and a low table, perhaps two tiny distant robed merchants. This bazaar is clearly distinct from the permanent shop at mid-left. Match the original pixel scale exactly, elevated camera perspective, muted palette, sunlight direction, ambient occlusion and grounded contact shadows. Blend naturally into the path and grass, leave walkable paths around stalls. No pasted cutout look, no oversized icon, no border, no labels, no text, no UI. Everything must look painted as part of the same map. Preserve other landmark locations for existing click hit areas.


## v0.13 背包行囊

内置 image_gen 生成透明素材，保存为 public/art/backpack.png。参考用户提供的背包界面布局，以现有像素风重新制作行囊；未复制其物品图标。提示词：A single ancient Chinese traveler satchel for a pixel art xianxia mobile game inventory header, transparent background, no text no UI no frame. Rustic brown woven backpack with leather straps, a rolled bamboo scroll and cream bedroll tied on top, tiny jade potion bottle attached at side. 3/4 view, crisp chunky pixel art, moss green ochre warm cream muted palette, upper left lighting. Fully contained centered object with transparent margins, clear readable silhouette at 100px display size. Original game prop, not cartoon promotional art.


## v0.15 补充

沿用现有AI生成背景、角色与道具图集；凝露丹复用蓝色丹药图标、月华种子复用种子图标。住宅灯笼、盆栽及门幡由src/pixel.js程序绘制，无新增第三方素材。
# v0.16 斜俯视家园图集

2026-10-06 使用内置 image_gen 生图。三张透明 PNG 原图保存在 public/art；运行时按四象限与透明边界读取，无外部素材拼贴。游戏使用生成图集，不将参考项目许可冒用于生成素材。

- isometric-buildings-v1.png：2×2 图集，破旧江南住宅、炼丹亭与丹炉、竹篱药田、柳树；统一斜俯视像素风、透明背景、无文字、无界面框。
- isometric-terrain-v1.png：2×2 菱形地块图集，草地、水面、泥土、石路；统一视角，透明背景、无文字。运行时缩放为 80×40 地块并裁剪到菱形。
- isometric-ui-v1.png：2×2 工具图集，布置图纸与笔、铺路石块、玉色确认符、撤销箭头；像素风，透明背景，无文字。实际界面另用文字标明功能。

提示设计强调：ancient Chinese xianxia mobile game, isometric pixel art, consistent lighting and camera angle, four isolated assets in a 2 by 2 atlas, transparent background, no text, no UI frames。分别指定上述建筑、地表和工具对象。


## v0.16.2 山水环境
内置 image_gen 新生成 public/art/home-landscape-v1.png。提示：高视角斜俯视古风修仙家园，细腻手绘，非像素风；中央大面积草地留白，外围柳树竹林、灰岩山峰、溪流瀑布与雾气，无建筑、文字及网格。地图世界范围扩大到1800，背景与建筑分层绘制，边缘补充柳树遮景。经营地块及旧布局不变。

## v0.16.5 技能书图标
使用内置 image_gen 生成透明背景的独立道具图 public/art/skillbook-v1.png。以古朴墨绿色封皮、鎏金护角、红色书签和五行纹样表现修仙秘籍；替换此前误用的任务告示牌图标。所有五行与品质的技能书共用此图标，在商店和背包等物品入口保持一致。

提示词：A single ancient Chinese cultivation manual book for a mobile xianxia farming RPG item icon, transparent background. A substantial closed deep jade-green clothbound book, visible gilded brass corner guards and spine ornaments, embossed circular five-elements emblem on its cover, thick cream pages, a small red silk bookmark ribbon. Three-quarter view, richly detailed hand-painted game illustration, warm gold highlights, clear compact silhouette, centered and fully visible with transparent padding. The object must unmistakably be a bound book, not a signboard, notice board, plaque, scroll, card, or UI element. No text, no lettering, no labels, no border, no background.

## v0.16.7 家园石桥
以 `public/art/home-landscape-v1.png` 为底图，通过内置 image_gen 编辑生成 `public/art/home-landscape-v2.png`，在家园地图东南侧溪流增加石拱桥与短石径。桥上覆盖透明点击热区，进入外出地图；热区随家园地图缩放与拖动。

提示词：Edit this exact square Chinese cultivation homestead landscape image. Keep the scene composition and painterly style, add one small elegant stone footbridge over the stream at lower-right meadow around 64% from left and 73% from top, joining grassy rocky banks. Integrate with water, stones and a short path. No text, no interface, no markings.

## v0.18 九宫家园与四阶段作物
使用内置 image_gen；生成原图直接复制至public/art，不修改PNG。家园原图exec-57f299ea-a382-487b-aae2-a25baeca07b8.png，作物原图exec-9d8c1af1-5db2-47ab-9cbe-23363dedc156.png，均保留在Codex generated_images目录。
家园提示：手绘古风山水庭院，非像素；左上练功房、右上炼丹炉；中下部严格三行三列九块空药田，顶部留状态条位置，无文字和UI。
作物提示：透明4×4图集，等大独立单格；四行青灵草、月华仙草、焰心草、霜露仙草；四列种子（土中三粒种子）、幼苗（两片嫩叶）、植株（半成长）、成熟（茂密开花）。青灵草翠绿白花，月华仙草银蓝花，焰心草红橙琥珀花，霜露仙草冰青晶花；45度俯视手绘，非像素，无文字、框线和背景，透明alpha。游戏以CSS背景定位显示单格，原始图集保留。

## v0.19 手动炼丹美术
内置image_gen生成六档丹房背景与透明药泥、药杵、火焰、成丹图集。素材已保存public/art/alchemy-rooms-v1.png与public/art/alchemy-process-v1.png。原图保留，CSS取单格，不编辑PNG。完整提示词和原始输出路径记录在release/alchemy-art-prompts-v0.19.json。


## v0.22.0 青岚妖兽图集

内置 image_gen 生成，透明背景，手绘非像素；原图2172×724直接复制为 public/art/qinglan-monsters-v1.png，未编辑PNG。原始输出：C:/Users/mosanbai/.codex/generated_images/01a10f51-54fa-71c0-904f-ec5583eafecd/exec-49b36ed2-f080-4aaa-a161-2a3c3289ac5e.png。显示时按各角色边界取区域，分别对应青竹獠鼠、竹影妖狼、青岚兽王。背景与主角沿用项目素材。

提示词：Use case stylized-concept. Game asset transparent sprite atlas for a Chinese fantasy cultivation mobile game, hand-painted detailed 2D illustration, NOT pixel art. EXACTLY three equal square cells in one horizontal row, with generous transparent margins, each contains one full-body hostile bamboo forest monster facing LEFT, grounded feet aligned near bottom: cell1 a small jade-green bamboo rat with mossy fur and sharp tusks, cell2 a lean forest wolf with leafy green mane, cell3 a powerful bamboo beast king, tiger-like with jade antlers and dark emerald mane. Ancient Chinese folklore beasts, readable strong silhouettes, warm earthy jade palette, no gore. Whole canvas landscape 3:1. No text, no borders, no scene background, no labels, no shadows extending across cells. Actual transparent alpha background. Each creature stays fully inside its own equal cell, no overlap. Suitable sprites for a side-view turn-based battle with a human cultivator.

## v0.25.1 饲灵果四阶段
内置 image_gen 模式生成，透明底；原始2172×724 PNG直接复制到 public/art/spirit-fruit-stages-v1.png，保留原图不编辑。原始输出：C:/Users/mosanbai/.codex/generated_images/01a10f51-54fa-71c0-904f-ec5583eafecd/exec-6bac0c18-c24e-4b40-b0c0-689d60649c12.png。四列在代码中用于种子、幼苗、植株、成熟阶段，果实及种子库存图标沿用同一图集。

提示词：Use case: stylized-concept. Production game asset, a Chinese xianxia mobile farming game's four-stage fruit crop sprite atlas. Exact layout 4 equal square cells in one horizontal row, no text no borders no scenery, true transparent alpha background. A small compact leafy fruit bush called beast-taming spirit fruit, emerald rounded leaves, warm amber-orange round fruits with subtle golden speckles. Cells left to right: 1 three seeds in a tiny soil mound, 2 tiny two-leaf seedling, 3 knee-high leafy bush with no ripe fruits, 4 same compact bush laden with 6 ripe amber-orange round fruits clearly visible. Match hand-painted isometric Chinese fantasy game assets, detailed soft painterly shading, NOT pixel art. Entire objects fully inside each cell with 12 percent transparent margins, never touch neighbor cell; grounded base near bottom 85 percent, centered, same viewing angle and consistent lighting. Landscape 4:1 image. No pots, no UI, no letters.
