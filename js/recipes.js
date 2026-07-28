/* ------------------------------------------------------------------
   recipes.js — 游戏数据：食材、关卡、食谱
   Game data: ingredients, levels, recipes.
------------------------------------------------------------------ */

/* 所有食材的显示名 / display names for every ingredient */
const INGREDIENTS = {
  banana:     { zh: '香蕉',   en: 'Banana' },
  strawberry: { zh: '草莓',   en: 'Strawberry' },
  tomato:     { zh: '番茄',   en: 'Tomato' },
  carrot:     { zh: '胡萝卜', en: 'Carrot' },
  blueberry:  { zh: '蓝莓',   en: 'Blueberry' },
  apple:      { zh: '苹果',   en: 'Apple' },
  lemon:      { zh: '柠檬',   en: 'Lemon' },
  corn:       { zh: '玉米',   en: 'Corn' },
  pumpkin:    { zh: '南瓜',   en: 'Pumpkin' },
  mushroom:   { zh: '蘑菇',   en: 'Mushroom' },
  grape:      { zh: '葡萄',   en: 'Grape' },
  peach:      { zh: '桃子',   en: 'Peach' },
  milk:       { zh: '牛奶',   en: 'Milk' },
  ice:        { zh: '冰块',   en: 'Ice' },
  flour:      { zh: '面粉',   en: 'Flour' },
  egg:        { zh: '鸡蛋',   en: 'Egg' },
  cheese:     { zh: '奶酪',   en: 'Cheese' },
  dough:      { zh: '面团',   en: 'Dough' },
  water:      { zh: '清水',   en: 'Water' },
  salt:       { zh: '盐',     en: 'Salt' },
  cream:      { zh: '奶油',   en: 'Cream' },
  sugar:      { zh: '糖',     en: 'Sugar' },
  honey:      { zh: '蜂蜜',   en: 'Honey' },
  butter:     { zh: '黄油',   en: 'Butter' },
  chocolate:  { zh: '巧克力', en: 'Chocolate' },
  bug:        { zh: '小虫子', en: 'Little Bug' },
  acorn:      { zh: '橡果',   en: 'Acorn' }
};

/* 采集场景的背景主题 / foraging backdrops */
const PLACES = {
  jungle:  { zh: '香蕉丛林', en: 'Banana Jungle' },
  farm:    { zh: '草莓农场', en: 'Strawberry Farm' },
  garden:  { zh: '菜园子',   en: 'Veggie Garden' },
  forest:  { zh: '莓果树林', en: 'Berry Woods' },
  orchard: { zh: '果园',     en: 'Orchard' },
  field:   { zh: '玉米地',   en: 'Corn Field' }
};

