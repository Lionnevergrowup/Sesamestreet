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
    serve: null
  };

  const level = () => LEVELS[S.level];

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
    paint('sc-title', `
      <div class="bg">${Art.street()}</div>
      <div class="layer">
        <div class="pos truck-title">${Art.truck()}</div>
        <div class="pos chef-title bob">${Art.chef('cheer')}</div>
        <div class="card title-card">
          <h1>${t('gameTitle')}</h1>
          <p class="sub">${t('gameSub')}</p>
          <button class="big-btn" id="play">${t('play')}</button>
          <div class="how">
            ${steps.map(([art, label], i) => `
              <div class="how-item"><div class="how-art">${art}</div>
                <span><b>${i + 1}</b>${label}</span></div>`).join('')}
          </div>
        </div>
      </div>
    `, () => {
      on('#play', () => { S.level = 0; startLevel(); });
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
    paint('sc-drive', `
      <div class="bg road-scroll">${Art.road()}${Art.road()}</div>
      <div class="layer">
        <div class="pos drive-truck">${Art.truck()}
          <div class="puff p1"></div><div class="puff p2"></div>
        </div>
        <div class="banner">${t('driveTitle', { place: I18N.place(L.place) })}</div>
        <div class="chip bottom-chip">${t('driving')}</div>
      </div>
    `, () => {
      Sound.engine();
      const myGen = gen;
      /* 到点自动开到，或者中途点一下直接跳过 */
      const go = () => {
        sceneEl.removeEventListener('click', go);
        if (isCurrent(myGen)) renderForage();
      };
      later(go, 2400);
      sceneEl.addEventListener('click', go);
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
     7. 过关 / 通关
  ================================================================ */
  function levelClear() {
    S.stars++;
    Store.set('gulu.stars', S.stars);
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
      title: renderTitle, order: renderOrder, drive: renderDrive, forage: renderForage,
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
