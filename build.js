#!/usr/bin/env node
/*
  build.js — 把游戏打包成一个自给自足的 HTML 文件。

  index.html 是唯一的真相来源：这里只是把它的 <body> 内容取出来，
  再把样式和脚本原样内联进去，所以改源文件不会跟打包结果对不上。

  用法：node build.js  →  生成 play.html
*/

const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const SCRIPTS = ['js/audio.js', 'js/art.js', 'js/recipes.js', 'js/i18n.js', 'js/game.js'];

const html = read('index.html');

const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
if (!bodyMatch) throw new Error('index.html 里找不到 <body>，打包中止');

/* 去掉外链 <script>，稍后换成内联的 */
const markup = bodyMatch[1].replace(/\s*<script src="[^"]*"><\/script>/g, '').trim();

const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
const title = titleMatch ? titleMatch[1].trim() : "Gulu's Foodie Truck";

/* 脚本内容里如果出现 </script> 会提前截断标签，先转义掉 */
const safe = js => js.replace(/<\/script>/gi, '<\\/script>');

/*
  中文必须在任何编码下都能正确显示。
  单文件版本没有自己的 <head>，charset 声明未必轮得到它生效
  （外面套壳时可能已经超出浏览器嗅探编码的前 1024 字节），
  所以干脆把所有非 ASCII 字符转义掉，让整个文件变成纯 ASCII：
  JS 用 \\uXXXX，标记用数字字符引用。这样无论文档被当成什么编码读都不会乱码。
*/
const asciiJS = s => s.replace(/[^\x00-\x7F]/g,
  c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
const asciiHTML = s => s.replace(/[^\x00-\x7F]/gu,
  c => '&#' + c.codePointAt(0) + ';');

const out = `<meta charset="utf-8">
<title>${asciiHTML(title)}</title>

<style>
${read('css/style.css').trim()}
</style>

${asciiHTML(markup)}

${SCRIPTS.map(f => `<script>\n${asciiJS(safe(read(f).trim()))}\n</script>`).join('\n\n')}
`;

if (/[^\x00-\x7F]/.test(out.slice(out.indexOf('</style>')))) {
  throw new Error('打包结果里还有非 ASCII 字符，编码可能出问题');
}

fs.writeFileSync(path.join(root, 'play.html'), out);

const kb = (Buffer.byteLength(out) / 1024).toFixed(1);
console.log(`play.html 已生成 — ${kb} KB，${SCRIPTS.length + 1} 个源文件内联，零外部请求`);
