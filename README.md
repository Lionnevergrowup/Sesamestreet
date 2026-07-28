# 咕噜的美食餐车 · Gulu's Foodie Truck

一个给学龄前小朋友玩的网页小游戏：**接单 → 开车采食材 → 照食谱下厨 → 上菜**。

玩法参考了 Sesame Street 官网上那款餐车游戏的结构，但**代码、角色和所有美术都是从零原创的**——
主厨咕噜是一只紫色小毛怪，12 位客人也各不相同，没有使用任何芝麻街的形象或素材。

直接用浏览器打开 `index.html` 就能玩，不需要装东西、不需要联网、没有构建步骤。

**在线试玩：** <https://lionnevergrowup.github.io/Sesamestreet/>

推到 `main` 之后 GitHub Actions 会自动重新发布，链接永远是最新版。

## 五种玩法

| 模式 | 干什么 |
| --- | --- |
| **闯关** | 12 关按剧情走，从上次没打完的那关接着玩 |
| **选一关玩** | 12 关任选，想玩哪个菜就玩哪个，不用按顺序 |
| **自由厨房** | 25 种食材随便拿、5 种厨具随便换，做出来的东西颜色由你放的食材混成 —— 没有对错，也没有失败 |
| **小游戏** | 三个和做菜无关的小玩意，练的是另外三种本事（见下） |
| **收藏册** | 做过的菜和自己发明的都留在这儿 |

另外，首页上的咕噜是可以点的 —— 点它就能**换装**：6 种毛色 × 4 种围裙色，换完整局都记着。

### 小游戏

| 游戏 | 怎么玩 | 练什么 |
| --- | --- | --- |
| **翻牌找一样的** | 牌都盖着，翻两张，一样就留下 | **工作记忆** —— 记住刚才看到的东西在哪儿。3 / 4 / 6 对三档 |
| **这是水果还是蔬菜？** | 一次出一样，放进对的筐 | **分类判断** —— 按类别归纳。放错只提示不惩罚 |
| **数一数有几个** | 一堆东西摆在垫子上，数完点那个数字 | **点数**（一个一个数出总数）—— 8 道题从 2 个数到 9 个，答错只让你再数一遍 |

这三个和主线的"看准了点""照顺序做"是完全不同的脑力活，所以不会玩腻。
数一数摆成方阵（6 个是两行三列，9 个是三行三列），比排成一长条好数得多。

### 收藏册

菜谱上的 12 道菜，做出来一道就亮一道；没做过的只留一个灰色的影子，看得出有这么一道，但不剧透。
自由厨房里做的东西也会存进来（最近 12 个，同一个配方不重复占格），当时放了什么、用的哪个厨具，
下次打开还是原样画出来。

## 闯关怎么玩

| 步骤 | 做什么 | 练到什么 |
| --- | --- | --- |
| 接单 | 客人说出想吃的菜 | 听指令、记任务 |
| 开车 | 路上有水果和星星飘过，点到就收进兜里 | 手眼协调（捡不到也不影响过关） |
| 采集 | 在丛林、农场、菜园、树林、果园、玉米地摘够指定数量的食材，别摘错 | **数数**、辨认、专注 |
| 下厨 | 按食谱 1→2→3 的顺序把食材放进厨具，再连续点击直到做好 | **按顺序执行**、因果关系 |
| 上菜 | 把做好的菜拖给客人 | 精细动作、分享的成就感 |

一共 12 关，难度沿三条线一起涨：**要数的数量**、**要记的食谱长度**、**手上的准头**。

| 关 | 菜 | 去哪儿 | 要采什么 | 食谱 |
| --- | --- | --- | --- | --- |
| 1 | 香蕉奶昔 | 丛林 | 香蕉 ×3 | 3 步 |
| 2 | 草莓松饼 | 农场 | 草莓 ×4 | 3 步 |
| 3 | 番茄比萨 | 菜园 | 番茄 ×5 | 3 步 |
| 4 | 胡萝卜浓汤 | 菜园 | 胡萝卜 ×6 | 3 步 |
| 5 | 蓝莓冰淇淋 | 树林 | 蓝莓 ×7 | 3 步 |
| 6 | 苹果派 | 果园 | 苹果 ×5 **+ 柠檬 ×2** | 4 步 |
| 7 | 玉米浓汤 | 玉米地 | 玉米 ×5 + 蘑菇 ×3 | 4 步 |
| 8 | 柠檬汽水 | 果园 | 柠檬 ×6 + 蜂蜜 ×2 | 4 步 · 食材开始飘 |
| 9 | 南瓜派 | 玉米地 | 南瓜 ×5 + 玉米 ×4 | 4 步 · 飘 |
| 10 | 葡萄汁 | 果园 | 葡萄 ×6 + 桃子 ×4 | **5 步** · 飘 |
| 11 | 蘑菇比萨 | 树林 | 蘑菇 ×5 + 番茄 ×5 | 5 步 · 飘 |
| 12 | 桃子蛋糕 | 果园 | 桃子 ×6 + 葡萄 ×5 | 5 步 · 飘 |