/*
  每一关 / each level:
    dish       菜品（决定成品图，id 同时是 Art.dish 的键）
    customer   顾客造型
    place      采集地点（背景）
    targets    要采回来的东西，[{ id, count }]；后期会有两种，一次要记两个数
    decoys     采集场景里的干扰物
    steps      食谱步骤，必须按顺序放进锅里（后期从 3 步涨到 5 步）
    shelfExtra 货架上多出来的干扰食材
    appliance  烹饪器具
    taps       烹饪要点几下
    drift      true = 采集物会缓缓飘动，更难点中

  难度是三条线一起涨的：要数的数量、要记的食谱长度、还有手上的准头。
*/
const LEVELS = [
  {
    id: 'smoothie', dish: { zh: '香蕉奶昔', en: 'Banana Smoothie' },
    customer: 'birdie', place: 'jungle',
    targets: [{ id: 'banana', count: 3 }],
    decoys: ['bug', 'acorn'],
    steps: ['banana', 'milk', 'ice'], shelfExtra: ['cheese', 'carrot'],
    appliance: 'blender', taps: 5
  },
  {
    id: 'pancake', dish: { zh: '草莓松饼', en: 'Strawberry Pancakes' },
    customer: 'pip', place: 'farm',
    targets: [{ id: 'strawberry', count: 4 }],
    decoys: ['bug', 'acorn'],
    steps: ['flour', 'egg', 'strawberry'], shelfExtra: ['salt', 'tomato'],
    appliance: 'griddle', taps: 6
  },
  {
    id: 'pizza', dish: { zh: '番茄比萨', en: 'Tomato Pizza' },
    customer: 'moss', place: 'garden',
    targets: [{ id: 'tomato', count: 5 }],
    decoys: ['bug', 'acorn'],
    steps: ['dough', 'tomato', 'cheese'], shelfExtra: ['sugar', 'blueberry'],
    appliance: 'oven', taps: 6
  },
  {
    id: 'soup', dish: { zh: '胡萝卜浓汤', en: 'Carrot Soup' },
    customer: 'nib', place: 'garden',
    targets: [{ id: 'carrot', count: 6 }],
    decoys: ['bug', 'acorn'],
    steps: ['carrot', 'water', 'salt'], shelfExtra: ['cream', 'strawberry'],
    appliance: 'pot', taps: 7
  },
  {
    id: 'icecream', dish: { zh: '蓝莓冰淇淋', en: 'Blueberry Ice Cream' },
    customer: 'lulu', place: 'forest',
    targets: [{ id: 'blueberry', count: 7 }],
    decoys: ['bug', 'acorn'],
    steps: ['blueberry', 'cream', 'sugar'], shelfExtra: ['egg', 'dough'],
    appliance: 'freezer', taps: 7
  },

  /* ---- 从这里开始一次要采两种，食谱也变成四步 ---- */
  {
    id: 'applepie', dish: { zh: '苹果派', en: 'Apple Pie' },
    customer: 'tuk', place: 'orchard',
    targets: [{ id: 'apple', count: 5 }, { id: 'lemon', count: 2 }],
    decoys: ['bug', 'acorn'],
    steps: ['dough', 'apple', 'sugar', 'butter'], shelfExtra: ['salt', 'corn'],
    appliance: 'oven', taps: 7
  },
  {
    id: 'cornsoup', dish: { zh: '玉米浓汤', en: 'Corn Soup' },
    customer: 'coco', place: 'field',
    targets: [{ id: 'corn', count: 5 }, { id: 'mushroom', count: 3 }],
    decoys: ['bug', 'acorn'],
    steps: ['corn', 'water', 'cream', 'salt'], shelfExtra: ['sugar', 'grape'],
    appliance: 'pot', taps: 8
  },
  {
    id: 'lemonade', dish: { zh: '柠檬汽水', en: 'Lemonade' },
    customer: 'zip', place: 'orchard',
    targets: [{ id: 'lemon', count: 6 }, { id: 'honey', count: 2 }],
    decoys: ['bug', 'acorn'],
    steps: ['lemon', 'water', 'honey', 'ice'], shelfExtra: ['butter', 'mushroom'],
    appliance: 'blender', taps: 8, drift: true
  },
  {
    id: 'pumpkinpie', dish: { zh: '南瓜派', en: 'Pumpkin Pie' },
    customer: 'plum', place: 'field',
    targets: [{ id: 'pumpkin', count: 5 }, { id: 'corn', count: 4 }],
    decoys: ['bug', 'acorn'],
    steps: ['dough', 'pumpkin', 'honey', 'cream'], shelfExtra: ['ice', 'lemon'],
    appliance: 'oven', taps: 8, drift: true
  },

  /* ---- 最后三关：五步食谱 ---- */
  {
    id: 'grapejuice', dish: { zh: '葡萄汁', en: 'Grape Juice' },
    customer: 'olly', place: 'orchard',
    targets: [{ id: 'grape', count: 6 }, { id: 'peach', count: 4 }],
    decoys: ['bug', 'acorn'],
    steps: ['grape', 'peach', 'water', 'sugar', 'ice'], shelfExtra: ['salt', 'cheese'],
    appliance: 'blender', taps: 9, drift: true
  },
  {
    id: 'mushroompizza', dish: { zh: '蘑菇比萨', en: 'Mushroom Pizza' },
    customer: 'bumbo', place: 'forest',
    targets: [{ id: 'mushroom', count: 5 }, { id: 'tomato', count: 5 }],
    decoys: ['bug', 'acorn'],
    steps: ['dough', 'tomato', 'mushroom', 'cheese', 'salt'], shelfExtra: ['honey', 'peach'],
    appliance: 'oven', taps: 9, drift: true
  },
  {
    id: 'peachcake', dish: { zh: '桃子蛋糕', en: 'Peach Cake' },
    customer: 'sunny', place: 'orchard',
    targets: [{ id: 'peach', count: 6 }, { id: 'grape', count: 5 }],
    decoys: ['bug', 'acorn'],
    steps: ['flour', 'egg', 'peach', 'chocolate', 'cream'], shelfExtra: ['water', 'corn'],
    appliance: 'oven', taps: 10, drift: true
  }
];

/*
  采集场景里物品的落点（1280×720 舞台坐标）。
  刻意避开了顶部横幅、左下角的篮子和底部的按钮。
  后面几关一屏最多要放 11 个目标 + 3 个干扰物，所以点位要够。
*/
const FORAGE_SPOTS = [
  [ 230, 205 ], [ 420, 158 ], [ 610, 200 ], [ 800, 155 ], [ 990, 200 ], [ 1160, 158 ],
  [ 140, 335 ], [ 330, 296 ], [ 520, 344 ], [ 710, 296 ], [ 900, 344 ], [ 1090, 296 ], [ 1180, 420 ],
  [ 250, 462 ], [ 440, 470 ], [ 640, 448 ], [ 840, 470 ], [ 1030, 458 ],
  [ 700, 606 ], [ 930, 600 ], [ 1160, 598 ]
];

/*
  每种食材的代表色。自由厨房里会把选中食材的颜色混在一起，
  做出来的东西就是那个颜色 —— 乱搭也能得到一个像样的成品。
*/
const ING_COLOR = {
  banana: '#ffd75e', strawberry: '#ef4b52', tomato: '#e8453c', carrot: '#f4842c',
  blueberry: '#4a5fc1', apple: '#e8453c', lemon: '#ffd23f', corn: '#ffd23f',
  pumpkin: '#f4842c', mushroom: '#e8635c', grape: '#8b5fe0', peach: '#ff9f7a',
  milk: '#f2f6fa', ice: '#a8dcf0', flour: '#eadfc8', egg: '#fff3dc',
  cheese: '#ffcf4d', dough: '#f0dcb8', water: '#7cc4e8', salt: '#dfe7ee',
  cream: '#fff3dc', sugar: '#fdfdfd', honey: '#ffb03a', butter: '#ffd23f',
  chocolate: '#6b4420'
};

/* 自由厨房里可以随便拿的食材（不含虫子和橡果） */
const FREE_INGREDIENTS = Object.keys(ING_COLOR);

/* 分类小游戏用：这些是水果，那些是蔬菜 */
const FRUITS = ['banana', 'strawberry', 'blueberry', 'apple', 'lemon', 'grape', 'peach'];
const VEGGIES = ['tomato', 'carrot', 'corn', 'pumpkin', 'mushroom'];
