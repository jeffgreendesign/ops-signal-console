import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['src', 'tests', 'docs', 'README.md', 'AGENTS.md'];
const bannedSourceApis = ['fetch(', 'XMLHttpRequest', 'localStorage', 'sessionStorage', 'indexedDB', 'sendBeacon'];

function collect(path) {
  if (!existsSync(path)) return [];

  const stat = statSync(path);
  if (stat.isDirectory()) return readdirSync(path).flatMap((entry) => collect(join(path, entry)));
  return /\.(ts|tsx|js|mjs|md|html|css|json)$/.test(path) ? [path] : [];
}

const files = roots.flatMap((root) => collect(root));
const findings = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (file.startsWith('src/')) {
    for (const api of bannedSourceApis) {
      if (text.includes(api)) findings.push(`${file}: banned source API ${api}`);
    }
  }
}

if (findings.length) {
  console.error('Public-safety scan findings:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Public-safety scan passed (${files.length} files). TODO: add forbidden-name and fixture leak checks before public release.`);