三处变化让后半段不至于变成重复劳动：

- **第 6 关起要同时采两种**，篮子分两行各数各的 —— 一次记两个数。
- **食谱从 3 步涨到 5 步**，货架上的干扰食材也更多。
- **第 8 关起采集物会缓缓飘动**，需要瞄准。

12 位客人各不相同，6 种采集场景，25 种食材。

每通一关得一颗星。通过哪些关会记在浏览器本地，所以下次打开能接着玩，选关页上也会标出来。

## 给小朋友考虑的几个细节

- **点一下和拖拽都行。** 拖不准没关系，命中判定放宽了 80px；直接点一下食材也会自己飞进锅里。
- **不会"输"。** 摘错、放错只会晃一下 + 提示"再看看食谱"，不扣分、不重来。自由厨房里更是怎么搭都对。
- **不用按顺序。** 想玩第 9 关就直接点第 9 关，不必先打通前 8 关。
- **不打断。** 中间步骤就地更新，不整屏重绘，连点的时候不会吞掉点击。
- **横屏提示。** 手机竖着拿会提示转横屏。
- **有声音。** 一直在走的背景音乐，加上采摘、下锅、上菜各自的音效，全部是实时合成的，没有音频文件。左上角随时静音。
- **存不了也能玩。** 隐私模式或存储被禁用时，只是记不住星星和换装，不会白屏。
- **尊重系统设置。** 开了「减少动态效果」就不放氛围动画，键盘操作有可见焦点圈。

## 操作

| 按钮 | 作用 |
| --- | --- |
| 🏠 | 回首页 |
| ↻ | 重新加载（卡住了或想从头来） |
| 🔊 | 静音开关（音乐和音效一起） |
| EN / 中 | 中英文切换（游戏中随时可切） |

开车途中点一下屏幕可以跳过。

## 项目结构

```
index.html          页面骨架和 HUD（开发时用这个）
build.js            打包脚本：node build.js → play.html
play.html           单文件版本（所有样式和脚本内联），部署用的就是它
css/style.css       全部样式；1280×720 固定舞台，等比缩放到任意屏幕
js/store.js         存进度；localStorage 不可用时自动退回内存
js/audio.js         WebAudio 实时合成：背景音乐 + 全部音效（无音频文件）
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

Open `index.html` in a browser. No install, no build, no network. Twelve levels across six
foraging locations, with twelve customers and twenty-five ingredients. Difficulty climbs on
three axes: how many things to count, how long the recipe is, and how steady the aim needs
to be — from level 6 two different ingredients must be gathered at once, recipes grow from
three steps to five, and from level 8 the ingredients drift as you reach for them.

Five ways to play: work through the twelve levels, jump straight to any level you like
from the picker, open the free kitchen — twenty-five ingredients, five appliances, no
recipe and no wrong answers, where whatever you invent comes out coloured by the
ingredients you chose, take on one of three mini games, or leaf through the collection.
The mini games are a memory pairs board at three sizes, a fruit-or-vegetable sorter, and
a counting game where a tidy block of items appears and you tap the matching numeral.
Those three ask for working memory, for categorising, and for one-to-one counting — none
of which the main game exercises. The drive between the order and the field is a small
catching game rather than a cutscene. The collection keeps every dish you have cooked,
recipe dishes as well as your own free-kitchen inventions; the ones you have not made yet
show as grey silhouettes. Tap Gulu on the title screen to change his fur and apron colour;
the choice sticks.

Music and every sound effect are synthesised live in the browser, so there are no audio
files. Tap or drag both work, nothing can be failed, and the whole UI toggles between
Chinese and English at any time.
