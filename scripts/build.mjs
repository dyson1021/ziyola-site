// Builds dist/ for Vercel from the artifact-style index.html (which has no <html>/<head> skeleton).
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';

const src = readFileSync('index.html', 'utf8').replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '');
const end = src.indexOf('</style>') + '</style>'.length;
const head = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="大阪発ラウドロックバンド ZIYOLA（ジオラ）オフィシャルサイト。Vo.MAHO / Gt.将 / Ba.Bucchi">
`;
const html = head + src.slice(0, end) + '\n</head>\n<body>\n' + src.slice(end).replace(/^\n+/, '') + '\n</body>\n</html>\n';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
cpSync('assets', 'dist/assets', { recursive: true });
console.log('dist/ built');
