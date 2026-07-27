# 咕噜的美食餐车 · Gulu's Foodie Truck

一个给学龄前小朋友玩的网页小游戏：**接单 → 开车采食材 → 照食谱下厨 → 上菜**。

玩法参考了 Sesame Street 官网上那款餐车游戏的结构，但**代码、角色和所有美术都是从零原创的**——
主厨咕噜是一只紫色小毛怪，五位客人也各不相同，没有使用任何芝麻街的形象或素材。

直接用浏览器打开 `index.html` 就能玩，不需要装东西、不需要联网、没有构建步骤。

**在线试玩：** <https://lionnevergrowup.github.io/Sesamestreet/>

推到 `main` 之后 GitHub Actions 会自动重新发布，链接永远是最新版。

## 玩法

| 步骤 | 做什么 | 练到什么 |
| --- | --- | --- |
| 接单 | 客人说出想吃的菜 | 听指令、记任务 |
| 开车 | 开去食材产地 | 换场景，喘口气 |
| 采集 | 在丛林/农场/菜园里摘够指定数量的食材，别摘错 | **数数**、辨认、专注 |
| 下厨 | 按食谱 1→2→3 的顺序把食材放进厨具，再连续点击直到做好 | **按顺序执行**、因果关系 |
| 上菜 | 把做好的菜拖给客人 | 精细动作、分享的成就感 |

一共 5 关，要采集的数量从 3 个递增到 7 个：

1. 香蕉奶昔（丛林 · 摘 3 根香蕉 · 搅拌）
2. 草莓松饼（农场 · 摘 4 颗草莓 · 煎）
3. 番茄比萨（菜园 · 摘 5 个番茄 · 烤）
4. 胡萝卜浓汤（菜园 · 摘 6 根胡萝卜 · 煮）
5. 蓝莓冰淇淋（树林 · 摘 7 颗蓝莓 · 冷冻）

每通一关得一颗星，星星数存在浏览器本地。

## 给小朋友考虑的几个细节

- **点一下和拖拽都行。** 拖不准没关系，命中判定放宽了 80px；直接点一下食材也会自己飞进锅里。
- **不会"输"。** 摘错、放错只会晃一下 + 提示"再看看食谱"，不扣分、不重来。
- **不打断。** 中间步骤就地更新，不整屏重绘，连点的时候不会吞掉点击。
- **横屏提示。** 手机竖着拿会提示转横屏。
- **声音可关。** 右上角随时静音，设置会记住。
- **存不了也能玩。** 隐私模式或存储被禁用时，只是记不住星星，不会白屏。
- **尊重系统设置。** 开了「减少动态效果」就不放氛围动画，键盘操作有可见焦点圈。

## 操作

| 按钮 | 作用 |
| --- | --- |
| 🏠 | 回首页 |
| 🔊 | 静音开关 |
| EN / 中 | 中英文切换（游戏中随时可切） |

开车途中点一下屏幕可以跳过。

## 项目结构

```
index.html          页面骨架和 HUD（开发时用这个）
build.js            打包脚本：node build.js → play.html
play.html           单文件版本（所有样式和脚本内联），部署用的就是它
css/style.css       全部样式；1280×720 固定舞台，等比缩放到任意屏幕
js/store.js         存进度；localStorage 不可用时自动退回内存
js/audio.js         WebAudio 实时合成音效（无音频文件）
js/art.js           全部美术：角色、食材、菜品、厨具、场景，都是生成的 SVG
js/recipes.js       游戏数据：食材、关卡、食谱、采集点位
js/i18n.js          中英文案
js/game.js          场景状态机与交互
.github/workflows/  推到 main 自动发布到 GitHub Pages
```

没有依赖、没有第三方库、没有任何外部请求。游戏本体是 8 个文件（`index.html` + 样式 + 6 个脚本），
`build.js` 和 `play.html` 只是为了部署方便。

## 本地运行

```bash
# 双击 index.html 就行；想用服务器的话：
python3 -m http.server 8000
# 然后打开 http://localhost:8000

# 改完源文件后重新打包单文件版：
node build.js
```

`play.html` 是从源文件生成的，别直接改它——改 `index.html` / `css/` / `js/`，然后重新跑 `node build.js`。
打包时会把所有非 ASCII 字符转义成 `\uXXXX` 和数字字符引用，这样文件不管被当成什么编码读，中文都不会乱码。

---

## English

A preschool web game: take an order, drive out to gather ingredients, follow the recipe,
and serve it up. The gameplay structure is modelled on the food-truck game on the Sesame
Street site, but **all code, characters, and artwork here are original** — Gulu is a purple
monster of our own, and no Sesame Street assets or characters are used.

Open `index.html` in a browser. No install, no build, no network. Five levels; the
ingredient count grows from 3 to 7 for counting practice. Tap or drag both work, nothing
can be failed, and the whole UI toggles between Chinese and English at any time.
