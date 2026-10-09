// Склеивает dist-single/ в один html-файл, который открывается без сервера (file://).
// Модули с диска браузеры не грузят, а встроенный <script type="module"> — пожалуйста.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'dist-single';
const out = process.argv[2] || 'buksuy-play.html';
let html = readFileSync(join(dir, 'index.html'), 'utf8');
const assets = readdirSync(join(dir, 'assets'));

html = html.replace(/<script type="module" crossorigin src="\.\/assets\/([^"]+)"><\/script>/, (_, f) => {
  const js = readFileSync(join(dir, 'assets', f), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">\n${js}\n</script>`;
});
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/assets\/([^"]+)">/, (_, f) => `<style>\n${readFileSync(join(dir, 'assets', f), 'utf8')}\n</style>`);
const icon = readFileSync(join(dir, 'favicon.svg'));
html = html.replace('href="favicon.svg"', `href="data:image/svg+xml;base64,${icon.toString('base64')}"`);

if (/src="\.\/assets|href="\.\/assets/.test(html)) {
  console.error('что-то осталось ссылкой на файл:', assets.join(', '));
  process.exit(1);
}
writeFileSync(out, html);
console.log(`${out}: ${(Buffer.byteLength(html) / 1e6).toFixed(1)} МБ`);
