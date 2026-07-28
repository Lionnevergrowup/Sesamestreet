/* ------------------------------------------------------------------
   game.js — 场景状态机与交互
   Scene state machine: title → order → drive → forage → cook → serve
------------------------------------------------------------------ */

(() => {
  const stage = document.getElementById('stage');
  const sceneEl = document.getElementById('scene');
  const fxEl = document.getElementById('fx');
  const starCountEl = document.getElementById('star-count');
  const W = 1280, H = 720;
  let scale = 1;
  let busy = false;               // 场景切换中，屏蔽输入
  const t = (k, v) => I18N.t(k, v);

  /* ---------------- 游戏状态 ---------------- */
  const S = {
    phase: 'title',
    level: 0,
    stars: +(Store.get('gulu.stars') || 0),
    forage: null,
    cook: null,
    serve: null,
    drive: null,
    mem: null,
    sort: null,
    count: null
  };

  const level = () => LEVELS[S.level];
  const APPLIANCES = ['blender', 'pot', 'griddle', 'oven', 'freezer'];

  /*
    咕噜长什么样存在本地，一进来就先穿上。
    存的值只认调色板里的那几个颜色 —— 万一存档被改花了，
    也只会退回默认配色，不会把奇怪的字符串塞进 SVG 里。
  */
  (function loadChefLook() {
    const [fur, trim] = (Store.get('gulu.chef') || '').split('|');
    if (Art.CHEF_FURS.includes(fur) && Art.CHEF_TRIMS.includes(trim)) Art.setChefLook({ fur, trim });
  })();

  /* ---------------- 收藏册 ---------------- */
  /*
    做出来的东西要留个念想。菜谱上的菜记 id 就够了；
    自己发明的记下厨具和放了什么，看的时候现画。
  */
  const bookSet = () => new Set((Store.get('gulu.book') || '').split(',').filter(Boolean));
  function addToBook(id) {
    const b = bookSet();
    if (b.has(id)) return;
    b.add(id);
    Store.set('gulu.book', [...b].join(','));
  }

  const MAX_INV = 12;
  /* 读的时候顺手把不认识的条目筛掉，存档坏了也不会画出个空框 */
  function invList() {
    let v;
    try { v = JSON.parse(Store.get('gulu.inv') || '[]'); } catch (e) { return []; }
    if (!Array.isArray(v)) return [];
    return v.filter(r => r && APPLIANCES.includes(r.a) &&
                    Array.isArray(r.i) && r.i.length && r.i.every(id => ING_COLOR[id]))
            .slice(0, MAX_INV);
  }
  const invKey = r => r.a + ':' + [...r.i].sort().join(',');
  function addInvention(rec) {
    const key = invKey(rec);
    /* 同一个配方反复做不该占掉一整册，重了就挪到最前面 */
    const list = invList().filter(r => invKey(r) !== key);
    list.unshift(rec);
    Store.set('gulu.inv', JSON.stringify(list.slice(0, MAX_INV)));
  }

  /*
    哪些关通过了，单独存一份 —— 有了它才能做选关，
    小朋友想玩哪一关就玩哪一关，不用每次从第一关重打。
  */
  const doneSet = () => new Set((Store.get('gulu.done') || '').split(',').filter(Boolean));
  const markDone = id => {
    const d = doneSet(); d.add(id);
    Store.set('gulu.done', [...d].join(','));
  };
  /* 第一个还没通的关，"开始闯关"从这里接着玩 */
  function firstUndone() {
    const d = doneSet();
    const i = LEVELS.findIndex(L => !d.has(L.id));
    return i < 0 ? 0 : i;
  }

  /* ---------------- 舞台缩放 ---------------- */
  function fit() {
    scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    stage.style.transform = `scale(${scale})`;
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', () => setTimeout(fit, 120));

  /* ---------------- 小工具 ---------------- */

  const shuffle = a => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /* 元素在舞台坐标系里的位置 */
  function box(el) {
    const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    const x = (r.left - s.left) / scale, y = (r.top - s.top) / scale;
    const w = r.width / scale, h = r.height / scale;
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  }

  /* 让一个东西从 A 飞到 B（带一点抛物线） */
  function flyItem(html, fromEl, toEl, opts = {}) {
    if (!fromEl || !toEl) { opts.onDone && opts.onDone(); return; }
    const a = box(fromEl), b = box(toEl);
    const el = document.createElement('div');
    el.className = 'fly';
    el.innerHTML = html;
    el.style.left = a.cx + 'px';
    el.style.top = a.cy + 'px';
    el.style.width = a.w + 'px';
    el.style.height = a.h + 'px';
    fxEl.appendChild(el);
    Sound.whoosh();
    const dx = b.cx - a.cx, dy = b.cy - a.cy;
    const anim = el.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(-50%,-50%) translate(${dx * 0.5}px,${dy * 0.5 - 110}px) scale(1.2) rotate(12deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(${opts.endScale ?? 0.45})`, opacity: 0.85 }
    ], { duration: opts.dur ?? 520, easing: 'cubic-bezier(.35,.05,.3,1)' });
    anim.onfinish = () => { el.remove(); opts.onDone && opts.onDone(); };
  }

  /* 彩色小碎片爆开 */
  function burst(el, n = 14, colors = ['#ffd23f', '#ef4b52', '#5fbf7d', '#5aa8e8', '#8b5fe0']) {
    if (!el) return;
    const b = box(el);
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.className = 'particle';
      p.style.left = b.cx + 'px';
      p.style.top = b.cy + 'px';
      p.style.background = colors[i % colors.length];
      if (i % 3 === 0) p.style.borderRadius = '50%';
      fxEl.appendChild(p);
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.6;
      const d = 90 + Math.random() * 140;
      p.animate([
        { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(-50%,-50%) translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 60}px) scale(.3) rotate(${Math.random() * 540 - 270}deg)`, opacity: 0 }
      ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.2,.6,.4,1)' })
        .onfinish = () => p.remove();
    }
  }

  /* 顶部飘一句提示 */
  let toastTimer = null;
  function toast(text, kind = '') {
    const old = fxEl.querySelector('.toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.textContent = text;
    fxEl.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 1900);
  }

  function shake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  /* 拖拽（也支持直接点一下）——对小朋友来说命中判定放宽 80px */
  function draggable(el, { targetEl, onRelease }) {
    let sx = 0, sy = 0, moved = false, active = false;
    el.addEventListener('pointerdown', e => {
      if (busy) return;
      active = true; moved = false;
      sx = e.clientX; sy = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.classList.add('grabbing');
      e.preventDefault();
    });
    el.addEventListener('pointermove', e => {
      if (!active) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 10) moved = true;
      if (moved) el.style.transform = `translate(${dx / scale}px,${dy / scale}px) scale(1.12)`;
    });
    /* 手势被系统抢走（来电、多指、边缘滑动）就当没拖过，别误判成放下 */
    el.addEventListener('pointercancel', () => {
      if (!active) return;
      active = false;
      el.classList.remove('grabbing');
      el.style.transform = '';
    });

    const end = e => {
      if (!active) return;
      active = false;
      el.classList.remove('grabbing');
      el.style.transform = '';
      let hit = !moved;                       // 直接点一下 = 命中
      const target = typeof targetEl === 'function' ? targetEl() : targetEl;
      if (moved && target) {
        const s = stage.getBoundingClientRect();
        const px = (e.clientX - s.left) / scale, py = (e.clientY - s.top) / scale;
        const b = box(target), pad = 80;
        hit = px > b.x - pad && px < b.x + b.w + pad && py > b.y - pad && py < b.y + b.h + pad;
      }
      onRelease(hit);
    };
    el.addEventListener('pointerup', end);
  }

  /* ---------------- 场景切换 ---------------- */
  /*
    每次重绘都会换一个新的 gen 号。延时回调只在自己那一代还在台上时才执行，
    这样按主页键或提前跳过时，旧场景的定时器不会突然把玩家拽走。
  */
  let gen = 0;
  const later = (fn, ms) => { const g = gen; setTimeout(() => { if (g === gen) fn(); }, ms); };
  const isCurrent = g => g === gen;

  function paint(cls, html, after) {
    gen++;
    /*
      上个场景的提示和碎片不该飘到下一个场景里 ——
      比如"这不是香蕉呀"会一路飘到厨房。
      只清纯装饰的部分；飞行中的食材带着回调，让它自己飞完。
    */
    clearTimeout(toastTimer);
    fxEl.querySelectorAll('.toast, .particle').forEach(el => el.remove());
    sceneEl.classList.add('fade');
    busy = true;
    setTimeout(() => {
      sceneEl.className = 'scene fade ' + cls;
      sceneEl.innerHTML = html;
      void sceneEl.offsetWidth;
      sceneEl.classList.remove('fade');
      busy = false;
      if (after) after();
    }, 150);
  }

  const $ = sel => sceneEl.querySelector(sel);
  const on = (sel, fn) => {
    const el = $(sel);
    if (el) el.addEventListener('click', e => { if (!busy) { Sound.tap(); fn(e); } });
    return el;
  };

  function updateStars() { starCountEl.textContent = S.stars; }

  /* ================================================================
     1. 首页
  ================================================================ */
  function renderTitle() {
    S.phase = 'title';
    const steps = [
      [Art.customer('birdie'), t('how1')],
      [Art.basket(), t('how2')],
      [Art.appliance('pot'), t('how3')],
      [Art.dish('smoothie'), t('how4')]
    ];
    const done = doneSet().size;
    paint('sc-title', `
      <div class="bg">${Art.street()}</div>
      <div class="layer">
        <div class="pos truck-title">${Art.truck()}</div>
        <div class="card title-card">
          <h1>${t('gameTitle')}</h1>
          <p class="sub">${t('gameSub')}</p>
          <button class="big-btn" id="play">${done ? t('resume') : t('play')}</button>
          <div class="btn-row">
            <button class="mid-btn" id="pick">${t('pickLevel')}</button>
            <button class="mid-btn alt" id="free">${t('freeKitchen')}</button>
            <button class="mid-btn warm" id="mini">${t('miniGames')}</button>
            <button class="mid-btn sky" id="book">${t('bookTitle')}</button>
          </div>
          <div class="how">
            ${steps.map(([art, label], i) => `
              <div class="how-item"><div class="how-art">${art}</div>
                <span><b>${i + 1}</b>${label}</span></div>`).join('')}
          </div>
        </div>
        <!--
          咕噜排在卡片后面，是为了键盘顺序：按 Tab 应该先走到"开始营业"，
          换装是顺带的乐子，不该抢在正事前面。位置是绝对定位，看着没区别。
        -->
        <button class="pos chef-title bob" id="dressUp" aria-label="${t('dressTitle')}">
          ${Art.chef('cheer')}
          <span class="dress-tag">${t('dressTap')}</span>
        </button>
      </div>
    `, () => {
      on('#play', () => { S.level = firstUndone(); startLevel(); });
      on('#pick', renderLevelSelect);
      on('#free', renderFree);
      on('#mini', renderMiniMenu);
      on('#book', renderBook);
      on('#dressUp', renderDressUp);
    });
  }

  /* ================================================================
     1d. 换装 —— 咕噜是"我的"咕噜
  ================================================================ */
  function renderDressUp() {
    S.phase = 'dress';
    const swatch = (list, cur, kind) => list.map(c => `
      <button class="swatch${c === cur ? ' on' : ''}" data-kind="${kind}" data-c="${c}"
              style="--c:${c}" aria-label="${c}"></button>`).join('');

    /* 当前穿的这身，直接问美术层要，不另存一份免得两边对不上 */
    const cur = { fur: Art.chefLook.fur, trim: Art.chefLook.trim };

    paint('sc-dress', `
      <div class="bg">${Art.street()}</div>
      <div class="layer dim">
        <div class="banner">${t('dressTitle')}</div>
        <div class="pos dress-stage bob" id="dressChef">${Art.chef('cheer')}</div>
        <div class="card dress-panel">
          <h3>${t('dressFur')}</h3>
          <div class="swatch-row" id="furRow">${swatch(Art.CHEF_FURS, cur.fur, 'fur')}</div>
          <h3>${t('dressTrim')}</h3>
          <div class="swatch-row" id="trimRow">${swatch(Art.CHEF_TRIMS, cur.trim, 'trim')}</div>
        </div>
        <button class="big-btn bottom" id="dressBack">${t('dressDone')}</button>
      </div>
    `, () => {
      const preview = $('#dressChef');
      sceneEl.querySelectorAll('.swatch').forEach(b => b.addEventListener('click', () => {
        if (busy) return;
        const kind = b.dataset.kind, c = b.dataset.c;
        if (cur[kind] === c) return;
        cur[kind] = c;
        Sound.pick(Math.max(0, (kind === 'fur' ? Art.CHEF_FURS : Art.CHEF_TRIMS).indexOf(c)));
        Art.setChefLook({ [kind]: c });
        Store.set('gulu.chef', cur.fur + '|' + cur.trim);
        /*
          就地换掉预览就行 —— 整屏重绘那半秒里点击会被吞，
          而换装恰恰是小朋友会一口气连点十几下的地方。
        */
        if (preview) preview.innerHTML = Art.chef('cheer');
        b.parentElement.querySelectorAll('.swatch').forEach(x => x.classList.toggle('on', x === b));
        burst(b, 6, [c, '#fff6e6']);
      }));
      on('#dressBack', renderTitle);
    });
  }

  /* ================================================================
     1e. 收藏册 —— 做过的都在这儿
  ================================================================ */
  function renderBook() {
    S.phase = 'book';
    const got = bookSet();
    const inv = invList();

    const cells = LEVELS.map(L => {
      const have = got.has(L.id);
      return `<div class="book-cell${have ? '' : ' locked'}"
                   aria-label="${have ? I18N.name(L.dish) : t('bookLocked')}">
                <span class="book-art">${Art.dish(L.id)}</span>
                <span class="book-name">${have ? I18N.name(L.dish) : '?'}</span>
              </div>`;
    }).join('');

    const strip = inv.length
      ? inv.map((r, i) => `
          <div class="book-cell" aria-label="${t('bookMine', { n: i + 1 })}">
            <span class="book-art">${Art.creation(Art.blend(r.i), r.a, r.i)}</span>
            <span class="book-name">${t('bookMine', { n: i + 1 })}</span>
          </div>`).join('')
      : `<p class="book-empty">${t('bookEmpty')}</p>`;

    paint('sc-book', `
      <div class="bg">${Art.street()}</div>
      <div class="layer dim">
        <div class="banner">${t('bookTitle')}</div>
        <div class="card book-panel">
          <h3>${t('bookDishes', { a: got.size, b: LEVELS.length })}</h3>
          <div class="book-grid">${cells}</div>
          <h3>${t('bookInvent', { n: inv.length })}</h3>
          <div class="book-strip">${strip}</div>
        </div>
        <button class="big-btn bottom" id="backHome">${t('backHome')}</button>
      </div>
    `, () => { on('#backHome', renderTitle); });
  }

  /* ================================================================
     1b. 选关 —— 12 关任选，不必按顺序
  ================================================================ */
  function renderLevelSelect() {
    S.phase = 'select';
    const d = doneSet();
    paint('sc-select', `
      <div class="bg">${Art.street()}</div>
      <div class="layer dim">
        <div class="banner">${t('pickLevel')}</div>
        <div class="lv-grid">
          ${LEVELS.map((L, i) => `
            <button class="lv-card${d.has(L.id) ? ' cleared' : ''}" data-i="${i}"
                    aria-label="${i + 1}. ${I18N.name(L.dish)}">
              <span class="lv-no">${i + 1}</span>
              <span class="lv-art">${Art.dish(L.id)}</span>
              <span class="lv-name">${I18N.name(L.dish)}</span>
              ${d.has(L.id) ? `<span class="lv-star">${Art.star()}</span>` : ''}
            </button>`).join('')}
        </div>
        <button class="big-btn bottom" id="backHome">${t('backHome')}</button>
      </div>
    `, () => {
      sceneEl.querySelectorAll('.lv-card').forEach(b => b.addEventListener('click', () => {
        if (busy) return;
        Sound.tap();
        S.level = +b.dataset.i;
        startLevel();
      }));
      on('#backHome', renderTitle);
    });
  }

  /* ================================================================
     2. 接单
  ================================================================ */
  function startLevel() {
    const L = level();
    S.forage = {
      /* 每种目标各记一个数 —— 后面的关卡要同时数两样东西 */
      picked: L.targets.map(() => 0),
      items: buildForageItems(L)
    };
    S.cook = { stepIndex: 0, shelf: shuffle([...L.steps, ...L.shelfExtra]), taps: 0, cooked: false };
    S.serve = { served: false };
    renderOrder();
  }

  /* 这一关的采集有没有全部完成 */
  const forageDone = () => level().targets.every((t, i) => S.forage.picked[i] >= t.count);

  function buildForageItems(L) {
    const ids = [];
    L.targets.forEach(t => { for (let i = 0; i < t.count; i++) ids.push(t.id); });
    L.decoys.forEach((d, i) => { ids.push(d); if (i === 0) ids.push(d); });   // 3 个干扰物
    const spots = shuffle(FORAGE_SPOTS).slice(0, ids.length);
    return shuffle(ids).map((id, i) => ({
      id,
      x: spots[i][0],
      y: spots[i][1],
      rot: Math.round(Math.random() * 40 - 20),
      sc: 0.9 + Math.random() * 0.25,
      delay: (i * 0.13).toFixed(2),
      taken: false
    }));
  }

  function renderOrder() {
    S.phase = 'order';
    const L = level();
    paint('sc-order', `
      <div class="bg">${Art.street()}</div>
      <div class="layer">
        <div class="pos truck-side">${Art.truck()}</div>
        <div class="pos chef-side bob">${Art.chef('idle', [0.6, 0.1])}</div>
        <div class="pos cust-order walk-in bob">${Art.customer(L.customer, false, [-0.6, 0.1])}</div>
        <div class="bubble pop-in">
          <div class="bubble-dish">${Art.dish(L.id)}</div>
          <p>${t('customerLine', { dish: I18N.name(L.dish) })}</p>
        </div>
        <div class="chip">${t('needTitle', { dish: I18N.name(L.dish) })}</div>
        <button class="big-btn under-bubble" id="accept">${t('orderBtn')}</button>
      </div>
    `, () => {
      later(() => Sound.pick(2), 500);
      on('#accept', renderDrive);
    });
  }

  /* ================================================================
     3. 开车去采集
  ================================================================ */
  function renderDrive() {
    S.phase = 'drive';
    const L = level();
    /*
      以前这里是干等 2.4 秒的过场动画。
      现在路上会飘来水果和星星，点到就收进兜里 ——
      整局游戏的操作原本全是"看准了点"，这一段加了点手快的成分，换换口味。
      收多少都不影响过关，纯属好玩，所以捡不到也不会有挫败感。
    */
    const goodies = shuffle([...FREE_INGREDIENTS]).slice(0, 5).concat(['star', 'star']);
    S.drive = { got: 0 };

    paint('sc-drive', `
      <div class="bg road-scroll">${Art.road()}${Art.road()}</div>
      <div class="layer">
        <div class="pos drive-truck">${Art.truck()}
          <div class="puff p1"></div><div class="puff p2"></div>
        </div>
        ${shuffle(goodies).map((id, i) => `
          <button class="road-item" data-id="${id}"
            style="--lane:${[188, 258, 330][i % 3]}px;--delay:${(i * 0.62).toFixed(2)}s">
            ${id === 'star' ? Art.star() : Art.ingredient(id)}
          </button>`).join('')}
        <div class="banner">${t('driveTitle', { place: I18N.place(L.place) })}</div>
        <div class="drive-bag"><span class="bag-ico">${Art.basket()}</span><b id="driveGot">0</b></div>
        <button class="skip-btn" id="skipDrive">${t('skip')}</button>
      </div>
    `, () => {
      Sound.engine();
      const myGen = gen;
      const counter = $('#driveGot');

      sceneEl.querySelectorAll('.road-item').forEach(btn => {
        btn.addEventListener('click', () => {
          if (busy || btn.dataset.taken) return;
          btn.dataset.taken = '1';
          S.drive.got++;
          Sound.pick(Math.min(S.drive.got - 1, 7));
          if (counter) counter.textContent = S.drive.got;
          burst(btn, 8, ['#ffd23f', '#fff6e6']);
          btn.style.visibility = 'hidden';
        });
      });

      const go = () => { if (isCurrent(myGen)) renderForage(); };
      later(go, 5200);
      on('#skipDrive', go);
    });
  }

  /* ================================================================
     4. 采集食材
  ================================================================ */
  function renderForage() {
    S.phase = 'forage';
    const L = level();
    const F = S.forage;
    const done = forageDone();

    const foreground = L.place === 'jungle'
      ? Art.svg(
          Art.leaf(-60, -30, 35, 1.5, '#173d2b') +
          Art.leaf(1320, 60, 168, 1.4, '#173d2b') +
          Art.leaf(-30, 780, -48, 1.5, '#1f4a34') +
          Art.leaf(1300, 700, 205, 1.3, '#1f4a34'),
          '0 0 1280 720', 'art-bg')
      : '';

    /* 要采一种还是两种，横幅的说法不一样 */
    const title = L.targets.length === 1
      ? t('forageTitle', { count: L.targets[0].count, ing: I18N.ing(L.targets[0].id) })
      : t('forageTitle2', {
          count: L.targets[0].count, ing: I18N.ing(L.targets[0].id),
          count2: L.targets[1].count, ing2: I18N.ing(L.targets[1].id)
        });

    /* 篮子：一种目标一行，各数各的 */
    const rows = L.targets.map((tg, ti) => `
      <div class="basket-row" data-t="${ti}">
        <span class="slots">
          ${Array.from({ length: tg.count }, (_, i) =>
            `<span class="slot ${i < F.picked[ti] ? 'full' : ''}">${i < F.picked[ti] ? Art.ingredient(tg.id) : ''}</span>`).join('')}
        </span>
        <span class="count">${F.picked[ti]}<em>/${tg.count}</em></span>
      </div>`).join('');

    paint('sc-forage', `
      <div class="bg">${Art.backdrop(L.place)}</div>
      <div class="layer">
        ${F.items.map((it, i) => it.taken ? '' : `
          <button class="forage-item sway${L.drift ? ' drift' : ''}" data-i="${i}" aria-label="${I18N.ing(it.id)}"
            style="left:${it.x}px;top:${it.y}px;--rot:${it.rot}deg;--sc:${it.sc};animation-delay:${it.delay}s">
            ${Art.ingredient(it.id)}
          </button>`).join('')}
        <div class="fg">${foreground}</div>
        <div class="banner">${title}</div>
        <div class="basket-hud${L.targets.length > 1 ? ' two' : ''}">
          <div class="basket-art">${Art.basket()}</div>
          <div class="basket-rows">${rows}</div>
        </div>
        ${done ? `
          <div class="pos chef-forage pop-in bob">${Art.chef('cheer')}</div>
          <button class="big-btn bottom" id="toCook">${t('backBtn')}</button>` : ''}
      </div>
    `, () => {
      const basketEl = $('.basket-art');
      sceneEl.querySelectorAll('.forage-item').forEach(btn => {
        btn.addEventListener('click', () => {
          if (busy) return;
          const it = F.items[+btn.dataset.i];
          if (it.taken) return;

          const ti = L.targets.findIndex(tg => tg.id === it.id);
          /* 不是要采的东西，或者这一种已经采够了 */
          if (ti < 0 || F.picked[ti] >= L.targets[ti].count) {
            shake(btn);
            Sound.oops();
            toast(ti >= 0
              ? t('forageEnough', { ing: I18N.ing(it.id) })
              : t('forageOops', { ing: I18N.ing(L.targets[0].id) }), 'warn');
            return;
          }

          it.taken = true;
          F.picked[ti]++;
          const slotIndex = F.picked[ti] - 1;   // 记住自己的格子，多个食材同时在飞也不会填错
          const wasLast = forageDone();
          Sound.pick(slotIndex);
          btn.style.pointerEvents = 'none';
          burst(btn, 8);
          flyItem(Art.ingredient(it.id), btn, basketEl, {
            onDone: () => {
              const row = sceneEl.querySelector(`.basket-row[data-t="${ti}"]`);
              if (row) {
                const slot = row.querySelectorAll('.slot')[slotIndex];
                if (slot) { slot.innerHTML = Art.ingredient(it.id); slot.classList.add('full'); }
                const c = row.querySelector('.count');
                if (c) c.innerHTML = `${F.picked[ti]}<em>/${L.targets[ti].count}</em>`;
              }
              if (basketEl) { basketEl.classList.remove('nudge'); void basketEl.offsetWidth; basketEl.classList.add('nudge'); }
              if (wasLast) {      // 最后一个落进篮子才算齐
                toast(t('forageDone'), 'good');
                Sound.ding();
                later(renderForage, 700);
              }
            }
          });
          /*
            摘走之后要把按钮真的删掉，不能只是让它透明。
            留着的话 DOM 里会有个看不见也点不了的幽灵按钮，读屏软件照念不误。
          */
          btn.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.4)' }],
            { duration: 220, fill: 'forwards' }).onfinish = () => btn.remove();
        });
      });
      on('#toCook', renderCook);
    });
  }

  /* ================================================================
     5. 下厨
  ================================================================ */
  function renderCook() {
    S.phase = 'cook';
    const L = level();
    const C = S.cook;
    const allIn = C.stepIndex >= L.steps.length;
    const done = C.cooked;

    const banner = done ? t('dishReady', { dish: I18N.name(L.dish) })
                 : allIn ? t('cookNow')
                 : t('nextIng', { ing: I18N.ing(L.steps[C.stepIndex]) });

    const controls = done ? `
        <div class="pos dish-pop">${Art.dish(L.id)}</div>
        <button class="big-btn bottom" id="serveBtn">${t('serveBtn')}</button>`
      : allIn ? `
        <div class="cook-controls">
          <button class="big-btn" id="cookBtn">${t('cookBtn')[L.appliance]}</button>
          <div class="progress"><i id="prog" style="width:${(C.taps / L.taps) * 100}%"></i></div>
          <p class="hint">${t('cookHint')}</p>
        </div>`
      : `
        <div class="shelf">
          ${C.shelf.map(id => {
            const used = L.steps.indexOf(id) > -1 && L.steps.indexOf(id) < C.stepIndex;
            return `<button class="ing-tile ${used ? 'used' : ''}" data-id="${id}" ${used ? 'disabled' : ''}>
                      ${Art.ingredient(id)}<span>${I18N.ing(id)}</span>
                    </button>`;
          }).join('')}
        </div>`;

    paint('sc-cook', `
      <div class="bg">${Art.kitchen()}</div>
      <div class="layer">
        <div class="card recipe-card">
          <h3>${t('recipeTitle', { dish: I18N.name(L.dish) })}</h3>
          <ol>
            ${L.steps.map((id, i) => `
              <li class="${i < C.stepIndex ? 'done' : ''} ${i === C.stepIndex ? 'now' : ''}">
                <b class="num">${i + 1}</b>
                <span class="ing">${Art.ingredient(id)}</span>
                <span class="nm">${I18N.ing(id)}</span>
                <span class="tick">✓</span>
              </li>`).join('')}
          </ol>
        </div>

        <div class="pos appliance-wrap ${allIn ? 'ready' : ''}" id="appliance">
          ${Art.appliance(L.appliance)}
          <div class="steam s1"></div><div class="steam s2"></div><div class="steam s3"></div>
        </div>
        <div class="pos chef-cook bob">${Art.chef('cook', [0.5, 0.2])}</div>

        <div class="banner">${banner}</div>
        ${controls}
      </div>
    `, () => {
      const appl = $('#appliance');

      sceneEl.querySelectorAll('.ing-tile').forEach(tile => {
        if (tile.disabled) return;
        draggable(tile, {
          targetEl: () => appl,
          onRelease: hit => {
            if (!hit) return;
            const id = tile.dataset.id;
            const need = L.steps[C.stepIndex];
            if (id !== need) {
              shake(tile);
              Sound.oops();
              toast(t('wrongIng', { n: C.stepIndex + 1 }), 'warn');
              return;
            }
            C.stepIndex++;
            tile.disabled = true;
            tile.classList.add('used');
            flyItem(Art.ingredient(id), tile, appl, {
              endScale: 0.3,
              dur: 420,
              onDone: () => {
                Sound.plop();
                appl.classList.remove('bump'); void appl.offsetWidth; appl.classList.add('bump');
                burst(appl, 8, ['#fff6e6', '#ffd23f']);
                /*
                  中间步骤就地更新食谱卡和横幅，不整屏重绘 ——
                  重绘那 ~0.5 秒里点击会被吞掉，小朋友连点时手感很差。
                */
                if (C.stepIndex >= L.steps.length) {
                  later(renderCook, 200);          // 食材齐了，换成"开火"面板
                  return;
                }
                sceneEl.querySelectorAll('.recipe-card li').forEach((li, i) => {
                  li.classList.toggle('done', i < C.stepIndex);
                  li.classList.toggle('now', i === C.stepIndex);
                });
                const bn = $('.banner');
                if (bn) bn.textContent = t('nextIng', { ing: I18N.ing(L.steps[C.stepIndex]) });
              }
            });
          }
        });
      });

      on('#cookBtn', () => {
        if (C.cooked) return;
        C.taps++;
        Sound.cookStep(C.taps);
        appl.classList.remove('bump'); void appl.offsetWidth; appl.classList.add('bump');
        const p = $('#prog');
        if (p) p.style.width = Math.min(100, (C.taps / L.taps) * 100) + '%';
        if (C.taps >= L.taps) finishCooking(appl);
      });

      on('#serveBtn', renderServe);
    });
  }

  function finishCooking(appl) {
    S.cook.cooked = true;
    addToBook(level().id);      /* 出锅就算做过，收藏册里立刻有了 */
    busy = true;
    const controls = $('.cook-controls');
    if (controls) controls.classList.add('hide');
    burst(appl, 26);
    Sound.ding();
    later(() => { busy = false; renderCook(); }, 620);
  }

  /* ================================================================
     6. 上菜
  ================================================================ */
  function renderServe() {
    S.phase = 'serve';
    const L = level();
    paint('sc-serve', `
      <div class="bg">${Art.street()}</div>
      <div class="layer">
        <div class="pos truck-side">${Art.truck()}</div>
        <div class="pos chef-side bob">${Art.chef('cook', [0.6, 0.2])}</div>
        <div class="pos cust-order bob" id="cust">${Art.customer(L.customer, false, [-0.6, 0.1])}</div>
        <div class="banner">${t('serveTitle', { dish: I18N.name(L.dish) })}</div>
        <div class="chip bottom-chip">${t('serveHint')}</div>
        <div class="pos serve-dish" id="dish">
          <div class="dish-inner float">
            <div class="plate"></div>
            ${Art.dish(L.id)}
          </div>
        </div>
      </div>
    `, () => {
      const dish = $('#dish'), cust = $('#cust');
      draggable(dish, {
        targetEl: () => cust,
        onRelease: hit => {
          if (!hit || S.serve.served) return;
          S.serve.served = true;
          busy = true;
          flyItem(dish.innerHTML, dish, cust, {
            endScale: 0.6,
            onDone: () => {
              Sound.yum();
              cust.innerHTML = Art.customer(L.customer, true, [0, 0]);
              cust.classList.add('happy');
              burst(cust, 22, ['#ef4b52', '#f38fc4', '#ffd23f']);
              const b = $('.banner');
              if (b) b.textContent = t('yum');
              later(() => { busy = false; levelClear(); }, 1200);
            }
          });
          dish.style.visibility = 'hidden';
        }
      });
    });
  }

  /* ================================================================
     1c. 小游戏 —— 练的是跟做菜完全不同的两种本事
  ================================================================ */
  function renderMiniMenu() {
    S.phase = 'mini';
    paint('sc-mini', `
      <div class="bg">${Art.street()}</div>
      <div class="layer dim">
        <div class="banner">${t('miniGames')}</div>
        <div class="mini-grid">
          <button class="mini-card" id="goMem">
            <span class="mini-art">${Art.cardBack()}${Art.cardBack()}</span>
            <b>${t('memTitle')}</b><span>${t('memDesc')}</span>
          </button>
          <button class="mini-card" id="goSort">
            <span class="mini-art">${Art.crate('fruit')}${Art.crate('veg')}</span>
            <b>${t('sortTitle')}</b><span>${t('sortDesc')}</span>
          </button>
          <button class="mini-card" id="goCount">
            <span class="mini-art count-art">
              ${Art.ingredient('apple')}${Art.ingredient('apple')}${Art.ingredient('apple')}
              <b class="count-badge">3</b>
            </span>
            <b>${t('countTitle')}</b><span>${t('countDesc')}</span>
          </button>
        </div>
        <button class="big-btn bottom" id="backHome">${t('backHome')}</button>
      </div>
    `, () => {
      on('#goMem', () => renderMemory(4));
      on('#goSort', () => renderSort(true));
      on('#goCount', () => renderCount(true));
      on('#backHome', renderTitle);
    });
  }

  /* ---------------- 数一数 ---------------- */
  /*
    做菜那边数数是"采够为止"，数错了还能接着采。
    这里换个考法：东西一次全摆出来，得先数清楚再挑数字，
    练的是把一堆东西点清的本事。
  */
  function buildCountRounds() {
    const kinds = shuffle([...FRUITS, ...VEGGIES]);
    /* 每题换个地方，八道题不会全在同一片菜园里 */
    const spots = shuffle(Object.keys(PLACES));
    /* 先小后大，题量固定 8 道；每道数目不重样，免得连着两题一样多 */
    const counts = [...shuffle([2, 3, 4, 5]), ...shuffle([6, 7, 8, 9])];
    return counts.map((n, i) => {
      const opts = new Set([n]);
      while (opts.size < 3) {
        const d = n + [-2, -1, 1, 2][Math.floor(Math.random() * 4)];
        if (d >= 1 && d <= 10) opts.add(d);
      }
      return { id: kinds[i % kinds.length], place: spots[i % spots.length], n, opts: shuffle([...opts]) };
    });
  }

  /*
    摆成方方正正的一块最好数：6 个是两行三列，9 个是三行三列。
    要是一味往一行里塞，5 个之后就成了"5 + 1"这种一头沉的样子，
    小朋友数第二行那一个的时候容易忘了前面数到几。
  */
  const countCols = n => (n <= 5 ? n : (n === 6 || n === 9) ? 3 : 4);

  function renderCount(fresh = true) {
    S.phase = 'count';
    if (fresh || !S.count) S.count = { queue: buildCountRounds(), done: 0, log: [] };
    const C = S.count;
    const r = C.queue[0];
    const won = !r;

    paint('sc-count', `
      <div class="bg">${Art.backdrop(won ? 'garden' : r.place)}</div>
      <div class="layer">
        <div class="banner">${won ? t('countWin') : t('countAsk', { ing: I18N.ing(r.id) })}</div>
        ${won ? '' : `<div class="chip">${t('countLeft', { n: C.queue.length })}</div>`}

        ${won ? `
          <!-- 数对的那些数字排在垫子上，当成一张小成绩单 -->
          <div class="count-field done" style="--cols:4">
            ${[...C.log].sort((a, b) => a - b).map((v, i) =>
              `<span class="count-one num" style="animation-delay:${(i * 0.09).toFixed(2)}s">${v}</span>`).join('')}
          </div>`
        : `
          <div class="count-field" style="--cols:${countCols(r.n)}">
            ${Array.from({ length: r.n }, (_, i) =>
              `<span class="count-one" style="animation-delay:${(i * 0.07).toFixed(2)}s">${Art.ingredient(r.id)}</span>`).join('')}
          </div>
          <div class="num-row">
            ${r.opts.map(v => `<button class="num-btn" data-v="${v}">${v}</button>`).join('')}
          </div>`}

        ${won ? `
          <div class="pos chef-mini pop-in bob">${Art.chef('cheer')}</div>
          <div class="sort-actions">
            <button class="big-btn" id="countAgain">${t('memAgain')}</button>
            <button class="mid-btn alt" id="backMini">${t('backHome')}</button>
          </div>`
        : `<button class="mid-btn alt corner" id="backMini">${t('backHome')}</button>`}
      </div>
    `, () => {
      /* 一屏只认一次作答，连点不会把后面的题一起跳掉 */
      let answered = false;
      sceneEl.querySelectorAll('.num-btn').forEach(b => {
        b.addEventListener('click', () => {
          if (busy || !r || answered) return;
          if (+b.dataset.v !== r.n) {
            shake(b);
            Sound.oops();
            toast(t('countOops'), 'warn');
            return;
          }
          answered = true;
          C.queue.shift();
          C.done++;
          C.log.push(r.n);
          Sound.pick(Math.min(C.done - 1, 7));
          b.classList.add('right');
          burst(b, 12);
          Sound.ding();
          later(() => renderCount(false), 620);
        });
      });
      if (won) { Sound.fanfare(); confetti(40); }
      on('#countAgain', () => renderCount(true));
      on('#backMini', renderMiniMenu);
    });
  }

  /* ---------------- 记忆配对 ---------------- */
  function renderMemory(pairs, fresh = true) {
    S.phase = 'memory';
    if (fresh || !S.mem || S.mem.pairs !== pairs) {
      const ids = shuffle(FREE_INGREDIENTS).slice(0, pairs);
      S.mem = {
        pairs,
        cards: shuffle([...ids, ...ids]).map(id => ({ id, up: false, done: false })),
        open: [],       // 当前翻开还没判定的
        found: 0,
        pending: null,  // 等着盖回去的那两张
        locked: false   // 两张翻开、正在等着盖回去
      };
    }
    const M = S.mem;
    const won = M.found >= M.pairs;

    paint('sc-memory', `
      <div class="bg">${Art.street()}</div>
      <div class="layer dim">
        <div class="banner">${won ? t('memWin') : t('memFound', { a: M.found, b: M.pairs - M.found })}</div>
        <div class="mem-board">
          ${M.cards.map((c, i) => `
            <button class="mem-card${c.up || c.done ? ' up' : ''}${c.done ? ' done' : ''}"
                    data-i="${i}" aria-label="${c.up || c.done ? I18N.ing(c.id) : t('memTitle')}">
              <span class="mem-face back">${Art.cardBack()}</span>
              <span class="mem-face front">${Art.ingredient(c.id)}</span>
            </button>`).join('')}
        </div>
        <div class="mem-levels">
          ${[[3, 'memEasy'], [4, 'memMid'], [6, 'memHard']].map(([n, k]) =>
            `<button class="mid-btn${n === M.pairs ? ' on' : ''}" data-p="${n}">${t(k)}</button>`).join('')}
          <button class="mid-btn alt" id="backMini">${t('backHome')}</button>
        </div>
        ${won ? `<div class="pos chef-mini pop-in bob">${Art.chef('cheer')}</div>` : ''}
      </div>
    `, () => {
      /*
        盖回去这件事必须挂在状态上、每次重绘都重新安排。
        以前只用一个定时器，重绘（比如中途切语言）会把它作废，
        结果两张牌永远翻着、M.locked 永远为真，整局就死在那儿了。
      */
      function flipBackSoon() {
        later(() => {
          if (!M.pending) return;
          const [x, y] = M.pending;
          M.cards[x].up = M.cards[y].up = false;
          M.pending = null;
          M.locked = false;
          sceneEl.querySelectorAll('.mem-card').forEach(el => {
            const j = +el.dataset.i;
            if (j === x || j === y) {
              el.classList.remove('up');
              el.setAttribute('aria-label', t('memTitle'));
            }
          });
        }, 1000);
      }
      if (M.locked && M.pending) flipBackSoon();   // 重绘后接着把牌盖回去

      sceneEl.querySelectorAll('.mem-card').forEach(btn => {
        btn.addEventListener('click', () => {
          if (busy || M.locked) return;
          const i = +btn.dataset.i, c = M.cards[i];
          if (c.up || c.done) return;

          c.up = true;
          btn.classList.add('up');
          btn.setAttribute('aria-label', I18N.ing(c.id));
          M.open.push(i);
          Sound.tap();

          if (M.open.length < 2) return;

          const [a, b] = M.open;
          M.open = [];
          if (M.cards[a].id === M.cards[b].id) {
            /* 配上了 */
            M.cards[a].done = M.cards[b].done = true;
            M.found++;
            Sound.pick(M.found - 1);
            sceneEl.querySelectorAll('.mem-card').forEach(el => {
              if (+el.dataset.i === a || +el.dataset.i === b) { el.classList.add('done'); burst(el, 8); }
            });
            const bn = $('.banner');
            if (M.found >= M.pairs) {
              Sound.fanfare();
              later(() => renderMemory(M.pairs, false), 700);
            } else if (bn) {
              bn.textContent = t('memFound', { a: M.found, b: M.pairs - M.found });
            }
          } else {
            /* 没配上，盖回去 —— 留够看清的时间 */
            M.locked = true;
            M.pending = [a, b];
            Sound.oops();
            flipBackSoon();
          }
        });
      });

      sceneEl.querySelectorAll('.mem-levels .mid-btn[data-p]').forEach(b =>
        b.addEventListener('click', () => { if (!busy) { Sound.tap(); renderMemory(+b.dataset.p); } }));
      on('#backMini', renderMiniMenu);
    });
  }

  /* ---------------- 水果还是蔬菜 ---------------- */
  function renderSort(fresh = true) {
    S.phase = 'sort';
    if (fresh || !S.sort) {
      S.sort = {
        queue: shuffle([...shuffle(FRUITS).slice(0, 5), ...shuffle(VEGGIES).slice(0, 5)]),
        done: 0
      };
    }
    const So = S.sort;
    const cur = So.queue[0];
    const won = !cur;

    paint('sc-sort', `
      <div class="bg">${Art.kitchen()}</div>
      <div class="layer">
        <div class="banner">${won ? t('sortWin') : t('sortTitle')}</div>
        ${won ? '' : `<div class="chip">${t('sortLeft', { n: So.queue.length })}</div>`}

        ${cur ? `<div class="pos sort-item pop-in" id="sortItem">${Art.ingredient(cur)}</div>` : ''}

        <button class="crate-btn left" data-kind="fruit" aria-label="${t('sortFruit')}">
          ${Art.crate('fruit')}<b>${t('sortFruit')}</b>
        </button>
        <button class="crate-btn right" data-kind="veg" aria-label="${t('sortVeg')}">
          ${Art.crate('veg')}<b>${t('sortVeg')}</b>
        </button>

        ${won ? `
          <div class="pos chef-mini pop-in bob">${Art.chef('cheer')}</div>
          <div class="sort-actions">
            <button class="big-btn" id="sortAgain">${t('memAgain')}</button>
            <button class="mid-btn alt" id="backMini">${t('backHome')}</button>
          </div>`
        : `<button class="mid-btn alt corner" id="backMini">${t('backHome')}</button>`}
      </div>
    `, () => {
      const item = $('#sortItem');
      /*
        一屏只认一次作答。小朋友会对着筐连按好几下，
        没这个闸门的话按 4 下就跳过 4 道题，题目哗哗地少。
      */
      let answered = false;
      sceneEl.querySelectorAll('.crate-btn').forEach(cb => {
        cb.addEventListener('click', () => {
          if (busy || !cur || answered) return;
          const right = (cb.dataset.kind === 'fruit') === FRUITS.includes(cur);
          if (!right) {
            shake(cb);
            Sound.oops();
            toast(t('sortOops', { ing: I18N.ing(cur) }), 'warn');
            return;
          }
          answered = true;
          So.queue.shift();
          So.done++;
          Sound.pick(Math.min(So.done - 1, 7));
          if (item) item.style.visibility = 'hidden';
          flyItem(Art.ingredient(cur), item || cb, cb, {
            endScale: 0.4,
            onDone: () => {
              burst(cb, 10);
              Sound.plop();
              later(() => renderSort(false), 140);
            }
          });
        });
      });
      on('#sortAgain', () => renderSort(true));
      on('#backMini', renderMiniMenu);
    });
  }

  /* ================================================================
     6b. 自由厨房 —— 想放什么放什么，没有对错，做完请客人吃
  ================================================================ */
  function renderFree(reset = true) {
    S.phase = 'free';
    if (reset || !S.free) S.free = { picked: [], appliance: 'blender', made: false, served: false };
    const F = S.free;
    const full = F.picked.length >= 6;

    const madeArt = F.made ? Art.creation(Art.blend(F.picked), F.appliance, F.picked) : '';

    paint('sc-free', `
      <div class="bg">${Art.kitchen()}</div>
      <div class="layer">
        <div class="banner">${F.made ? t('freeDone') : t('freeHint')}</div>

        <div class="pos free-appliance ${F.made ? 'ready' : ''}" id="appliance">
          ${Art.appliance(F.appliance)}
          <div class="steam s1"></div><div class="steam s2"></div><div class="steam s3"></div>
        </div>

        <div class="free-added">
          ${F.picked.map(id => `<span class="added-chip">${Art.ingredient(id)}</span>`).join('')}
          ${F.picked.length ? '' : `<span class="added-empty">${t('freeEmpty')}</span>`}
        </div>

        ${F.made ? `
          <div class="pos chef-free bob">${Art.chef('cheer')}</div>
          <div class="pos free-made pop-in" id="made">${madeArt}</div>
          <div class="free-actions">
            <button class="big-btn" id="freeAgain">${t('freeAgain')}</button>
            <button class="mid-btn" id="backHome">${t('backHome')}</button>
          </div>`
        : `
          <div class="pick-row">
            ${APPLIANCES.map(a => `
              <button class="pick-appl${a === F.appliance ? ' on' : ''}" data-a="${a}"
                      aria-label="${t('cookBtn')[a]}">${Art.appliance(a)}</button>`).join('')}
          </div>
          <div class="palette">
            ${FREE_INGREDIENTS.map(id => `
              <button class="pal-tile" data-id="${id}" ${full ? 'disabled' : ''}
                      aria-label="${I18N.ing(id)}">${Art.ingredient(id)}</button>`).join('')}
          </div>
          <div class="free-actions">
            <button class="big-btn" id="freeCook" ${F.picked.length ? '' : 'disabled'}>${t('freeCook')}</button>
            <button class="mid-btn" id="freeClear" ${F.picked.length ? '' : 'disabled'}>${t('freeClear')}</button>
            <button class="mid-btn" id="backHome">${t('backHome')}</button>
          </div>`}
      </div>
    `, () => {
      const appl = $('#appliance');

      /*
        放一样就地更新，不整屏重绘 ——
        重绘那几百毫秒里的点击会被吞掉，小朋友连着点就只进了一半。
      */
      const refreshFree = () => {
        const box = $('.free-added');
        if (box) {
          box.innerHTML = F.picked.length
            ? F.picked.map(id => `<span class="added-chip">${Art.ingredient(id)}</span>`).join('')
            : `<span class="added-empty">${t('freeEmpty')}</span>`;
        }
        const isFull = F.picked.length >= 6;
        sceneEl.querySelectorAll('.pal-tile').forEach(el => { el.disabled = isFull; });
        const cook = $('#freeCook'), clr = $('#freeClear');
        if (cook) cook.disabled = !F.picked.length;
        if (clr) clr.disabled = !F.picked.length;
      };

      sceneEl.querySelectorAll('.pal-tile').forEach(tile => {
        tile.addEventListener('click', () => {
          if (busy || tile.disabled || F.picked.length >= 6) return;
          const id = tile.dataset.id;
          F.picked.push(id);
          Sound.plop();
          refreshFree();
          flyItem(Art.ingredient(id), tile, appl, {
            endScale: 0.3, dur: 420,
            onDone: () => {
              appl.classList.remove('bump'); void appl.offsetWidth; appl.classList.add('bump');
              burst(appl, 6, ['#fff6e6', '#ffd23f']);
            }
          });
        });
      });

      /* 换厨具也就地换，别把整屏推倒重来 */
      sceneEl.querySelectorAll('.pick-appl').forEach(b => b.addEventListener('click', () => {
        if (busy) return;
        Sound.tap();
        F.appliance = b.dataset.a;
        sceneEl.querySelectorAll('.pick-appl').forEach(x => x.classList.toggle('on', x === b));
        appl.innerHTML = Art.appliance(F.appliance) +
          '<div class="steam s1"></div><div class="steam s2"></div><div class="steam s3"></div>';
        appl.classList.remove('bump'); void appl.offsetWidth; appl.classList.add('bump');
      }));

      on('#freeCook', () => {
        F.made = true;
        addInvention({ a: F.appliance, i: [...F.picked] });   /* 自己发明的也存进收藏册 */
        Sound.cookStep(2);
        later(() => { Sound.ding(); renderFree(false); }, 420);
      });
      on('#freeClear', () => { F.picked = []; refreshFree(); });
      on('#freeAgain', () => renderFree(true));
      on('#backHome', renderTitle);
    });
  }

  /* ================================================================
     7. 过关 / 通关
  ================================================================ */
  function levelClear() {
    S.stars++;
    Store.set('gulu.stars', S.stars);
    markDone(level().id);
    updateStars();
    Sound.fanfare();

    const last = S.level >= LEVELS.length - 1;
    const panel = document.createElement('div');
    panel.className = 'overlay';
    panel.innerHTML = `
      <div class="card panel pop-in">
        <div class="big-star">${Art.star()}</div>
        <h2>${t('levelClear', { n: S.level + 1 })}</h2>
        <p class="sub">${I18N.name(level().dish)}</p>
        <button class="big-btn" id="nextLv">${t('nextBtn')}</button>
      </div>`;
    sceneEl.appendChild(panel);
    confetti(30);
    /*
      面板是"弹"进来的，这半秒里按钮中心会移动 40 多像素，比按钮半高还多。
      小朋友手快，照着刚看到的位置戳下去就落空了，戳了没反应最让人烦。
      所以整块面板都接受点击 —— 反正这一屏只有"继续"这一个去处。
    */
    panel.addEventListener('click', () => {
      Sound.tap();
      panel.remove();
      if (last) renderFinale();
      else { S.level++; startLevel(); }
    });
  }

  function renderFinale() {
    S.phase = 'finale';
    paint('sc-finale', `
      <div class="bg">${Art.street()}</div>
      <div class="layer">
        <div class="pos truck-title">${Art.truck()}</div>
        <div class="crowd">
          ${LEVELS.map((L, i) =>
            `<div class="crowd-one bob" style="animation-delay:${i * 0.2}s">${Art.customer(L.customer, true)}</div>`).join('')}
        </div>
        <div class="pos chef-title bob">${Art.chef('cheer')}</div>
        <div class="card title-card">
          <h1>${t('allDone')}</h1>
          <p class="sub">${t('allDoneSub', { n: S.stars })}</p>
          <button class="big-btn" id="again">${t('replay')}</button>
        </div>
      </div>
    `, () => {
      Sound.fanfare();
      confetti(60);
      on('#again', () => { S.level = 0; startLevel(); });
    });
  }

  function confetti(n) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.className = 'particle confetti';
      p.style.left = Math.random() * W + 'px';
      p.style.top = '-20px';
      p.style.background = ['#ffd23f', '#ef4b52', '#5fbf7d', '#5aa8e8', '#8b5fe0', '#f38fc4'][i % 6];
      fxEl.appendChild(p);
      p.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${H + 80}px) translateX(${Math.random() * 200 - 100}px) rotate(${Math.random() * 900}deg)`, opacity: 0.9 }
      ], { duration: 1800 + Math.random() * 1600, delay: Math.random() * 700, easing: 'cubic-bezier(.3,.5,.6,1)' })
        .onfinish = () => p.remove();
    }
  }

  /* ---------------- 当前场景重绘（切换语言时用） ---------------- */
  function repaint() {
    ({
      title: renderTitle, select: renderLevelSelect, free: () => renderFree(false),
      mini: renderMiniMenu, memory: () => renderMemory(S.mem ? S.mem.pairs : 4, false),
      sort: () => renderSort(false), count: () => renderCount(false),
      dress: renderDressUp, book: renderBook,
      order: renderOrder, drive: renderDrive, forage: renderForage,
      cook: renderCook, serve: renderServe, finale: renderFinale
    }[S.phase] || renderTitle)();
  }

  /* ---------------- HUD ---------------- */
  document.getElementById('btn-home').addEventListener('click', () => { Sound.tap(); renderTitle(); });

  /* 重新加载整个页面 —— 卡住了或者想从头来，这个最直接 */
  document.getElementById('btn-reload').addEventListener('click', () => {
    Sound.tap();
    location.reload();
  });

  const soundBtn = document.getElementById('btn-sound');
  document.body.classList.toggle('muted', !Sound.enabled);
  soundBtn.addEventListener('click', () => {
    document.body.classList.toggle('muted', !Sound.toggle());
  });

  const langBtn = document.getElementById('btn-lang');
  langBtn.textContent = I18N.lang === 'zh' ? 'EN' : '中';
  document.documentElement.lang = I18N.lang === 'zh' ? 'zh-CN' : 'en';
  langBtn.addEventListener('click', () => {
    Sound.tap();
    const l = I18N.toggle();
    langBtn.textContent = l === 'zh' ? 'EN' : '中';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    if (S.phase === 'serve' && S.serve && S.serve.served) return;   // 别打断吃东西的动画
    repaint();
  });

  /*
    浏览器要求先有用户交互才让出声。
    键盘也算交互 —— 只听 pointerdown 的话，纯键盘玩的人一路是静音的。
    另外首次不一定成功（音频上下文可能还没就绪），所以确认响起来了才撤监听。
  */
  const unlockAudio = () => {
    Sound.unlock();
    if (Sound.running) {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    }
  };
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  /* ---------------- 启动 ---------------- */
  fit();
  updateStars();
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  renderTitle();
})();
