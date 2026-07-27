/* ------------------------------------------------------------------
   audio.js — 用 WebAudio 现场合成音效，不依赖任何外部文件。
   All sound effects are synthesised with WebAudio — no asset files,
   so the game works offline / straight off the filesystem.
------------------------------------------------------------------ */

const Sound = (() => {
  let ctx = null;
  let master = null;
  let enabled = Store.get('gulu.sound') !== 'off';

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* 一个基础音符：波形 + 音量包络 */
  function note(freq, {
    type = 'sine', at = 0, dur = 0.22, gain = 0.5,
    attack = 0.008, glide = 0, detune = 0
  } = {}) {
    if (!enabled || !ensure()) return;
    const t = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(freq, t);
    if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * glide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /* 噪声脉冲，用来做“沙沙”“嘶嘶”一类的声音 */
  function noise({ at = 0, dur = 0.3, gain = 0.2, freq = 1200, q = 1 } = {}) {
    if (!enabled || !ensure()) return;
    const t = ctx.currentTime + at;
    const frames = Math.floor(ctx.sampleRate * dur);
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
    src.connect(filter).connect(g).connect(master);
    src.start(t);
    src.stop(t + dur);
  }

  /* C 大调五声音阶，怎么弹都好听 —— 适合连续采集时逐级升高 */
  const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];

  return {
    get enabled() { return enabled; },

    toggle() {
      enabled = !enabled;
      Store.set('gulu.sound', enabled ? 'on' : 'off');
      if (enabled) { ensure(); this.tap(); }
      return enabled;
    },

    unlock() { ensure(); },

    /* 按钮轻点 */
    tap() {
      note(660, { type: 'triangle', dur: 0.08, gain: 0.28 });
    },

    /* 摘到一个食材，音高随篮子里的数量往上走 */
    pick(index = 0) {
      const f = SCALE[Math.min(index, SCALE.length - 1)];
      note(f, { type: 'triangle', dur: 0.18, gain: 0.4 });
      note(f * 2, { type: 'sine', at: 0.02, dur: 0.14, gain: 0.14 });
    },

    /* 摘错了 —— 不刺耳，只是“咦？” */
    oops() {
      note(320, { type: 'sine', dur: 0.16, gain: 0.3, glide: 0.75 });
      note(240, { type: 'sine', at: 0.1, dur: 0.18, gain: 0.22 });
    },

    /* 东西飞过去 */
    whoosh() {
      noise({ dur: 0.28, gain: 0.12, freq: 900, q: 0.7 });
    },

    /* 食材掉进锅里 */
    plop() {
      note(420, { type: 'sine', dur: 0.16, gain: 0.4, glide: 0.5 });
      noise({ at: 0.02, dur: 0.12, gain: 0.08, freq: 500 });
    },

    /* 搅拌 / 煎 / 烤 的循环声 */
    cookStep(i = 0) {
      noise({ dur: 0.16, gain: 0.14, freq: 700 + i * 120, q: 2 });
      note(180 + i * 24, { type: 'sawtooth', dur: 0.14, gain: 0.12 });
    },

    /* 菜做好了 */
    ding() {
      note(1046.5, { type: 'sine', dur: 0.5, gain: 0.4 });
      note(1567.98, { type: 'sine', at: 0.06, dur: 0.45, gain: 0.2 });
    },

    /* 顾客吃得很开心 */
    yum() {
      [0, 0.12, 0.24].forEach((t, i) =>
        note([392, 523.25, 659.25][i], { type: 'triangle', at: t, dur: 0.22, gain: 0.35 }));
    },

    /* 过关小号角 */
    fanfare() {
      const seq = [523.25, 659.25, 783.99, 1046.5];
      seq.forEach((f, i) => {
        note(f, { type: 'triangle', at: i * 0.11, dur: 0.3, gain: 0.4 });
        note(f * 1.5, { type: 'sine', at: i * 0.11 + 0.01, dur: 0.26, gain: 0.14 });
      });
      note(1046.5, { type: 'triangle', at: 0.5, dur: 0.6, gain: 0.4 });
    },

    /* 餐车引擎 */
    engine() {
      note(90, { type: 'sawtooth', dur: 0.9, gain: 0.12, glide: 1.25 });
      noise({ dur: 0.9, gain: 0.06, freq: 300, q: 0.6 });
      note(520, { type: 'square', at: 0.05, dur: 0.12, gain: 0.18 });
      note(660, { type: 'square', at: 0.2, dur: 0.14, gain: 0.18 });
    }
  };
})();
