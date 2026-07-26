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
  bug:        { zh: '小虫子', en: 'Little Bug' },
  acorn:      { zh: '橡果',   en: 'Acorn' }
};

/* 采集场景的背景主题 / foraging backdrops */
const PLACES = {
  jungle: { zh: '香蕉丛林', en: 'Banana Jungle' },
  farm:   { zh: '草莓农场', en: 'Strawberry Farm' },
  garden: { zh: '菜园子',   en: 'Veggie Garden' },
  forest: { zh: '蓝莓树林', en: 'Blueberry Woods' }
};

/*
  每一关 / each level:
    dish       菜品 id（决定成品图）
    customer   顾客造型 id
    place      采集地点（背景）
    target     要采集的食材
    count      要采集几个（随关卡递增，练习数数）
    decoys     采集场景里的干扰物
    steps      食谱步骤，必须按顺序放进锅里
    appliance  烹饪器具，决定最后的小游戏动画
    taps       烹饪需要点几下
*/
const LEVELS = [
  {
    id: 'smoothie',
    dish: { zh: '香蕉奶昔', en: 'Banana Smoothie' },
    customer: 'birdie',
    place: 'jungle',
    target: 'banana',
    count: 3,
    decoys: ['bug', 'acorn'],
    steps: ['banana', 'milk', 'ice'],
    shelfExtra: ['cheese', 'carrot'],
    appliance: 'blender',
    taps: 5
  },
  {
    id: 'pancake',
    dish: { zh: '草莓松饼', en: 'Strawberry Pancakes' },
    customer: 'pip',
    place: 'farm',
    target: 'strawberry',
    count: 4,
    decoys: ['bug', 'acorn'],
    steps: ['flour', 'egg', 'strawberry'],
    shelfExtra: ['salt', 'tomato'],
    appliance: 'griddle',
    taps: 6
  },
  {
    id: 'pizza',
    dish: { zh: '番茄比萨', en: 'Tomato Pizza' },
    customer: 'moss',
    place: 'garden',
    target: 'tomato',
    count: 5,
    decoys: ['bug', 'acorn'],
    steps: ['dough', 'tomato', 'cheese'],
    shelfExtra: ['sugar', 'blueberry'],
    appliance: 'oven',
    taps: 6
  },
  {
    id: 'soup',
    dish: { zh: '胡萝卜浓汤', en: 'Carrot Soup' },
    customer: 'nib',
    place: 'garden',
    target: 'carrot',
    count: 6,
    decoys: ['bug', 'acorn'],
    steps: ['carrot', 'water', 'salt'],
    shelfExtra: ['cream', 'strawberry'],
    appliance: 'pot',
    taps: 7
  },
  {
    id: 'icecream',
    dish: { zh: '蓝莓冰淇淋', en: 'Blueberry Ice Cream' },
    customer: 'lulu',
    place: 'forest',
    target: 'blueberry',
    count: 7,
    decoys: ['bug', 'acorn'],
    steps: ['blueberry', 'cream', 'sugar'],
    shelfExtra: ['egg', 'dough'],
    appliance: 'freezer',
    taps: 7
  }
];

/*
  采集场景里物品的落点（1280×720 舞台坐标）。
  刻意避开了顶部横幅、左下角的篮子和底部的按钮。
*/
const FORAGE_SPOTS = [
  [ 230, 215 ], [ 450, 170 ], [ 690, 205 ], [ 900, 165 ], [ 1120, 215 ],
  [ 150, 395 ], [ 370, 340 ], [ 590, 400 ], [ 810, 340 ], [ 1030, 395 ], [ 1200, 350 ],
  [ 430, 545 ], [ 860, 555 ], [ 1120, 545 ]
];
