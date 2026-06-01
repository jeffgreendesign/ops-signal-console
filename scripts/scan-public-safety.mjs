import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_ROOTS = ['src', 'tests', 'docs', 'README.md', 'AGENTS.md', 'index.html', 'package.json', 'vite.config.ts', 'dist'];
const TEXT_FILE_PATTERN = /\.(ts|tsx|js|mjs|cjs|md|html|css|json|svg|txt)$/;

const exact = (parts) => parts.join('');
const phrase = (...parts) => parts.join(' ');

const BANNED_APIS = [
  'fetch(',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'navigator.sendBeacon',
  'sendBeacon',
  'serviceWorker',
  'caches.open',
  'document.cookie',
  'BroadcastChannel',
  'SharedWorker',
  'Worker(',
];

const UNEXPECTED_BUILT_NETWORK_HELPERS = [
  '__vitePreload',
  'modulepreload',
  'rel="preload"',
  'rel="modulepreload"',
  'new URL(',
  'import.meta.glob',
];

const FORBIDDEN_TERMS = [
  exact(['da', 'vid']),
  exact(['me', 'dici']),
  exact(['pro', 'tein']),
  exact(['e', 'pg']),
  exact(['epo', 'gee']),
  phrase(exact(['pe', 'ter']), exact(['ra', 'hal'])),
  phrase(exact(['ju', 'lia']), exact(['fo', 'x'])),
  exact(['shop', 'ify']),
  'amazon',
  'walmart',
  'target',
  'costco',
  'tiktok',
  'instagram',
  'twitter',
  'x.com',
  'linkedin',
  'stripe',
  'auth0',
  'openai',
  'anthropic',
  'gemini',
  'slack',
  'jira',
  'zendesk',
  'salesforce',
  'http://',
  'https://',
  'www.',
  exact(['check', 'out']),
  exact(['ca', 'rt']),
  exact(['or', 'der']),
  exact(['pay', 'ment']),
  exact(['cus', 'tomer']),
  exact(['mer', 'chant']),
  exact(['store', 'front']),
  exact(['p', 'dp']),
  exact(['au', 'th']),
  exact(['ac', 'count']),
  exact(['cre', 'dential']),
  exact(['tele', 'gram']),
  exact(['her', 'mes']),
  exact(['u', 'cp']),
  exact(['m', 'cp']),
  exact(['a', 'cp']),
  exact(['com', 'merce']),
  exact(['tick', 'et']),
  exact(['inci', 'dent']),
  'endpoint',
  'api/',
  'founder',
  'ceo',
  phrase(exact(['pri', 'vate']), exact(['lo', 'g'])),
  phrase(exact(['per', 'sonal']), exact(['pur', 'chase'])),
];

const DOC_IMPLICATION_PATTERNS = [
  /based on\s+(?:a\s+)?real\s+(?:company|brand|operator|organization)/i,
  /from\s+(?:our|a)\s+(?:production|live)\s+(?:system|data|logs|metrics|environment)/i,
  /uses?\s+(?:real|live)\s+(?:company|brand|supplier|retailer|operator|customer|merchant|production)\s+(?:data|material|signals|metrics|context|behavior)/i,
  /(?<!not\s)connects?\s+to\s+(?:live|production|real)\s+(?:systems|feeds|alerts|services|apis|endpoints)/i,
  /scrapes?\s+(?:live|production|real)\s+(?:sites|pages|data|systems)/i,
  /writes?\s+to\s+(?:live|production|external)\s+(?:systems|channels|services|tools)/i,
  /sends?\s+(?:live|production|external|public)\s+(?:alerts|messages|notifications|posts)/i,
  /signs?\s+in\s+to\s+(?:live|production|real)\s+(?:accounts|systems|services)/i,
];

const ALLOWED_FORBIDDEN_TERM_FILES = new Set([
  'tests/public-safety-terms.ts',
]);

const ALLOWED_PROFILE_CHROME = [
  'https://github.com/jeffgreendesign/ops-signal-console',
  'https://www.hirejeffgreen.com/',
  'https://www.linkedin.com/in/jeffgreenweb',
  'LinkedIn',
];

const SKIPPED_DIRECTORIES = new Set(['node_modules', '.git']);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function termPattern(term) {
  const escaped = escapeRegex(term);
  if (/^[a-z0-9]+$/i.test(term) && term.length <= 5) {
    return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
  }
  if (/^[a-z0-9]+$/i.test(term)) {
    return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
  }
  return new RegExp(escaped, 'i');
}

function lineAndColumn(text, index) {
  const before = text.slice(0, index);
  const line = before.split('\n').length;
  const lastBreak = before.lastIndexOf('\n');
  return { line, column: index - lastBreak };
}

