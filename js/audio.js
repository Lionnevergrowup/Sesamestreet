/* ------------------------------------------------------------------
   audio.js — 声音全部用 WebAudio 现场合成，不依赖任何音频文件。
   All audio is synthesised with WebAudio — no asset files, works offline.

   分两条线：
     sfx   —— 摘菜、下锅、过关这些即时反馈
     music —— 一直在底下走的四小节循环，让画面不至于死气沉沉
   两条线汇到一个压缩器再出去，音量拉高也不会破音。
------------------------------------------------------------------ */

const Sound = (() => {
  let ctx = null, master = null, sfxBus = null, musicBus = null;
  let enabled = Store.get('gulu.sound') !== 'off';

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }

      /* 压缩器兜底：同时响好几个音也不会削顶 */
      master = ctx.createDynamicsCompressor();
      master.threshold.value = -14;
      master.ratio.value = 12;
      master.attack.value = 0.003;
      master.release.value = 0.2;
      master.connect(ctx.destination);

      sfxBus = ctx.createGain();
      sfxBus.gain.value = 0.9;
      sfxBus.connect(master);

      musicBus = ctx.createGain();
      musicBus.gain.value = 0.34;      // 音乐要垫在底下，别盖住音效
      musicBus.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  /* 一个音符。when 给绝对时间（音乐用），不给就是"马上"（音效用）。 */
  function note(freq, {
    type = 'sine', when = null, at = 0, dur = 0.22, gain = 0.5,
    attack = 0.008, glide = 0, bus = null
  } = {}) {
    if (!enabled || !ensure()) return;
    const t = when !== null ? when : ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * glide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(bus || sfxBus);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /* 噪声脉冲：沙沙声、嘶嘶声、鼓点 */
  function noise({ when = null, at = 0, dur = 0.3, gain = 0.2, freq = 1200, q = 1, bus = null } = {}) {
    if (!enabled || !ensure()) return;
    const t = when !== null ? when : ctx.currentTime + at;
    const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(bus || sfxBus);
    src.start(t);
    src.stop(t + dur);
  }

  /* C 大调五声音阶，怎么弹都好听 */
  const SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
  const PICK  = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];

  /* ---------------- 背景音乐 ----------------
     四小节循环，I–vi–IV–V。旋律是写死的一句，
     不是随机音符，所以听多久都不会跑调或变吵。 */
  const CHORDS = [
    { root: 130.81, pad: [261.63, 329.63, 392.00] },   // C
    { root: 110.00, pad: [261.63, 329.63, 440.00] },   // Am
    { root: 174.61, pad: [261.63, 349.23, 440.00] },   // F
    { root: 196.00, pad: [293.66, 392.00, 493.88] }    // G
  ];
  const MELODY = [
    [5, null, 4, null, 3, 4, 5, null],
    [4, null, 3, null, 2, 3, 4, null],
    [3, null, 4, null, 5, 4, 3, null],
    [2, 3, 4, null, 5, null, null, null]
  ];
  const BPM = 104;

  let musicTimer = null, nextTime = 0, stepIx = 0, musicWanted = false;

  function scheduleAhead() {
    if (!ctx) return;
    const eighth = (60 / BPM) / 2;
    while (nextTime < ctx.currentTime + 0.25) {
      const bar = Math.floor(stepIx / 8) % 4;
      const pos = stepIx % 8;
      const ch = CHORDS[bar];

      if (pos === 0 || pos === 4)                       // 低音
        note(ch.root, { type: 'sine', when: nextTime, dur: eighth * 1.9, gain: 0.55, bus: musicBus });
      if (pos === 0)                                    // 和弦垫
        ch.pad.forEach(f => note(f, { type: 'triangle', when: nextTime, dur: eighth * 3.4, gain: 0.13, bus: musicBus }));
      const m = MELODY[bar][pos];                       // 旋律
      if (m !== null)
        note(SCALE[m], { type: 'triangle', when: nextTime, dur: eighth * 1.7, gain: 0.3, bus: musicBus });
      if (pos % 2 === 1)                                // 轻轻的节拍
        noise({ when: nextTime, dur: 0.045, gain: 0.06, freq: 6500, q: 1.6, bus: musicBus });

      nextTime += eighth;
      stepIx++;
    }
  }

  function startMusic() {
    musicWanted = true;
    if (!enabled || musicTimer || !ensure()) return;
    nextTime = ctx.currentTime + 0.12;
    scheduleAhead();
    musicTimer = setInterval(scheduleAhead, 60);
  }

  function stopMusic() {
    clearInterval(musicTimer);
    musicTimer = null;
  }

  return {
    get enabled() { return enabled; },

    toggle() {
      enabled = !enabled;
      Store.set('gulu.sound', enabled ? 'on' : 'off');
      if (enabled) { ensure(); this.tap(); if (musicWanted) startMusic(); }
      else stopMusic();
      return enabled;
    },

    /* 浏览器要求首次交互后才能出声 */
    unlock() { ensure(); startMusic(); },

    /* 声音是不是真的跑起来了 —— 解锁那边靠这个判断要不要再试 */
    get running() { return !!ctx && ctx.state === 'running'; },

    music(on) { on ? startMusic() : (musicWanted = false, stopMusic()); },

    tap() {
      note(660, { type: 'triangle', dur: 0.1, gain: 0.5 });
      note(990, { type: 'sine', at: 0.02, dur: 0.08, gain: 0.2 });
    },

    /* 摘到一个，音高随篮子里的数量往上走 */
    pick(index = 0) {
      const f = PICK[Math.min(index, PICK.length - 1)];
      note(f, { type: 'triangle', dur: 0.2, gain: 0.6 });
      note(f * 2, { type: 'sine', at: 0.02, dur: 0.16, gain: 0.24 });
      noise({ dur: 0.09, gain: 0.12, freq: 3200, q: 2 });
    },

    /* 摘错了 —— 不刺耳，只是"咦？" */
    oops() {
      note(330, { type: 'sine', dur: 0.18, gain: 0.5, glide: 0.75 });
      note(247, { type: 'sine', at: 0.11, dur: 0.2, gain: 0.36 });
    },

    whoosh() { noise({ dur: 0.26, gain: 0.16, freq: 900, q: 0.7 }); },

    /* 食材掉进锅里 */
    plop() {
      note(430, { type: 'sine', dur: 0.18, gain: 0.62, glide: 0.5 });
      noise({ at: 0.02, dur: 0.13, gain: 0.14, freq: 520 });
    },

    /* 搅拌 / 煎 / 烤 的循环声 */
    cookStep(i = 0) {
      noise({ dur: 0.17, gain: 0.2, freq: 700 + i * 130, q: 2 });
      note(180 + i * 26, { type: 'sawtooth', dur: 0.15, gain: 0.2 });
    },

    /* 菜做好了 */
    ding() {
      note(1046.5, { type: 'sine', dur: 0.55, gain: 0.6 });
      note(1567.98, { type: 'sine', at: 0.06, dur: 0.5, gain: 0.3 });
      note(2093, { type: 'sine', at: 0.12, dur: 0.4, gain: 0.14 });
    },

    /* 顾客吃得很开心 */
    yum() {
      [392, 523.25, 659.25].forEach((f, i) =>
        note(f, { type: 'triangle', at: i * 0.12, dur: 0.24, gain: 0.55 }));
      note(783.99, { at: 0.36, dur: 0.4, gain: 0.4, type: 'sine' });
    },

    /* 过关小号角 */
    fanfare() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        note(f, { type: 'triangle', at: i * 0.11, dur: 0.32, gain: 0.6 });
        note(f * 1.5, { type: 'sine', at: i * 0.11 + 0.01, dur: 0.28, gain: 0.22 });
      });
      note(1046.5, { type: 'triangle', at: 0.5, dur: 0.7, gain: 0.6 });
      note(1567.98, { type: 'sine', at: 0.5, dur: 0.7, gain: 0.28 });
    },

    /* 餐车引擎 */
    engine() {
      note(92, { type: 'sawtooth', dur: 0.95, gain: 0.22, glide: 1.25 });
      noise({ dur: 0.95, gain: 0.1, freq: 320, q: 0.6 });
      note(520, { type: 'square', at: 0.05, dur: 0.13, gain: 0.3 });
      note(660, { type: 'square', at: 0.2, dur: 0.15, gain: 0.3 });
    }
  };
})();
