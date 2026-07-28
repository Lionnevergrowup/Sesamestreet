/* ------------------------------------------------------------------
   i18n.js — 中英双语文案 / bilingual copy
------------------------------------------------------------------ */

const I18N = (() => {
  const STR = {
    zh: {
      rotate: '把设备横过来玩更好哦！',
      gameTitle: '咕噜的美食餐车',
      gameSub: '接单 · 采食材 · 下厨 · 上菜',
      play: '开始营业',
      resume: '接着营业',
      pickLevel: '选一关玩',
      backHome: '回首页',
      skip: '到了！',
      freeKitchen: '自由厨房',
      freeHint: '想放什么就放什么，做出来都算数',
      freeEmpty: '锅还是空的，去右边拿点东西吧',
      freeCook: '开始做！',
      freeClear: '倒掉重来',
      freeDone: '出锅啦！这是你自己想出来的',
      freeAgain: '再做一个',
      miniGames: '小游戏',
      memTitle: '翻牌找一样的',
      memDesc: '记住它们在哪儿',
      memEasy: '容易', memMid: '一般', memHard: '有点难',
      memFound: '找到{a}对，还剩{b}对',
      memWin: '全部找到啦！',
      memAgain: '再来一局',
      sortTitle: '这是水果还是蔬菜？',
      sortDesc: '放进对的筐里',
      sortFruit: '水果', sortVeg: '蔬菜',
      sortOops: '再想想，{ing}放哪个筐？',
      sortLeft: '还剩{n}个',
      sortWin: '全都分好啦！',
      how1: '听听客人想吃什么',
      how2: '开车去把新鲜食材摘回来',
      how3: '照着食谱一步一步做',
      how4: '把热腾腾的菜端给客人',
      customerLine: '我想吃一份{dish}！',
      orderBtn: '好的，交给我！',
      needTitle: '今天要做：{dish}',
      driveTitle: '出发去{place}！',
      driving: '路上颠颠颠…',
      forageTitle: '摘{count}个{ing}',
      forageTitle2: '摘{count}个{ing}，还要{count2}个{ing2}',
      forageEnough: '{ing}已经够啦，看看还缺什么？',
      forageOops: '这不是{ing}呀，再找找！',
      forageDone: '食材齐啦，回餐车！',
      backBtn: '回餐车做菜',
      recipeTitle: '{dish}食谱',
      nextIng: '接下来放：{ing}',
      wrongIng: '先看看食谱第{n}步哦！',
      cookNow: '食材都放好了，开工！',
      cookBtn: { blender: '搅一搅', griddle: '煎一煎', oven: '烤一烤', pot: '煮一煮', freezer: '冻一冻' },
      cookHint: '连续点击直到做好',
      dishReady: '{dish}做好啦！',
      serveBtn: '端给客人',
      serveTitle: '把{dish}端给客人',
      serveHint: '把菜拖给客人，或者点一下它',
      yum: '哇！太好吃啦，谢谢咕噜！',
      levelClear: '第{n}关完成！',
      reload: '重新加载',
      nextBtn: '下一位客人',
      allDone: '今天的客人都吃饱啦！',
      allDoneSub: '你一共得到{n}颗星星',
      replay: '再来一次'
    },
    en: {
      rotate: 'Turn your device sideways to play!',
      gameTitle: "Gulu's Foodie Truck",
      gameSub: 'Take the order · Gather · Cook · Serve',
      play: 'Open the truck',
      resume: 'Keep cooking',
      pickLevel: 'Pick a level',
      backHome: 'Back home',
      skip: 'We are here!',
      freeKitchen: 'Free kitchen',
      freeHint: 'Put in whatever you like — anything counts',
      freeEmpty: 'The pot is empty. Grab something from the right!',
      freeCook: 'Cook it!',
      freeClear: 'Tip it out',
      freeDone: 'Served! You invented this one',
      freeAgain: 'Make another',
      miniGames: 'Mini games',
      memTitle: 'Find the pairs',
      memDesc: 'Remember where they are',
      memEasy: 'Easy', memMid: 'Medium', memHard: 'Tricky',
      memFound: '{a} found, {b} to go',
      memWin: 'You found them all!',
      memAgain: 'Play again',
      sortTitle: 'Fruit or vegetable?',
      sortDesc: 'Drop it in the right crate',
      sortFruit: 'Fruit', sortVeg: 'Vegetable',
      sortOops: 'Have another think — where does the {ing} go?',
      sortLeft: '{n} to go',
      sortWin: 'All sorted!',
      how1: 'Listen to what the customer wants',
      how2: 'Drive out and pick fresh ingredients',
      how3: 'Follow the recipe step by step',
      how4: 'Serve it up while it is hot',
      customerLine: 'I would love some {dish}!',
      orderBtn: 'You got it!',
      needTitle: "Today's dish: {dish}",
      driveTitle: 'Off to the {place}!',
      driving: 'Bumpity bump…',
      forageTitle: 'Pick {count} {ing}',
      forageTitle2: 'Pick {count} {ing} and {count2} {ing2}',
      forageEnough: 'You have enough {ing} — what else is missing?',
      forageOops: 'That is not a {ing} — keep looking!',
      forageDone: 'All picked. Back to the truck!',
      backBtn: 'Back to the truck',
      recipeTitle: '{dish} recipe',
      nextIng: 'Add next: {ing}',
      wrongIng: 'Check step {n} of the recipe!',
      cookNow: 'Everything is in. Let us cook!',
      cookBtn: { blender: 'Blend it', griddle: 'Flip it', oven: 'Bake it', pot: 'Stir it', freezer: 'Freeze it' },
      cookHint: 'Keep tapping until it is done',
      dishReady: '{dish} is ready!',
      serveBtn: 'Serve it up',
      serveTitle: 'Serve the {dish}',
      serveHint: 'Drag the dish to the customer, or tap it',
      yum: 'Yum! Thank you, Gulu!',
      levelClear: 'Order {n} complete!',
      reload: 'Reload',
      nextBtn: 'Next customer',
      allDone: 'Everyone is full and happy!',
      allDoneSub: 'You earned {n} stars',
      replay: 'Play again'
    }
  };

  let lang = Store.get('gulu.lang') || 'zh';

  function t(key, vars = {}) {
    let s = STR[lang][key];
    if (s === undefined) s = STR.zh[key] ?? key;
    if (typeof s !== 'string') return s;
    return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
  }

  return {
    t,
    get lang() { return lang; },
    /* 数据文件里的名字都是 {zh, en} 结构 */
    name(obj) { return obj ? (obj[lang] ?? obj.zh) : ''; },
    ing(id) { return this.name(INGREDIENTS[id]); },
    place(id) { return this.name(PLACES[id]); },
    toggle() {
      lang = lang === 'zh' ? 'en' : 'zh';
      Store.set('gulu.lang', lang);
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
      return lang;
    }
  };
})();