function contextFor(text, index, length) {
  const start = Math.max(0, text.lastIndexOf('\n', index - 1) + 1);
  const nextBreak = text.indexOf('\n', index + length);
  const end = nextBreak === -1 ? text.length : nextBreak;
  return text.slice(start, end).trim().slice(0, 180);
}

function collectFiles(root, inputPath) {
  const absolutePath = resolve(root, inputPath);
  if (!existsSync(absolutePath)) return [];

  const stat = statSync(absolutePath);
  if (stat.isDirectory()) {
    const directoryName = inputPath.split(/[\\/]/).pop();
    if (SKIPPED_DIRECTORIES.has(directoryName)) return [];
    return readdirSync(absolutePath).flatMap((entry) => collectFiles(root, join(inputPath, entry)));
  }

  return TEXT_FILE_PATTERN.test(inputPath) ? [inputPath.replace(/\\/g, '/')] : [];
}

function addFinding(findings, file, kind, detail, text, index, length) {
  const location = lineAndColumn(text, index);
  findings.push({
    file,
    line: location.line,
    column: location.column,
    kind,
    detail,
    context: contextFor(text, index, length),
  });
}

export function scanText(file, text) {
  const normalizedFile = file.replace(/\\/g, '/');
  const sanitizedText = ALLOWED_PROFILE_CHROME.reduce((current, allowed) => current.replaceAll(allowed, ''), text);
  const lowerText = sanitizedText.toLowerCase();
  const findings = [];
  const allowsForbiddenTerms = ALLOWED_FORBIDDEN_TERM_FILES.has(normalizedFile);
  const isBuiltAsset = normalizedFile.startsWith('dist/');
  const isDoc = normalizedFile.endsWith('.md') || normalizedFile === 'README.md' || normalizedFile === 'AGENTS.md';
  const isScenarioData = (normalizedFile.includes('src/data/scenarios') || normalizedFile.includes('scenario')) && normalizedFile !== 'tests/scenarios.test.ts';

  for (const api of BANNED_APIS) {
    const index = lowerText.indexOf(api.toLowerCase());
    if (index !== -1) addFinding(findings, normalizedFile, 'banned API', api, text, index, api.length);
  }

  if (isBuiltAsset) {
    for (const helper of UNEXPECTED_BUILT_NETWORK_HELPERS) {
      const index = lowerText.indexOf(helper.toLowerCase());
      if (index !== -1) addFinding(findings, normalizedFile, 'unexpected built network helper', helper, text, index, helper.length);
    }
  }

  if (!allowsForbiddenTerms) {
    for (const term of FORBIDDEN_TERMS) {
      const match = termPattern(term).exec(sanitizedText);
      if (match?.index !== undefined) addFinding(findings, normalizedFile, 'forbidden/source-identifying term', term, text, match.index, match[0].length);
    }
  }

  if (isScenarioData) {
    const urlMatch = /https?:\/\/|www\./i.exec(text);
    if (urlMatch?.index !== undefined) addFinding(findings, normalizedFile, 'live URL in scenario data', urlMatch[0], text, urlMatch.index, urlMatch[0].length);
  }

  if (isDoc) {
    for (const pattern of DOC_IMPLICATION_PATTERNS) {
      const match = pattern.exec(text);
      if (match?.index !== undefined) addFinding(findings, normalizedFile, 'docs imply real source/live behavior', match[0], text, match.index, match[0].length);
    }
  }

  return findings;
}

export function scanPaths({ root = process.cwd(), roots = DEFAULT_ROOTS } = {}) {
  const rootPath = resolve(root);
  const files = [...new Set(roots.flatMap((entry) => collectFiles(rootPath, entry)))].sort();
  const findings = [];

  if (!existsSync(resolve(rootPath, 'dist'))) {
    findings.push({
      file: 'dist',
      line: 1,
      column: 1,
      kind: 'missing built assets',
      detail: 'Run npm run build before npm run scan:public-safety so built assets are included.',
      context: 'dist directory not found',
    });
  }

  for (const file of files) {
    findings.push(...scanText(file, readFileSync(resolve(rootPath, file), 'utf8')));
  }

  return { files, findings };
}

export function formatFinding(finding) {
  return `${finding.file}:${finding.line}:${finding.column} ${finding.kind}: ${finding.detail}\n    ${finding.context}`;
}

function runCli() {
  const { files, findings } = scanPaths();

  if (findings.length) {
    console.error('Public-safety scan findings:');
    for (const finding of findings) console.error(`- ${formatFinding(finding)}`);
    process.exit(1);
  }

  console.log(`Public-safety scan passed (${files.length} files): source, docs, tests, scenario fixtures, and built assets are public-safe.`);
}

const isCliRun = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isCliRun) runCli();
