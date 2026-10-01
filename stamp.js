#!/usr/bin/env node
/*
  stamp.js — 把当前提交的信息写进 js/version.js。部署流程在 build.js 之前跑它。

  版本号 = 提交总数（只增不减，一眼看出新旧）+ 短提交号（精确对应到代码）+ 提交日期。
  不手写版本号：手写的迟早会忘了改，那样页面上的数字比没有还糟 —— 它会让人以为在看新版。
  仓库里的 version.js 永远是 dev：一个提交没法把自己的编号写进自己。
*/

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const sh = cmd => execSync(cmd, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();

/*
  浅克隆数出来的提交总数是错的（CI 默认只拉 1 个提交，会得到 1）。
  宁可让发布失败，也不能悄悄发一个写着 v1 的版本。
*/
if (sh('git rev-parse --is-shallow-repository') === 'true') {
  throw new Error('这是浅克隆，提交总数会算错。CI 里 checkout 要加 fetch-depth: 0');
}

const build = Number(sh('git rev-list --count HEAD'));
const sha = sh('git rev-parse --short HEAD');
const date = sh('git log -1 --format=%cs');

if (!Number.isInteger(build) || build < 1) throw new Error(`提交总数不对: ${build}`);
if (!/^[0-9a-f]{7,40}$/.test(sha)) throw new Error(`提交号不对: ${sha}`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`日期不对: ${date}`);

const out = `/*
  版本信息。本地直接打开时显示 dev；
  发布时 stamp.js 会把它改写成真实的提交号，页面右下角就能看到。
*/
const VERSION = ${JSON.stringify({ build, sha, date })};
`;
fs.writeFileSync(path.join(root, 'js/version.js'), out);
console.log(`版本已写入: v${build} · ${sha} · ${date}`);
