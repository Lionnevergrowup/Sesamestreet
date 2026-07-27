/* ------------------------------------------------------------------
   store.js — 存进度用的一层薄封装。

   localStorage 并不是随时都能用：隐私模式、嵌在 iframe 里被隔离存储、
   浏览器关掉了站点数据，读一下就会抛异常。游戏为此白屏是不可接受的 ——
   存不了顶多是记不住星星，不该连玩都玩不了。
   所以这里探测一次，不行就退回内存，本次照玩，刷新后忘掉。
------------------------------------------------------------------ */

const Store = (() => {
  const memory = Object.create(null);
  let usable = false;

  try {
    const probe = '__gulu_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    usable = true;
  } catch (e) {
    usable = false;
  }

  return {
    get available() { return usable; },

    get(key, fallback = null) {
      try {
        const v = usable ? window.localStorage.getItem(key) : memory[key];
        return (v === null || v === undefined) ? fallback : v;
      } catch (e) {
        return fallback;
      }
    },

    set(key, value) {
      const v = String(value);
      try {
        if (usable) window.localStorage.setItem(key, v);
        else memory[key] = v;
      } catch (e) {
        memory[key] = v;      // 比如写满了配额，退回内存
      }
    }
  };
})();
