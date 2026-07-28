/* ------------------------------------------------------------------
   art.js — 全部美术都是这里现画的原创 SVG，没有任何外部图片。
   Every visual is original SVG generated here — no image assets,
   no third-party characters.
------------------------------------------------------------------ */

const Art = (() => {

  /* ---------- 通用小工具 / helpers ---------- */

  const svg = (inner, vb = '0 0 100 100', cls = '') =>
    `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  /* 毛茸茸的轮廓：沿椭圆一圈画外凸的小圆弧 */
  function furPath(cx, cy, rx, ry, n = 22) {
    const pt = i => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
    };
    let [x0, y0] = pt(0);
    let d = `M${x0.toFixed(1)} ${y0.toFixed(1)}`;
    for (let i = 1; i <= n; i++) {
      const [x, y] = pt(i), [px, py] = pt(i - 1);
      const r = (Math.hypot(x - px, y - py) / 2) * 1.18;
      d += `A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d + 'Z';
  }

  /* 一双会看人的大眼睛 */
  function eyes(cx, cy, r, gap, look = [0, 0], happy = false) {
    const [lx, ly] = look;
    const one = ex => happy
      ? `<path d="M${ex - r} ${cy} q${r} ${-r * 1.1} ${r * 2} 0" fill="none"
           stroke="#2b2340" stroke-width="${r * 0.42}" stroke-linecap="round"/>`
      : `<circle cx="${ex}" cy="${cy}" r="${r}" fill="#fffdf7"/>
         <circle cx="${ex}" cy="${cy}" r="${r}" fill="none" stroke="#2b2340" stroke-width="2" opacity=".18"/>
         <circle cx="${ex + lx * r * 0.34}" cy="${cy + ly * r * 0.34}" r="${r * 0.46}" fill="#2b2340"/>
         <circle cx="${ex + lx * r * 0.34 - r * 0.16}" cy="${cy + ly * r * 0.34 - r * 0.18}" r="${r * 0.16}" fill="#fff"/>`;
    return one(cx - gap / 2) + one(cx + gap / 2);
  }

  /* 一片叶子（丛林背景用） */
  const leaf = (x, y, rot, s, fill, vein = 'rgba(255,255,255,.22)') => `
    <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
      <path d="M0 0C34-46 104-52 150-6 104 44 34 44 0 0Z" fill="${fill}"/>
      <path d="M4 0C50 6 104 2 146-5" fill="none" stroke="${vein}" stroke-width="3" stroke-linecap="round"/>
    </g>`;

  /* ---------- 主厨咕噜 / the chef ---------- */
  /*
     pose: idle | cook | cheer | drive
     完全原创的紫色毛怪，戴厨师帽、系围裙。
  */
  function chef(pose = 'idle', look = [0, 0.15]) {
    const FUR = '#8b5fe0', FUR_D = '#6b41c0', BELLY = '#b494f2';
    const armL = { idle: 'rotate(14 58 168)', cook: 'rotate(-38 58 168)', cheer: 'rotate(-72 58 168)', drive: 'rotate(-30 58 168)' }[pose];
    const armR = { idle: 'rotate(-14 162 168)', cook: 'rotate(38 162 168)', cheer: 'rotate(72 162 168)', drive: 'rotate(26 162 168)' }[pose];
    const mouth = pose === 'cheer'
      ? `<path d="M84 132q26 34 52 0q-4 26-26 26t-26-26Z" fill="#3a2456"/>
         <path d="M96 150q14 14 28 0q-6-6-14-6t-14 6Z" fill="#f4718f"/>`
      : `<path d="M86 132q24 24 48 0" fill="none" stroke="#3a2456" stroke-width="7" stroke-linecap="round"/>`;

    return svg(`
      <defs>
        <radialGradient id="chefBelly" cx=".5" cy=".35">
          <stop offset="0" stop-color="${BELLY}"/><stop offset="1" stop-color="${FUR}"/>
        </radialGradient>
      </defs>
      <ellipse cx="110" cy="252" rx="72" ry="10" fill="rgba(31,74,52,.18)"/>

      <!-- 腿 -->
      <rect x="76" y="216" width="26" height="34" rx="13" fill="${FUR_D}"/>
      <rect x="118" y="216" width="26" height="34" rx="13" fill="${FUR_D}"/>
      <ellipse cx="86" cy="248" rx="20" ry="9" fill="#3a2456"/>
      <ellipse cx="134" cy="248" rx="20" ry="9" fill="#3a2456"/>

      <!-- 身体 + 围裙 -->
      <path d="${furPath(110, 186, 54, 46, 20)}" fill="${FUR}"/>
      <path d="M78 152h64a10 10 0 0 1 10 10v42a32 32 0 0 1-32 32h-20a32 32 0 0 1-32-32v-42a10 10 0 0 1 10-10Z" fill="#fff6e6"/>
      <path d="M98 152q12 10 24 0" fill="none" stroke="#ffb03a" stroke-width="6" stroke-linecap="round"/>
      <circle cx="110" cy="192" r="15" fill="none" stroke="#ffb03a" stroke-width="5"/>
      <path d="M110 183v18M103 192h14" stroke="#ffb03a" stroke-width="5" stroke-linecap="round"/>

      <!-- 手臂 -->
      <g transform="${armL}">
        <rect x="40" y="158" width="34" height="22" rx="11" fill="${FUR}"/>
        <circle cx="42" cy="169" r="15" fill="${BELLY}"/>
      </g>
      <g transform="${armR}">
        <rect x="146" y="158" width="34" height="22" rx="11" fill="${FUR}"/>
        <circle cx="178" cy="169" r="15" fill="${BELLY}"/>
      </g>

      <!-- 头 -->
      <path d="${furPath(110, 100, 62, 56, 24)}" fill="url(#chefBelly)"/>
      <!-- 触角 -->
      <path d="M84 50c-6-16-14-22-22-24" fill="none" stroke="${FUR_D}" stroke-width="6" stroke-linecap="round"/>
      <path d="M136 50c6-16 14-22 22-24" fill="none" stroke="${FUR_D}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="60" cy="24" r="9" fill="#ffd23f"/>
      <circle cx="160" cy="24" r="9" fill="#ffd23f"/>
      ${eyes(110, 88, 22, 46, look, pose === 'cheer')}
      <ellipse cx="70" cy="118" rx="12" ry="8" fill="#f4718f" opacity=".45"/>
      <ellipse cx="150" cy="118" rx="12" ry="8" fill="#f4718f" opacity=".45"/>
      ${mouth}

      <!-- 厨师帽 -->
      <path d="M68 60h84v-8a12 12 0 0 0-12-12H80a12 12 0 0 0-12 12Z" fill="#f0e6d2"/>
      <circle cx="82" cy="30" r="22" fill="#fffdf7"/>
      <circle cx="110" cy="20" r="26" fill="#fffdf7"/>
      <circle cx="140" cy="30" r="22" fill="#fffdf7"/>
      <rect x="68" y="42" width="84" height="20" rx="8" fill="#fffdf7"/>
    `, '0 0 220 268', 'art-chef');
  }

  /* ---------- 顾客 / customers ---------- */

  const CUSTOMERS = {
    birdie: { c: '#ffcb3d', d: '#e0a212', shape: 'round', top: 'tuft',    beak: true },
    pip:    { c: '#ff8a5c', d: '#e2653a', shape: 'wide',  top: 'ears' },
    moss:   { c: '#5fbf7d', d: '#3d9a5c', shape: 'round', top: 'leaf' },
    nib:    { c: '#5aa8e8', d: '#3a83c4', shape: 'tall',  top: 'antenna' },
    lulu:   { c: '#f38fc4', d: '#d466a2', shape: 'wide',  top: 'buns' },
    tuk:    { c: '#8b5fe0', d: '#6b41c0', shape: 'tall',  top: 'horns' },
    coco:   { c: '#c98a4b', d: '#8b5a2b', shape: 'round', top: 'ears' },
    zip:    { c: '#4fd0c0', d: '#2fa89a', shape: 'wide',  top: 'crest' },
    plum:   { c: '#e8637f', d: '#c2445d', shape: 'round', top: 'antenna' },
    olly:   { c: '#a8c840', d: '#82a01e', shape: 'tall',  top: 'leaf' },
    bumbo:  { c: '#6f8fe0', d: '#4c6ac0', shape: 'wide',  top: 'horns' },
    sunny:  { c: '#ffa63d', d: '#e07f12', shape: 'round', top: 'crest',   beak: true }
  };

  function customer(id, happy = false, look = [0, 0]) {
    const k = CUSTOMERS[id] || CUSTOMERS.birdie;
    const dims = { round: [56, 56], wide: [64, 48], tall: [46, 62] }[k.shape];
    const [rx, ry] = dims;
    const cy = 116;

    const toppers = {
      tuft: `<path d="M92 ${cy - ry - 4}q6-30 18-34-4 16 4 22 6-18 16-16-8 12-2 26Z" fill="${k.d}"/>`,
      ears: `<path d="${furPath(58, cy - ry + 6, 18, 22, 12)}" fill="${k.c}"/>
             <path d="${furPath(142, cy - ry + 6, 18, 22, 12)}" fill="${k.c}"/>
             <ellipse cx="58" cy="${cy - ry + 8}" rx="8" ry="11" fill="${k.d}" opacity=".55"/>
             <ellipse cx="142" cy="${cy - ry + 8}" rx="8" ry="11" fill="${k.d}" opacity=".55"/>`,
      leaf: `<path d="M100 ${cy - ry - 2}c0-22 14-34 30-36 2 20-10 34-30 36Z" fill="#3d9a5c"/>
             <path d="M100 ${cy - ry - 4}q14-8 26-26" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="3"/>`,
      antenna: `<path d="M100 ${cy - ry}v-26" stroke="${k.d}" stroke-width="6" stroke-linecap="round"/>
                <circle cx="100" cy="${cy - ry - 32}" r="11" fill="#ffd23f"/>`,
      buns: `<circle cx="56" cy="${cy - ry + 10}" r="20" fill="${k.d}"/>
             <circle cx="144" cy="${cy - ry + 10}" r="20" fill="${k.d}"/>`,
      horns: `<path d="M74 ${cy - ry + 6}c-8-16-6-30 2-38 8 10 10 24 6 38Z" fill="${k.d}"/>
              <path d="M126 ${cy - ry + 6}c8-16 6-30-2-38-8 10-10 24-6 38Z" fill="${k.d}"/>`,
      crest: `<path d="M100 ${cy - ry - 6}c-16-4-24-16-22-30 12 2 18 10 22 30Z" fill="${k.d}"/>
              <path d="M100 ${cy - ry - 6}c16-4 24-16 22-30-12 2-18 10-22 30Z" fill="${k.d}"/>
              <path d="M100 ${cy - ry - 10}c0-18 0-28 0-34 6 10 6 24 0 34Z" fill="${k.c}"/>`
    };

    const face = k.beak
      ? `<path d="M100 118l16 10-16 12-16-12Z" fill="#ff9f1c"/>`
      : happy
        ? `<path d="M84 122q16 22 32 0q-4 22-16 22t-16-22Z" fill="#4a2a3a"/>`
        : `<path d="M86 122q14 14 28 0" fill="none" stroke="#4a2a3a" stroke-width="6" stroke-linecap="round"/>`;

    return svg(`
      <ellipse cx="100" cy="188" rx="${rx + 4}" ry="9" fill="rgba(31,74,52,.16)"/>
      ${toppers[k.top] || ''}
      <rect x="${100 - rx * 0.55}" y="164" width="20" height="22" rx="10" fill="${k.d}"/>
      <rect x="${100 + rx * 0.55 - 20}" y="164" width="20" height="22" rx="10" fill="${k.d}"/>
      <path d="${furPath(100, cy, rx, ry, 20)}" fill="${k.c}"/>
      <ellipse cx="100" cy="${cy + 14}" rx="${rx * 0.52}" ry="${ry * 0.42}" fill="#fff" opacity=".28"/>
      <path d="${furPath(100 - rx - 2, cy + 10, 15, 15, 10)}" fill="${k.c}"/>
      <path d="${furPath(100 + rx + 2, cy + 10, 15, 15, 10)}" fill="${k.c}"/>
      ${eyes(100, 96, 17, 40, look, happy)}
      ${face}
    `, '0 0 200 200', 'art-customer');
  }

  /* ---------- 食材 / ingredients ---------- */

  const seeds = n => Array.from({ length: n }, (_, i) => {
    const a = i * 2.4, r = 16 + (i % 3) * 6;
    return `<ellipse cx="${(50 + Math.cos(a) * r).toFixed(1)}" cy="${(64 + Math.sin(a) * r * 0.9).toFixed(1)}"
             rx="3.2" ry="4.4" fill="#ffe07a" transform="rotate(${(a * 30).toFixed(0)} 50 64)"/>`;
  }).join('');

  const ING = {
    banana: `
      <path d="M26 24C28 60 50 80 80 74" fill="none" stroke="#e0a916" stroke-width="28" stroke-linecap="round"/>
      <path d="M26 24C28 60 50 80 80 74" fill="none" stroke="#ffd75e" stroke-width="19" stroke-linecap="round"/>
      <path d="M24 20l-3-10" stroke="#6f5320" stroke-width="8" stroke-linecap="round"/>
      <circle cx="82" cy="73" r="5" fill="#6f5320"/>`,

    strawberry: `
      <path d="M50 94C29 94 17 74 17 57c0-13 15-21 33-21s33 8 33 21c0 17-12 37-33 37Z" fill="#ef4b52"/>
      <path d="M32 46c8-4 22-6 36-2-10 4-24 5-36 2Z" fill="#fff" opacity=".3"/>
      ${seeds(9)}
      <path d="M50 40 32 28l10 14-20 1 18 7Zm0 0 18-12-10 14 20 1-18 7Z" fill="#4fae63"/>
      <path d="M50 38V22" stroke="#3d8a4e" stroke-width="6" stroke-linecap="round"/>`,

    tomato: `
      <circle cx="50" cy="60" r="33" fill="#e8453c"/>
      <path d="M28 44c6-8 16-12 24-12" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".35"/>
      <path d="M50 32 30 20l8 16-20 4 22 6 12-4 12 4 22-6-20-4 8-16Z" fill="#4fae63"/>
      <path d="M50 32V16" stroke="#3d8a4e" stroke-width="7" stroke-linecap="round"/>`,

    carrot: `
      <path d="M50 96 30 46c-3-8 3-14 20-14s23 6 20 14Z" fill="#f4842c"/>
      <path d="M36 56h28M39 68h22M43 80h14" stroke="#d96a15" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 34c-2-14-12-20-22-20 2 12 8 18 22 20Z" fill="#4fae63"/>
      <path d="M50 34c2-14 12-20 22-20-2 12-8 18-22 20Z" fill="#5fc274"/>
      <path d="M50 32V12" stroke="#3d8a4e" stroke-width="6" stroke-linecap="round"/>`,

    blueberry: `
      <circle cx="36" cy="64" r="21" fill="#4a5fc1"/>
      <circle cx="68" cy="58" r="17" fill="#5a72d8"/>
      <circle cx="53" cy="80" r="14" fill="#3d4fa8"/>
      <path d="M36 48l-5-6 7 3 3-7 3 7 7-3-5 6Z" fill="#2f3d85"/>
      <path d="M68 45l-4-5 6 2 2-5 2 5 6-2-4 5Z" fill="#2f3d85"/>
      <circle cx="29" cy="57" r="5" fill="#fff" opacity=".38"/>`,

    milk: `
      <path d="M28 40h44v46a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8Z" fill="#fdfdfd"/>
      <path d="M28 40 50 18l22 22Z" fill="#eef2f6"/>
      <path d="M28 40 50 18v22Z" fill="#dfe7ee"/>
      <rect x="28" y="56" width="44" height="20" fill="#5aa8e8"/>
      <ellipse cx="50" cy="66" rx="11" ry="7" fill="#fff"/>
      <path d="M44 66q6-9 12 0-6 5-12 0Z" fill="#5aa8e8"/>`,

    ice: `
      <path d="M22 40 50 26l28 14v32L50 86 22 72Z" fill="#a8dcf0"/>
      <path d="M22 40 50 54l28-14L50 26Z" fill="#d6f0fa"/>
      <path d="M50 54v32L22 72V40Z" fill="#8ccbe6"/>
      <path d="M30 46l14 7" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`,

    flour: `
      <path d="M30 44h40c4 0 6 3 6 7v34a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V51c0-4 2-7 6-7Z" fill="#eadfc8"/>
      <path d="M34 44c4-10 6-16 16-16s12 6 16 16Z" fill="#dbcdb0"/>
      <rect x="34" y="58" width="32" height="24" rx="5" fill="#fffaf0"/>
      <circle cx="50" cy="70" r="8" fill="none" stroke="#c9a86a" stroke-width="3"/>
      <path d="M45 70h10M50 65v10" stroke="#c9a86a" stroke-width="3" stroke-linecap="round"/>`,

    egg: `
      <path d="M50 92c-16 0-27-11-27-25 0-17 12-39 27-39s27 22 27 39c0 14-11 25-27 25Z" fill="#fffaf0"/>
      <ellipse cx="40" cy="48" rx="8" ry="12" fill="#fff" opacity=".8" transform="rotate(-18 40 48)"/>
      <path d="M28 68c8 4 16 5 24 3" fill="none" stroke="#e6d9c2" stroke-width="4" stroke-linecap="round"/>`,

    cheese: `
      <path d="M18 74 62 32l24 12v22c0 5-4 8-9 8Z" fill="#ffcf4d"/>
      <path d="M18 74 62 32l24 12Z" fill="#ffe08a"/>
      <circle cx="42" cy="64" r="7" fill="#e8ab1e"/>
      <circle cx="62" cy="58" r="5" fill="#e8ab1e"/>
      <circle cx="70" cy="70" r="4" fill="#e8ab1e"/>`,

    dough: `
      <circle cx="50" cy="62" r="32" fill="#f0dcb8"/>
      <ellipse cx="40" cy="50" rx="12" ry="8" fill="#fff" opacity=".45" transform="rotate(-20 40 50)"/>
      <circle cx="62" cy="72" r="3" fill="#dcc59a"/>
      <circle cx="38" cy="76" r="2.5" fill="#dcc59a"/>
      <circle cx="66" cy="52" r="2.5" fill="#dcc59a"/>`,

    water: `
      <path d="M30 34h40l-5 52a8 8 0 0 1-8 7H43a8 8 0 0 1-8-7Z" fill="#dff0fa" opacity=".85"/>
      <path d="M33 54h34l-3 32a8 8 0 0 1-8 7H44a8 8 0 0 1-8-7Z" fill="#5aa8e8"/>
      <ellipse cx="50" cy="54" rx="17" ry="5" fill="#8ccbe6"/>
      <path d="M30 34h40" stroke="#bcdcee" stroke-width="5" stroke-linecap="round"/>
      <path d="M40 66v14" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>`,

    salt: `
      <path d="M32 44h36v42a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8Z" fill="#fdfdfd"/>
      <path d="M34 44c2-12 6-18 16-18s14 6 16 18Z" fill="#b9c6d2"/>
      <circle cx="44" cy="34" r="2.6" fill="#7a8b99"/>
      <circle cx="56" cy="34" r="2.6" fill="#7a8b99"/>
      <circle cx="50" cy="28" r="2.6" fill="#7a8b99"/>
      <rect x="32" y="60" width="36" height="14" fill="#5aa8e8" opacity=".55"/>`,

    cream: `
      <path d="M26 62h48l-4 26a8 8 0 0 1-8 7H38a8 8 0 0 1-8-7Z" fill="#fff3dc"/>
      <path d="M50 14c10 6 14 12 12 18 8 2 12 8 10 14 6 4 6 12-2 16H30c-8-4-8-12-2-16-2-6 2-12 10-14-2-6 2-12 12-18Z" fill="#fffdf7"/>
      <circle cx="50" cy="20" r="6" fill="#ef4b52"/>`,

    sugar: `
      <rect x="20" y="52" width="30" height="28" rx="5" fill="#fffdf7"/>
      <rect x="50" y="58" width="28" height="22" rx="5" fill="#f2eee2"/>
      <rect x="34" y="30" width="28" height="24" rx="5" fill="#fffdf7"/>
      <path d="M78 30l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#ffd23f"/>
      <path d="M24 60h22M56 66h16M38 36h20" stroke="#e2ddcd" stroke-width="3" stroke-linecap="round"/>`,

    bug: `
      <ellipse cx="50" cy="62" rx="27" ry="24" fill="#5fbf7d"/>
      <path d="M50 38v48" stroke="#3d8a4e" stroke-width="4"/>
      <circle cx="38" cy="56" r="6" fill="#2f6b3d"/>
      <circle cx="62" cy="68" r="5" fill="#2f6b3d"/>
      <circle cx="50" cy="34" r="13" fill="#3d8a4e"/>
      <path d="M44 22l-6-10M56 22l6-10" stroke="#3d8a4e" stroke-width="4" stroke-linecap="round"/>
      <circle cx="38" cy="12" r="4" fill="#3d8a4e"/><circle cx="62" cy="12" r="4" fill="#3d8a4e"/>
      <circle cx="45" cy="32" r="3" fill="#fff"/><circle cx="55" cy="32" r="3" fill="#fff"/>`,

    acorn: `
      <path d="M50 92c-14 0-24-12-24-26 0-8 10-14 24-14s24 6 24 14c0 14-10 26-24 26Z" fill="#c98a4b"/>
      <path d="M24 48c0-9 12-16 26-16s26 7 26 16c0 4-4 6-26 6s-26-2-26-6Z" fill="#8b5a2b"/>
      <path d="M50 32V18" stroke="#6b4420" stroke-width="6" stroke-linecap="round"/>
      <path d="M34 62c4 8 10 12 16 13" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".3"/>`,

    apple: `
      <path d="M50 34c14-8 34-2 34 20 0 20-14 40-24 40-4 0-6-3-10-3s-6 3-10 3c-10 0-24-20-24-40 0-22 20-28 34-20Z" fill="#e8453c"/>
      <path d="M34 46c4-6 10-9 15-9-6 4-11 8-15 16Z" fill="#fff" opacity=".4"/>
      <path d="M50 34V18" stroke="#6b4420" stroke-width="6" stroke-linecap="round"/>
      <path d="M52 26c10-10 20-10 24-8-2 10-12 14-24 12Z" fill="#4fae63"/>`,

    lemon: `
      <ellipse cx="50" cy="60" rx="30" ry="24" fill="#ffd23f"/>
      <path d="M80 60c6 0 8 2 8 4s-4 4-9 3ZM20 60c-6 0-8 2-8 4s4 4 9 3Z" fill="#e8ab1e"/>
      <ellipse cx="40" cy="50" rx="10" ry="6" fill="#fff" opacity=".45" transform="rotate(-18 40 50)"/>
      <path d="M50 36V24" stroke="#6b4420" stroke-width="5" stroke-linecap="round"/>
      <path d="M52 30c8-8 16-8 19-6-2 8-10 11-19 6Z" fill="#4fae63"/>`,

    corn: `
      <path d="M50 94c-14 0-22-16-22-34S36 26 50 26s22 16 22 34-8 34-22 34Z" fill="#ffd23f"/>
      <g fill="#e8ab1e">
        <circle cx="42" cy="44" r="3.4"/><circle cx="58" cy="44" r="3.4"/><circle cx="50" cy="52" r="3.4"/>
        <circle cx="40" cy="60" r="3.4"/><circle cx="60" cy="60" r="3.4"/><circle cx="50" cy="68" r="3.4"/>
        <circle cx="42" cy="78" r="3.4"/><circle cx="58" cy="78" r="3.4"/>
      </g>
      <path d="M28 46c-14-6-20-18-18-28 12 2 20 12 22 26ZM72 46c14-6 20-18 18-28-12 2-20 12-22 26Z" fill="#4fae63"/>`,

    pumpkin: `
      <ellipse cx="50" cy="62" rx="34" ry="28" fill="#f4842c"/>
      <ellipse cx="50" cy="62" rx="14" ry="28" fill="#ff9f4d"/>
      <path d="M28 42c-5 12-5 28 0 40M72 42c5 12 5 28 0 40" fill="none" stroke="#d96a15" stroke-width="3.5"/>
      <path d="M50 36V24" stroke="#4a7c3a" stroke-width="8" stroke-linecap="round"/>
      <path d="M52 28c10-8 18-6 20-4-4 8-12 10-20 4Z" fill="#4fae63"/>`,

    honey: `
      <path d="M28 46h44v40a10 10 0 0 1-10 10H38a10 10 0 0 1-10-10Z" fill="#ffb03a"/>
      <path d="M28 46h44v14H28Z" fill="#ffd23f"/>
      <rect x="24" y="34" width="52" height="14" rx="7" fill="#c98a4b"/>
      <path d="M40 66l5 8 5-8 5 8 5-8" fill="none" stroke="#fff6e6" stroke-width="4" stroke-linecap="round" opacity=".75"/>
      <path d="M62 22l4 7 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1Z" fill="#ffd23f" opacity=".85"/>`,

    mushroom: `
      <path d="M40 60h20v26a10 10 0 0 1-20 0Z" fill="#fff3dc"/>
      <path d="M16 60c0-20 15-34 34-34s34 14 34 34Z" fill="#e8453c"/>
      <circle cx="34" cy="46" r="7" fill="#fff6e6"/>
      <circle cx="58" cy="40" r="5.5" fill="#fff6e6"/>
      <circle cx="68" cy="52" r="4.5" fill="#fff6e6"/>
      <circle cx="46" cy="54" r="4" fill="#fff6e6"/>`,

    grape: `
      <path d="M50 28V16" stroke="#6b4420" stroke-width="5" stroke-linecap="round"/>
      <path d="M52 22c9-8 17-7 20-5-3 8-11 10-20 5Z" fill="#4fae63"/>
      <g fill="#8b5fe0">
        <circle cx="50" cy="38" r="11"/><circle cx="36" cy="52" r="11"/><circle cx="64" cy="52" r="11"/>
        <circle cx="50" cy="60" r="11"/><circle cx="40" cy="74" r="11"/><circle cx="60" cy="74" r="11"/>
      </g>
      <g fill="#a888f0">
        <circle cx="47" cy="35" r="3.5"/><circle cx="33" cy="49" r="3.5"/><circle cx="61" cy="49" r="3.5"/>
      </g>`,

    chocolate: `
      <path d="M24 34h52v52a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8Z" fill="#6b4420"/>
      <path d="M24 34h52v10H24Z" fill="#8b5a2b"/>
      <g stroke="#4a2e16" stroke-width="3">
        <path d="M50 44v50M24 60h52M24 78h52"/>
      </g>
      <path d="M30 48h14v8H30Z" fill="#8b5a2b" opacity=".6"/>`,

    butter: `
      <path d="M22 56 44 40h36v30l-22 16H22Z" fill="#ffd23f"/>
      <path d="M22 56h36v30H22Z" fill="#ffe08a"/>
      <path d="M58 56 80 40v30L58 86Z" fill="#e8ab1e"/>
      <path d="M28 64h20M28 74h14" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".6"/>`,

    peach: `
      <path d="M50 90c-18 0-32-14-32-30 0-14 14-24 32-24s32 10 32 24c0 16-14 30-32 30Z" fill="#ff9f7a"/>
      <path d="M50 36c10 0 20 4 26 12-8 20-16 32-26 42V36Z" fill="#ff8a5c" opacity=".55"/>
      <path d="M50 40c-4 14-4 34 0 48" fill="none" stroke="#e2653a" stroke-width="3" opacity=".6"/>
      <ellipse cx="36" cy="50" rx="9" ry="6" fill="#fff" opacity=".4" transform="rotate(-20 36 50)"/>
      <path d="M52 34c9-9 18-8 21-6-3 9-12 11-21 6Z" fill="#4fae63"/>`
  };

  const ingredient = (id, cls = '') => svg(ING[id] || ING.acorn, '0 0 100 100', `art-ing ${cls}`);

  /* ---------- 成品菜 / finished dishes ---------- */

  const DISH = {
    smoothie: `
      <path d="M32 24h44l-6 62a10 10 0 0 1-10 9H48a10 10 0 0 1-10-9Z" fill="#eaf4fa" opacity=".9"/>
      <path d="M35 40h38l-5 46a10 10 0 0 1-10 9H50a10 10 0 0 1-10-9Z" fill="#ffd75e"/>
      <ellipse cx="54" cy="40" rx="19" ry="6" fill="#ffe89a"/>
      <path d="M66 34l14-22" stroke="#ef4b52" stroke-width="7" stroke-linecap="round"/>
      <circle cx="44" cy="30" r="7" fill="#fff6e6"/>
      <circle cx="60" cy="28" r="5" fill="#fff6e6"/>`,

    pancake: `
      <ellipse cx="50" cy="88" rx="38" ry="9" fill="#fff" opacity=".8"/>
      <ellipse cx="50" cy="80" rx="34" ry="12" fill="#e0a44f"/>
      <ellipse cx="50" cy="66" rx="34" ry="12" fill="#f0bb68"/>
      <ellipse cx="50" cy="52" rx="34" ry="12" fill="#e0a44f"/>
      <path d="M18 50c8 10 14 14 20 22 8-6 14-4 22 2 8-6 14-10 22-4V44c-8-8-56-8-64 6Z" fill="#b5651d" opacity=".55"/>
      <path d="M50 40c-8 0-13-6-13-11 0-6 6-9 13-9s13 3 13 9c0 5-5 11-13 11Z" fill="#ef4b52"/>
      <path d="M50 20l-8-6 4 6-8 1 8 3Z" fill="#4fae63"/>`,

    pizza: `
      <circle cx="50" cy="56" r="38" fill="#e8b96a"/>
      <circle cx="50" cy="56" r="31" fill="#e8453c"/>
      <circle cx="50" cy="56" r="29" fill="#ffcf4d" opacity=".55"/>
      <circle cx="38" cy="46" r="7" fill="#e8453c"/>
      <circle cx="62" cy="44" r="6" fill="#e8453c"/>
      <circle cx="56" cy="68" r="7" fill="#e8453c"/>
      <circle cx="34" cy="66" r="5" fill="#e8453c"/>
      <path d="M46 38q6-4 12 0" stroke="#4fae63" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M40 74q8 4 16 0" stroke="#4fae63" stroke-width="4" stroke-linecap="round" fill="none"/>`,

    soup: `
      <path d="M40 30c-6-7 7-11 0-18M58 32c-6-7 7-11 0-18" fill="none" stroke="#cfe0ea" stroke-width="5" stroke-linecap="round"/>
      <path d="M12 52h76c0 24-17 38-38 38S12 74 12 52Z" fill="#fdfdfd"/>
      <ellipse cx="50" cy="52" rx="38" ry="14" fill="#d1762a"/>
      <ellipse cx="50" cy="53" rx="33" ry="11" fill="#f4842c"/>
      <ellipse cx="41" cy="50" rx="7" ry="3" fill="#ffb36b"/>
      <ellipse cx="61" cy="55" rx="5.5" ry="2.4" fill="#ffb36b"/>
      <ellipse cx="52" cy="57" rx="4" ry="1.8" fill="#ffb36b"/>
      <path d="M8 62h84" stroke="#dfe7ee" stroke-width="7" stroke-linecap="round"/>`,

    icecream: `
      <path d="M34 56h32l-13 38a3 3 0 0 1-6 0Z" fill="#e0a44f"/>
      <path d="M38 64l24-2M40 74l20-2" stroke="#c98a4b" stroke-width="3"/>
      <circle cx="42" cy="48" r="17" fill="#5a72d8"/>
      <circle cx="60" cy="44" r="15" fill="#4a5fc1"/>
      <circle cx="51" cy="28" r="13" fill="#7d92e8"/>
      <circle cx="36" cy="42" r="5" fill="#fff" opacity=".35"/>
      <path d="M51 16l3-8 3 8 8 2-8 3-3 8-3-8-8-3Z" fill="#ffd23f"/>`,

    applepie: `
      <path d="M12 60h76c0 20-16 32-38 32S12 80 12 60Z" fill="#e0a44f"/>
      <path d="M14 56c0-16 16-26 36-26s36 10 36 26Z" fill="#f0bb68"/>
      <g stroke="#c98a4b" stroke-width="5" stroke-linecap="round">
        <path d="M26 44 40 32M38 50 56 30M52 52 70 34M64 54l14-10"/>
      </g>
      <path d="M10 58h80" stroke="#c98a4b" stroke-width="7" stroke-linecap="round"/>
      <path d="M50 26c-6-6 4-10 0-14" fill="none" stroke="#e0d0b8" stroke-width="4" stroke-linecap="round"/>`,

    cornsoup: `
      <path d="M40 30c-6-7 7-11 0-18M58 32c-6-7 7-11 0-18" fill="none" stroke="#cfe0ea" stroke-width="5" stroke-linecap="round"/>
      <path d="M12 52h76c0 24-17 38-38 38S12 74 12 52Z" fill="#fdfdfd"/>
      <ellipse cx="50" cy="52" rx="38" ry="14" fill="#e0a416"/>
      <ellipse cx="50" cy="53" rx="33" ry="11" fill="#ffd23f"/>
      <g fill="#fff6c2">
        <circle cx="40" cy="50" r="3.4"/><circle cx="52" cy="48" r="3"/>
        <circle cx="60" cy="55" r="3.2"/><circle cx="46" cy="56" r="2.8"/>
      </g>
      <path d="M8 62h84" stroke="#dfe7ee" stroke-width="7" stroke-linecap="round"/>`,

    lemonade: `
      <path d="M32 22h44l-6 64a10 10 0 0 1-10 8H48a10 10 0 0 1-10-8Z" fill="#eaf4fa" opacity=".85"/>
      <path d="M35 40h38l-5 46a10 10 0 0 1-10 8H50a10 10 0 0 1-10-8Z" fill="#ffd23f"/>
      <g fill="#fff" opacity=".65">
        <circle cx="46" cy="58" r="4"/><circle cx="60" cy="68" r="3"/><circle cx="52" cy="78" r="3.4"/>
      </g>
      <path d="M64 32l12-20" stroke="#5fbf7d" stroke-width="7" stroke-linecap="round"/>
      <path d="M74 40a13 13 0 1 1 0-1Z" fill="#ffe08a" stroke="#e8ab1e" stroke-width="3"/>`,

    pumpkinpie: `
      <path d="M12 66 50 22l38 44Z" fill="#d96a15"/>
      <path d="M16 64 50 28l34 36Z" fill="#f4842c"/>
      <path d="M24 60 50 34l26 26Z" fill="#ff9f4d"/>
      <path d="M12 66 50 22l38 44Z" fill="none" stroke="#e0a44f" stroke-width="8" stroke-linejoin="round"/>
      <path d="M8 68h84v10a7 7 0 0 1-7 7H15a7 7 0 0 1-7-7Z" fill="#e0a44f"/>
      <path d="M14 74h72" stroke="#c98a4b" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      <g fill="#fffdf7">
        <circle cx="50" cy="30" r="9"/><circle cx="41" cy="35" r="6"/><circle cx="59" cy="35" r="6"/>
      </g>`,

    grapejuice: `
      <path d="M32 24h44l-6 62a10 10 0 0 1-10 9H48a10 10 0 0 1-10-9Z" fill="#eaf4fa" opacity=".85"/>
      <path d="M35 42h38l-5 44a10 10 0 0 1-10 9H50a10 10 0 0 1-10-9Z" fill="#8b5fe0"/>
      <ellipse cx="54" cy="42" rx="19" ry="6" fill="#a888f0"/>
      <path d="M66 34l14-22" stroke="#5fbf7d" stroke-width="7" stroke-linecap="round"/>
      <g fill="#a888f0"><circle cx="46" cy="60" r="4" opacity=".7"/><circle cx="60" cy="72" r="3" opacity=".7"/></g>`,

    mushroompizza: `
      <circle cx="50" cy="56" r="38" fill="#e8b96a"/>
      <circle cx="50" cy="56" r="31" fill="#e8453c"/>
      <circle cx="50" cy="56" r="29" fill="#ffcf4d" opacity=".55"/>
      <g fill="#fff3dc" stroke="#c98a4b" stroke-width="2.5">
        <path d="M32 44c0-6 5-10 11-10s11 4 11 10Zm4 0h14v9a7 7 0 0 1-14 0Z"/>
        <path d="M56 66c0-5 4-9 9-9s9 4 9 9Zm3 0h12v7a6 6 0 0 1-12 0Z"/>
      </g>
      <circle cx="66" cy="42" r="5" fill="#e8453c"/>
      <circle cx="36" cy="70" r="5" fill="#e8453c"/>`,

    peachcake: `
      <path d="M16 56h68v32a9 9 0 0 1-9 9H25a9 9 0 0 1-9-9Z" fill="#f0dcb8"/>
      <path d="M16 64h68v11H16Z" fill="#ff8a5c"/>
      <path d="M16 80h68v6H16Z" fill="#e0c99a"/>
      <path d="M16 56c0-9 15-13 34-13s34 4 34 13Z" fill="#fff3dc"/>
      <g fill="#fffdf7">
        <circle cx="28" cy="50" r="8"/><circle cx="42" cy="45" r="8"/>
        <circle cx="58" cy="45" r="8"/><circle cx="72" cy="50" r="8"/>
      </g>
      <path d="M50 42c-8 0-14-6-14-12s6-9 14-9 14 3 14 9-6 12-14 12Z" fill="#ff9f7a"/>
      <path d="M50 22c5 3 8 8 7 13-4-3-7-8-7-13Z" fill="#ff8a5c"/>
      <path d="M52 21c6-7 13-6 15-5-2 7-9 9-15 5Z" fill="#4fae63"/>`
  };

  const dish = (id, cls = '') => svg(DISH[id] || DISH.smoothie, '0 0 100 100', `art-dish ${cls}`);

  /*
    自由厨房的成品。
    颜色是玩家选的那些食材混出来的，容器按用的厨具走 ——
    所以随便怎么搭都能端出一个像模像样的东西，没有"做错"这回事。
  */
  function creation(color, appliance, toppings = []) {
    const dark = shade(color, -0.22), light = shade(color, 0.2);
    const bits = toppings.slice(0, 3).map((id, i) => `
      <g transform="translate(${30 + i * 20} ${appliance === 'freezer' ? 26 : 40}) scale(.26)">
        ${ING[id] || ''}
      </g>`).join('');

    const body = {
      blender: `
        <path d="M32 22h44l-6 64a10 10 0 0 1-10 8H48a10 10 0 0 1-10-8Z" fill="#eaf4fa" opacity=".85"/>
        <path d="M35 40h38l-5 46a10 10 0 0 1-10 8H50a10 10 0 0 1-10-8Z" fill="${color}"/>
        <ellipse cx="54" cy="40" rx="19" ry="6" fill="${light}"/>
        <path d="M66 32l13-20" stroke="#ef4b52" stroke-width="7" stroke-linecap="round"/>`,
      pot: `
        <path d="M12 52h76c0 24-17 38-38 38S12 74 12 52Z" fill="#fdfdfd"/>
        <ellipse cx="50" cy="52" rx="38" ry="14" fill="${dark}"/>
        <ellipse cx="50" cy="53" rx="33" ry="11" fill="${color}"/>
        <path d="M8 62h84" stroke="#dfe7ee" stroke-width="7" stroke-linecap="round"/>`,
      griddle: `
        <ellipse cx="50" cy="84" rx="38" ry="9" fill="#fff" opacity=".8"/>
        <ellipse cx="50" cy="74" rx="34" ry="12" fill="${dark}"/>
        <ellipse cx="50" cy="62" rx="34" ry="12" fill="${color}"/>
        <ellipse cx="50" cy="50" rx="34" ry="12" fill="${light}"/>`,
      oven: `
        <path d="M12 62h76c0 20-16 32-38 32S12 82 12 62Z" fill="#e0a44f"/>
        <path d="M14 58c0-16 16-26 36-26s36 10 36 26Z" fill="${color}"/>
        <path d="M26 46c8-6 16-9 24-9" stroke="${light}" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M10 60h80" stroke="#c98a4b" stroke-width="7" stroke-linecap="round"/>`,
      freezer: `
        <path d="M34 54h32l-13 38a3 3 0 0 1-6 0Z" fill="#e0a44f"/>
        <path d="M38 62l24-2M40 72l20-2" stroke="#c98a4b" stroke-width="3"/>
        <circle cx="42" cy="48" r="17" fill="${color}"/>
        <circle cx="60" cy="44" r="15" fill="${dark}"/>
        <circle cx="51" cy="28" r="13" fill="${light}"/>`
    }[appliance] || '';

    return svg(body + bits, '0 0 100 100', 'art-dish');
  }

  /* 把一个 #rrggbb 调亮或调暗 */
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const ch = i => {
      const v = (n >> (16 - i * 8)) & 255;
      return Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))));
    };
    return '#' + [0, 1, 2].map(i => ch(i).toString(16).padStart(2, '0')).join('');
  }

  /* 把几种食材的颜色混成一个 */
  function blend(ids) {
    if (!ids.length) return '#e8e2d4';
    let r = 0, g = 0, b = 0;
    ids.forEach(id => {
      const n = parseInt((ING_COLOR[id] || '#cccccc').slice(1), 16);
      r += (n >> 16) & 255; g += (n >> 8) & 255; b += n & 255;
    });
    const k = ids.length;
    return '#' + [r / k, g / k, b / k].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  }


  /* ---------- 厨具 / appliances ---------- */

  const APPLIANCE = {
    blender: `
      <rect x="52" y="150" width="116" height="44" rx="14" fill="#5b6b7c"/>
      <circle cx="140" cy="172" r="11" fill="#ffd23f"/>
      <rect x="66" y="164" width="44" height="8" rx="4" fill="#8b9aa8"/>
      <path d="M64 34h92l-10 116H74Z" fill="#dff0fa" opacity=".55"/>
      <path d="M64 34h92l-3 30H67Z" fill="#fff" opacity=".35"/>
      <rect x="58" y="22" width="104" height="16" rx="8" fill="#8b9aa8"/>
      <path d="M156 44h16a10 10 0 0 1 0 20h-18" fill="none" stroke="#8b9aa8" stroke-width="9" stroke-linecap="round"/>`,

    griddle: `
      <ellipse cx="110" cy="150" rx="86" ry="26" fill="#3d4a56"/>
      <ellipse cx="110" cy="140" rx="86" ry="26" fill="#5b6b7c"/>
      <ellipse cx="110" cy="138" rx="72" ry="19" fill="#2f3a44"/>
      <rect x="184" y="126" width="70" height="18" rx="9" fill="#3d4a56" transform="rotate(-14 184 126)"/>
      <ellipse cx="110" cy="176" rx="70" ry="14" fill="#ff8a5c" opacity=".35"/>`,

    oven: `
      <rect x="24" y="24" width="172" height="164" rx="18" fill="#8b9aa8"/>
      <rect x="24" y="24" width="172" height="34" rx="16" fill="#5b6b7c"/>
      <circle cx="52" cy="41" r="9" fill="#ffd23f"/>
      <circle cx="80" cy="41" r="9" fill="#f4842c"/>
      <rect x="42" y="72" width="136" height="100" rx="14" fill="#2f3a44"/>
      <ellipse cx="110" cy="122" rx="52" ry="40" fill="#ff8a5c" opacity=".55"/>
      <rect x="52" y="150" width="116" height="10" rx="5" fill="#5b6b7c"/>`,

    pot: `
      <path d="M40 66h140l-13 106a20 20 0 0 1-20 18H73a20 20 0 0 1-20-18Z" fill="#8b9aa8"/>
      <path d="M40 66h140l-4 30H44Z" fill="#a8b6c2"/>
      <path d="M32 70h156" stroke="#5b6b7c" stroke-width="14" stroke-linecap="round"/>
      <path d="M28 82a13 13 0 0 1 0-24M192 82a13 13 0 0 0 0-24" fill="none" stroke="#5b6b7c" stroke-width="10" stroke-linecap="round"/>
      <ellipse cx="110" cy="102" rx="58" ry="15" fill="#f4842c"/>
      <ellipse cx="96" cy="99" rx="14" ry="4" fill="#ffb36b"/>`,

    freezer: `
      <rect x="34" y="18" width="152" height="176" rx="16" fill="#dfe7ee"/>
      <rect x="34" y="18" width="152" height="64" rx="16" fill="#eef3f7"/>
      <rect x="46" y="94" width="128" height="88" rx="10" fill="#c9dae6"/>
      <rect x="152" y="40" width="12" height="30" rx="6" fill="#8b9aa8"/>
      <rect x="152" y="112" width="12" height="46" rx="6" fill="#8b9aa8"/>
      <path d="M110 118v46M92 130l36 22M128 130l-36 22" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`
  };

  const appliance = (id) => svg(APPLIANCE[id] || APPLIANCE.pot, '0 0 220 210', 'art-appliance');

  /* ---------- 餐车 / the food truck ---------- */

  function truck() {
    return svg(`
      <ellipse cx="220" cy="222" rx="190" ry="14" fill="rgba(31,74,52,.18)"/>
      <!-- 车厢 -->
      <path d="M60 60h268a18 18 0 0 1 18 18v112H42V78a18 18 0 0 1 18-18Z" fill="#f4842c"/>
      <path d="M42 158h304v32H42Z" fill="#e2653a"/>
      <!-- 车头 -->
      <path d="M346 100h44l38 46v44h-82Z" fill="#ffb03a"/>
      <path d="M356 110h32l26 32h-58Z" fill="#bfe4f5"/>
      <circle cx="420" cy="176" r="9" fill="#fff6e6"/>
      <!-- 服务窗 -->
      <rect x="74" y="82" width="188" height="72" rx="10" fill="#2f3a44"/>
      <rect x="82" y="90" width="172" height="56" rx="6" fill="#bfe4f5"/>
      <rect x="66" y="150" width="204" height="14" rx="7" fill="#fff6e6"/>
      <!-- 遮阳篷 -->
      <g>
        <path d="M62 82h212l-14-30H76Z" fill="#fffdf7"/>
        <path d="M76 52h28l-6 30H62Zm56 0h28l-2 30h-32Zm56 0h28l4 30h-32Zm56 0h26l14 30h-38Z" fill="#ef4b52"/>
      </g>
      <!-- 招牌 -->
      <rect x="96" y="16" width="150" height="36" rx="12" fill="#fff6e6"/>
      <circle cx="122" cy="34" r="11" fill="#8b5fe0"/>
      <path d="M148 26h76M148 42h52" stroke="#8b5fe0" stroke-width="7" stroke-linecap="round" opacity=".7"/>
      <!-- 轮子 -->
      <circle cx="118" cy="192" r="30" fill="#2f3a44"/><circle cx="118" cy="192" r="13" fill="#8b9aa8"/>
      <circle cx="352" cy="192" r="30" fill="#2f3a44"/><circle cx="352" cy="192" r="13" fill="#8b9aa8"/>
    `, '0 0 470 240', 'art-truck');
  }

  /* ---------- 背景 / backdrops ---------- */

  function backdrop(place) {
    const W = 1280, H = 720;
    const wrap = inner => svg(inner, `0 0 ${W} ${H}`, 'art-bg');

    if (place === 'jungle') {
      /* 从顶上垂下来的藤蔓 */
      const vine = (x, len, sway) => `
        <path d="M${x} -10q${sway} ${len * 0.5} 0 ${len}" fill="none" stroke="#2d6647" stroke-width="7"/>
        ${[0.35, 0.6, 0.85].map(f => `
          <ellipse cx="${x + sway * 0.5 * (1 - Math.abs(0.5 - f) * 2)}" cy="${len * f}"
                   rx="17" ry="10" fill="#3f7d5b" transform="rotate(${f * 40 - 20}
                   ${x} ${len * f})"/>`).join('')}`;

      return wrap(`
        <rect width="${W}" height="${H}" fill="#cfe8dd"/>
        <circle cx="${W / 2}" cy="330" r="320" fill="#dff0e8"/>
        ${leaf(-70, 90, 20, 1.9, '#1f4a34')}
        ${leaf(1180, 60, 150, 1.7, '#1f4a34')}
        ${leaf(-40, 640, -35, 1.7, '#25573d')}
        ${leaf(1240, 690, 200, 1.8, '#25573d')}
        ${vine(240, 200, 40)}${vine(700, 150, -34)}${vine(1050, 240, 30)}
        ${leaf(150, 30, 55, 1.2, '#3f7d5b')}
        ${leaf(1060, 620, 235, 1.3, '#3f7d5b')}
        ${leaf(560, -60, 92, 1.35, '#2d6647')}
        ${leaf(760, 760, 272, 1.25, '#2d6647')}
        ${leaf(330, 700, -70, 1.0, '#59a37c')}
        ${leaf(940, 20, 118, 0.95, '#59a37c')}
        <g opacity=".5">
          ${leaf(300, 300, 12, 0.85, '#a8d6bd')}
          ${leaf(1000, 260, 192, 0.8, '#a8d6bd')}
          ${leaf(520, 470, -14, 0.9, '#a8d6bd')}
          ${leaf(880, 640, 168, 0.85, '#a8d6bd')}
        </g>
        <g fill="#59a37c" opacity=".55">
          <circle cx="180" cy="560" r="9"/><circle cx="212" cy="590" r="6"/>
          <circle cx="1120" cy="120" r="9"/><circle cx="1150" cy="152" r="6"/>
          <circle cx="640" cy="330" r="7"/><circle cx="668" cy="356" r="5"/>
        </g>
        <path d="M0 690q320 26 640 0t640 8v22H0Z" fill="#25573d" opacity=".28"/>`);
    }

    if (place === 'farm') {
      return wrap(`
        <rect width="${W}" height="${H}" fill="#bfe4f5"/>
        <circle cx="150" cy="110" r="62" fill="#ffd23f"/>
        <g fill="#fff" opacity=".9">
          <ellipse cx="420" cy="120" rx="70" ry="30"/><ellipse cx="470" cy="106" rx="46" ry="26"/>
          <ellipse cx="930" cy="86" rx="60" ry="26"/><ellipse cx="980" cy="76" rx="40" ry="22"/>
        </g>
        <path d="M0 330q220-70 440-20t480-30 360 24V720H0Z" fill="#7cc48c"/>
        <path d="M0 430q300-60 640-10t640-30V720H0Z" fill="#5fbf7d"/>
        <g fill="#c98a4b">
          <path d="M980 250h180v130H980Z"/><path d="M970 250l100-64 100 64Z" fill="#b5482f"/>
          <rect x="1046" y="300" width="48" height="80" fill="#8b5a2b"/>
        </g>
        <path d="M0 560q320-40 640 0t640 0V720H0Z" fill="#4aa86b"/>
        <g stroke="#3d8a4e" stroke-width="8" stroke-linecap="round">
          <path d="M120 700v-40M300 712v-44M520 704v-40M760 712v-46M1010 700v-40M1180 710v-42"/>
        </g>`);
    }

    if (place === 'garden') {
      return wrap(`
        <rect width="${W}" height="${H}" fill="#cfeaf7"/>
        <circle cx="1120" cy="120" r="58" fill="#ffd23f"/>
        <g fill="#fff" opacity=".85">
          <ellipse cx="300" cy="110" rx="66" ry="28"/><ellipse cx="352" cy="98" rx="42" ry="24"/>
        </g>
        <path d="M0 300q320-50 640 0t640-10V720H0Z" fill="#7cc48c"/>
        <g fill="#c98a4b">
          <rect x="0" y="286" width="1280" height="16" rx="8"/>
          ${[60, 260, 460, 660, 860, 1060, 1240].map(x =>
            `<rect x="${x}" y="250" width="20" height="90" rx="10"/>`).join('')}
        </g>
        <path d="M0 420q300-46 640 0t640-20V720H0Z" fill="#5fbf7d"/>
        <g fill="#8b5a2b" opacity=".9">
          <path d="M-20 620q320-60 660 0t660-10v120H-20Z"/>
        </g>
        <g fill="#4aa86b">
          ${[80, 240, 400, 560, 720, 880, 1040, 1200].map(x =>
            `<path d="M${x} 660c-26-4-40-22-38-44 22-2 36 14 38 44Zm0 0c26-4 40-22 38-44-22-2-36 14-38 44Z"/>`).join('')}
        </g>`);
    }

    if (place === 'orchard') {
      const fruitTree = (x, y, s, fruit) => `
        <g transform="translate(${x} ${y}) scale(${s})">
          <rect x="-14" y="-10" width="28" height="120" rx="12" fill="#8b5a2b"/>
          <path d="M0 20c-20 0-34-14-34-30" fill="none" stroke="#8b5a2b" stroke-width="12" stroke-linecap="round"/>
          <circle cx="0" cy="-46" r="72" fill="#3f7d5b"/>
          <circle cx="-52" cy="-8" r="46" fill="#4aa86b"/>
          <circle cx="52" cy="-8" r="46" fill="#4aa86b"/>
          <g fill="${fruit}">
            <circle cx="-40" cy="-30" r="11"/><circle cx="18" cy="-64" r="11"/>
            <circle cx="48" cy="-18" r="11"/><circle cx="-14" cy="-6" r="11"/>
            <circle cx="26" cy="-14" r="11"/>
          </g>
        </g>`;
      return wrap(`
        <rect width="${W}" height="${H}" fill="#cfeaf7"/>
        <circle cx="180" cy="110" r="60" fill="#ffd23f"/>
        <g fill="#fff" opacity=".9">
          <ellipse cx="640" cy="100" rx="72" ry="28"/><ellipse cx="694" cy="88" rx="46" ry="24"/>
          <ellipse cx="1080" cy="140" rx="58" ry="24"/>
        </g>
        <path d="M0 340q320-60 640 0t640-20V720H0Z" fill="#7cc48c"/>
        ${fruitTree(150, 250, 0.95, '#e8453c')}
        ${fruitTree(1130, 240, 1.0, '#ffd23f')}
        ${fruitTree(640, 210, 0.8, '#8b5fe0')}
        <path d="M0 470q300-50 640 0t640-20V720H0Z" fill="#5fbf7d"/>
        ${fruitTree(400, 470, 0.6, '#ff9f7a')}
        ${fruitTree(880, 480, 0.6, '#e8453c')}
        <path d="M0 610q320-40 640 0t640-16V720H0Z" fill="#4aa86b"/>
        <g fill="#3d8a4e" opacity=".45">
          ${[120, 420, 720, 1020, 1240].map(x => `<ellipse cx="${x}" cy="690" rx="80" ry="15"/>`).join('')}
        </g>`);
    }

    if (place === 'field') {
      /* 一株玉米：细长的秆 + 几片弯垂的叶子 + 一根结在半腰的棒子 */
      const stalk = (x, y, sc, flip = 1) => `
        <g transform="translate(${x} ${y}) scale(${sc * flip} ${sc})">
          <path d="M0 0C-4-50-2-90 2-132" fill="none" stroke="#7fa02e" stroke-width="9" stroke-linecap="round"/>
          <path d="M0 -34c-34-2-52-22-58-42 26-2 46 14 58 42Z" fill="#8fb02e"/>
          <path d="M1 -64c34-2 52-22 58-42-26-2-46 14-58 42Z" fill="#a8c840"/>
          <path d="M1 -92c-28-2-42-18-47-34 21-2 38 12 47 34Z" fill="#a8c840"/>
          <!--
            顶上只给穗子，不画玉米棒 —— 背景里要是也挂着黄澄澄的棒子，
            小朋友会去点背景，点了没反应就以为游戏坏了。
            能采的那些一眼就得是唯一像"玉米"的东西。
          -->
          <g transform="translate(2 -132)">
            <path d="M0 0c-10-14-14-26-12-36 9 6 13 20 12 36Z" fill="#c2d94e"/>
            <path d="M0 0c10-14 14-26 12-36-9 6-13 20-12 36Z" fill="#c2d94e"/>
            <path d="M0 -2c0-16 1-26 3-34 3 12 2 24-3 34Z" fill="#d8e87a"/>
          </g>
        </g>`;

      return wrap(`
        <rect width="${W}" height="${H}" fill="#bfe4f5"/>
        <circle cx="1090" cy="118" r="66" fill="#ffd23f"/>
        <g fill="#fff" opacity=".92">
          <ellipse cx="240" cy="120" rx="80" ry="32"/><ellipse cx="300" cy="104" rx="52" ry="28"/>
          <ellipse cx="700" cy="92" rx="60" ry="26"/><ellipse cx="748" cy="82" rx="40" ry="20"/>
        </g>
        <path d="M0 300q220-42 440-12t400-20 440 16V720H0Z" fill="#a8c840"/>
        ${[[110, 470, .72], [300, 452, .66], [520, 476, .7], [760, 452, .64], [980, 474, .7], [1190, 456, .66]]
          .map(([x, y, sc], i) => stalk(x, y, sc, i % 2 ? -1 : 1)).join('')}
        <path d="M0 470q300-46 640 0t640-22V720H0Z" fill="#c2d94e"/>
        ${[[60, 700, 1], [280, 712, .92], [520, 704, 1.05], [780, 714, .95], [1030, 702, 1], [1240, 710, .9]]
          .map(([x, y, sc], i) => stalk(x, y, sc, i % 2 ? -1 : 1)).join('')}
        <path d="M0 626q320-30 640 0t640-12V720H0Z" fill="#8fb02e"/>
        <g stroke="#6d8a1e" stroke-width="7" stroke-linecap="round" opacity=".7">
          <path d="M150 712v-32M400 716v-28M660 710v-34M910 716v-28M1150 712v-32"/>
        </g>`);
    }

    /* forest —— 莓果树林 */
    const pine = (x, y, sc, c1, c2) => `
      <g transform="translate(${x} ${y}) scale(${sc})">
        <rect x="-11" y="-16" width="22" height="52" rx="9" fill="#8b5a2b"/>
        <path d="M0 -150 58 -66H-58Z" fill="${c1}"/>
        <path d="M0 -112 66 -20H-66Z" fill="${c2}"/>
        <path d="M0 -70 74 24H-74Z" fill="${c1}"/>
      </g>`;
    const round3 = (x, y, sc, c1, c2) => `
      <g transform="translate(${x} ${y}) scale(${sc})">
        <rect x="-13" y="-40" width="26" height="66" rx="11" fill="#8b5a2b"/>
        <circle cx="0" cy="-92" r="54" fill="${c1}"/>
        <circle cx="-42" cy="-52" r="40" fill="${c2}"/>
        <circle cx="42" cy="-52" r="40" fill="${c2}"/>
        <circle cx="0" cy="-44" r="34" fill="${c1}"/>
      </g>`;

    return wrap(`
      <rect width="${W}" height="${H}" fill="#dff0f2"/>
      <circle cx="${W / 2}" cy="300" r="300" fill="#eaf6f6"/>
      <g fill="#fff" opacity=".8">
        <ellipse cx="300" cy="110" rx="70" ry="26"/><ellipse cx="352" cy="98" rx="44" ry="22"/>
        <ellipse cx="960" cy="96" rx="56" ry="22"/>
      </g>
      <!-- 远处一排小树，只做轮廓 -->
      <path d="M0 330q320-34 640 0t640-18V720H0Z" fill="#b6d8cd"/>
      <g opacity=".85">
        ${[60, 190, 330, 470, 950, 1090, 1220].map((x, i) =>
          pine(x, 340, 0.42 + (i % 3) * 0.05, '#8fc0b0', '#a2ccbd')).join('')}
      </g>
      <!-- 中景：主要的树，树干踩在这条地平线上 -->
      <path d="M0 430q300-40 640 0t640-20V720H0Z" fill="#79b394"/>
      ${pine(120, 470, 0.72, '#3f7d5b', '#4f8f6a')}
      ${round3(300, 470, 0.62, '#4aa86b', '#59b878')}
      ${pine(1160, 470, 0.78, '#3f7d5b', '#4f8f6a')}
      ${round3(985, 468, 0.58, '#4aa86b', '#59b878')}
      <!-- 前景 -->
      <path d="M0 560q320-40 640 0t640-18V720H0Z" fill="#5fa87c"/>
      <path d="M0 650q300-30 640 0t640-14V720H0Z" fill="#4e9a6e"/>
      <g fill="#3f7d5b" opacity=".55">
        ${[80, 360, 660, 940, 1210].map(x =>
          `<g transform="translate(${x} 690)">
             <circle cx="0" cy="0" r="30"/><circle cx="-24" cy="12" r="22"/><circle cx="24" cy="12" r="22"/>
           </g>`).join('')}
      </g>
      <g fill="#8b5fe0" opacity=".75">
        <circle cx="352" cy="682" r="6"/><circle cx="368" cy="694" r="5"/>
        <circle cx="944" cy="686" r="6"/><circle cx="962" cy="696" r="5"/>
      </g>`);
  }

  /* 街道背景：点单和上菜的场景 */
  function street() {
    return svg(`
      <rect width="1280" height="720" fill="#bfe4f5"/>
      <circle cx="1090" cy="110" r="66" fill="#ffd23f"/>
      <g fill="#fff" opacity=".9">
        <ellipse cx="250" cy="120" rx="76" ry="30"/><ellipse cx="308" cy="106" rx="48" ry="26"/>
        <ellipse cx="840" cy="90" rx="58" ry="24"/>
      </g>
      <g>
        <rect x="40" y="200" width="200" height="300" rx="14" fill="#f4b6a0"/>
        <rect x="270" y="150" width="170" height="350" rx="14" fill="#a9d4ef"/>
        <rect x="470" y="230" width="190" height="270" rx="14" fill="#ffd9a0"/>
        <rect x="690" y="170" width="180" height="330" rx="14" fill="#c9bff0"/>
        <rect x="900" y="240" width="200" height="260" rx="14" fill="#a8e0c0"/>
        <rect x="1130" y="190" width="150" height="310" rx="14" fill="#f4b6a0"/>
        <g fill="#fff6e6" opacity=".85">
          ${[[70, 240], [140, 240], [70, 330], [140, 330], [300, 200], [370, 200], [300, 290], [370, 290],
             [500, 270], [570, 270], [500, 360], [570, 360], [720, 220], [790, 220], [720, 310], [790, 310],
             [930, 280], [1000, 280], [1160, 240], [1230, 240]]
            .map(([x, y]) => `<rect x="${x}" y="${y}" width="48" height="56" rx="8"/>`).join('')}
        </g>
      </g>
      <g fill="#3f7d5b">
        <circle cx="800" cy="438" r="48"/><circle cx="766" cy="468" r="34"/><circle cx="834" cy="468" r="34"/>
        <rect x="788" y="470" width="24" height="52" fill="#8b5a2b"/>
      </g>
      <rect y="500" width="1280" height="220" fill="#cfd8de"/>
      <rect y="500" width="1280" height="16" fill="#b8c4cc"/>
      <rect y="586" width="1280" height="134" fill="#5b6b7c"/>
      <g fill="#fff6e6" opacity=".8">
        ${[60, 260, 460, 660, 860, 1060].map(x =>
          `<rect x="${x}" y="646" width="90" height="12" rx="6"/>`).join('')}
      </g>
    `, '0 0 1280 720', 'art-bg');
  }

  /*
    行驶时的路面。整张图会左右平铺两份循环滚动，
    所以里面的东西都要能首尾接得上：路面虚线均匀分布，云和树各来一组。
  */
  function road() {
    const bush = (x, y, s) => `
      <g transform="translate(${x} ${y}) scale(${s})">
        <circle cx="0" cy="0" r="34" fill="#3f7d5b"/>
        <circle cx="-26" cy="12" r="24" fill="#4aa86b"/>
        <circle cx="26" cy="12" r="24" fill="#4aa86b"/>
      </g>`;
    const tree = (x, y, s) => `
      <g transform="translate(${x} ${y}) scale(${s})">
        <rect x="-9" y="-10" width="18" height="60" rx="7" fill="#8b5a2b"/>
        <circle cx="0" cy="-30" r="44" fill="#3f7d5b"/>
        <circle cx="-32" cy="-4" r="30" fill="#4aa86b"/>
        <circle cx="32" cy="-4" r="30" fill="#4aa86b"/>
      </g>`;
    const cloud = (x, y, s) => `
      <g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".92">
        <ellipse cx="0" cy="0" rx="66" ry="27"/><ellipse cx="44" cy="-12" rx="42" ry="23"/>
        <ellipse cx="-40" cy="-6" rx="34" ry="19"/>
      </g>`;

    return svg(`
      <rect width="1280" height="720" fill="#bfe4f5"/>
      ${cloud(190, 120, 1)}${cloud(700, 86, .8)}${cloud(1080, 150, .9)}
      <path d="M0 380q160-90 320 0t320 0 320 0 320 0V720H0Z" fill="#7cc48c"/>
      ${tree(120, 430, 1)}${tree(640, 430, .9)}${tree(1010, 420, 1.05)}
      <path d="M0 470q200-60 400 0t480 0 400 0V720H0Z" fill="#5fbf7d"/>
      ${bush(300, 500, 1)}${bush(560, 512, .85)}${bush(880, 502, 1)}${bush(1180, 510, .9)}
      <rect y="540" width="1280" height="180" fill="#5b6b7c"/>
      <rect y="540" width="1280" height="12" fill="#6f7f90"/>
      <g fill="#fff6e6" opacity=".75">
        ${Array.from({ length: 8 }, (_, i) =>
          `<rect x="${i * 160 + 30}" y="646" width="94" height="13" rx="6"/>`).join('')}
      </g>
    `, '0 0 1280 720', 'art-bg');
  }

  /* 餐车里的小厨房：烹饪场景的背景 */
  function kitchen() {
    const jar = (x, y, c) => `
      <rect x="${x}" y="${y}" width="46" height="58" rx="10" fill="${c}"/>
      <rect x="${x + 4}" y="${y + 18}" width="38" height="36" rx="6" fill="#fff" opacity=".3"/>
      <rect x="${x - 3}" y="${y - 10}" width="52" height="14" rx="7" fill="#8b5a2b"/>`;
    return svg(`
      <rect width="1280" height="720" fill="#ffe9c9"/>
      <rect width="1280" height="440" fill="#ffdca8"/>
      <g opacity=".5" fill="#f4c98a">
        ${Array.from({ length: 16 }, (_, i) =>
          `<rect x="${i * 80}" y="0" width="38" height="440"/>`).join('')}
      </g>
      <!--
        窗户放在右上角。以前它横跨 x820-1200，正好和灶台上的锅、烤箱撞在一起，
        锅的把手看着像窗框的一部分。器具占到 x980，所以窗户从 1000 起。
      -->
      <rect x="1000" y="56" width="250" height="196" rx="16" fill="#2f3a44"/>
      <rect x="1012" y="68" width="226" height="172" rx="10" fill="#bfe4f5"/>
      <circle cx="1186" cy="112" r="28" fill="#ffd23f"/>
      <path d="M1012 196q58-32 113 0t113-16v60h-226Z" fill="#7cc48c"/>
      <rect x="1118" y="68" width="12" height="172" fill="#2f3a44"/>
      <rect x="1012" y="148" width="226" height="12" fill="#2f3a44"/>
      <!-- 挂架 -->
      <rect x="80" y="96" width="560" height="14" rx="7" fill="#8b5a2b"/>
      ${jar(120, 130, '#ef4b52')}${jar(200, 130, '#5fbf7d')}${jar(280, 130, '#5aa8e8')}${jar(360, 130, '#ffd23f')}
      <g stroke="#5b6b7c" stroke-width="6" fill="none">
        <path d="M470 110v34"/><path d="M540 110v26"/>
      </g>
      <ellipse cx="470" cy="164" rx="30" ry="22" fill="#5b6b7c"/>
      <path d="M500 150h44" stroke="#5b6b7c" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="540" cy="152" rx="22" ry="16" fill="#8b9aa8"/>
      <!-- 窗户左边那片墙原本空着，挂一排香草和小铲子填一填 -->
      <rect x="700" y="120" width="250" height="12" rx="6" fill="#8b5a2b"/>
      <g stroke="#5b6b7c" stroke-width="5" fill="none">
        <path d="M742 132v26"/><path d="M800 132v20"/>
      </g>
      <ellipse cx="742" cy="172" rx="20" ry="15" fill="#8b9aa8"/>
      <path d="M800 152h30" stroke="#5b6b7c" stroke-width="8" stroke-linecap="round"/>
      <path d="M828 140h26a10 10 0 0 1 0 24h-26Z" fill="#8b9aa8"/>
      <g transform="translate(898 132)">
        <path d="M0 0v58" stroke="#6b4420" stroke-width="5"/>
        <path d="M0 14c-16 2-26 14-28 26 14 0 26-10 28-26Z" fill="#4aa86b"/>
        <path d="M0 30c16 2 26 14 28 26-14 0-26-10-28-26Z" fill="#5fbf7d"/>
        <path d="M0 42c-13 2-21 12-23 22 12 0 21-8 23-22Z" fill="#4aa86b"/>
      </g>

      <!-- 台面 -->
      <rect y="440" width="1280" height="34" fill="#e0a44f"/>
      <rect y="466" width="1280" height="254" fill="#c98a4b"/>
      <g opacity=".45" fill="#b5773a">
        ${Array.from({ length: 9 }, (_, i) =>
          `<rect x="${i * 150 + 20}" y="480" width="112" height="230" rx="10"/>`).join('')}
      </g>
    `, '0 0 1280 720', 'art-bg');
  }

  /* 记忆配对的卡背 —— 用围裙上那个圈作图案，和主厨是一套 */
  const cardBack = () => svg(`
    <rect width="100" height="100" rx="16" fill="#8b5fe0"/>
    <rect x="7" y="7" width="86" height="86" rx="11" fill="#a888f0"/>
    <circle cx="50" cy="50" r="24" fill="none" stroke="#fff6e6" stroke-width="7"/>
    <path d="M50 34v32M34 50h32" stroke="#fff6e6" stroke-width="7" stroke-linecap="round"/>
    <g fill="#fff6e6" opacity=".5">
      <circle cx="19" cy="19" r="5"/><circle cx="81" cy="19" r="5"/>
      <circle cx="19" cy="81" r="5"/><circle cx="81" cy="81" r="5"/>
    </g>
  `, '0 0 100 100', 'art-card');

  /* 分类游戏的两个筐，颜色和标签都不一样，一眼能分清 */
  const crate = (kind) => {
    const k = kind === 'fruit'
      ? { body: '#ef4b52', dark: '#c93b42' }
      : { body: '#4aa86b', dark: '#3a8f58' };
    const mark = kind === 'fruit'
      ? `<circle cx="60" cy="36" r="19" fill="#ffd23f"/>
         <path d="M60 17c9-9 19-8 22-6-3 9-13 11-22 6Z" fill="#4fae63"/>`
      : `<path d="M60 58 44 20c-3-7 3-12 16-12s19 5 16 12Z" fill="#f4842c"/>
         <path d="M60 10c-3-11-11-16-19-16 2 10 7 15 19 16Z" fill="#3d8a4e"/>`;
    return svg(`
      ${mark}
      <path d="M14 66h92l-11 54a14 14 0 0 1-14 11H39a14 14 0 0 1-14-11Z" fill="${k.body}"/>
      <path d="M14 66h92l-3 15H17Z" fill="${k.dark}"/>
      <path d="M8 70h104" stroke="${k.dark}" stroke-width="12" stroke-linecap="round"/>
      <g stroke="${k.dark}" stroke-width="4" opacity=".55">
        <path d="M36 84l5 44M60 84v46M84 84l-5 44"/>
      </g>
    `, '0 0 120 140', 'art-crate');
  };

  /* 篮子：采集场景里装战利品 */
  const basket = () => svg(`
    <path d="M10 30h100l-12 56a14 14 0 0 1-14 12H36a14 14 0 0 1-14-12Z" fill="#c98a4b"/>
    <path d="M10 30h100l-3 16H13Z" fill="#e0a44f"/>
    <path d="M30 30a30 30 0 0 1 60 0" fill="none" stroke="#8b5a2b" stroke-width="8" stroke-linecap="round"/>
    <path d="M32 52l6 44M60 52v46M88 52l-6 44" stroke="#8b5a2b" stroke-width="4" opacity=".5"/>
  `, '0 0 120 110', 'art-basket');

  /* 五角星，用于奖励 */
  const star = (fill = '#ffd23f') =>
    svg(`<path d="M50 6 62 38l34 3-26 23 8 34-28-18-28 18 8-34L4 41l34-3Z" fill="${fill}"/>`,
      '0 0 100 100', 'art-star');

  return { svg, chef, customer, ingredient, dish, creation, blend, appliance, truck,
           backdrop, street, road, kitchen, basket, cardBack, crate, star, leaf };
})();
