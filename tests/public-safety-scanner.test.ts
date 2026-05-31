import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';
// @ts-expect-error The scanner is a Node ESM release-gate script imported directly for behavioral tests.
import { scanPaths as rawScanPaths, scanText as rawScanText } from '../scripts/scan-public-safety.mjs';

type PublicSafetyFinding = {
  file: string;
  line: number;
  column: number;
  kind: string;
  detail: string;
  context: string;
};

const scanText = rawScanText as (file: string, text: string) => PublicSafetyFinding[];
const scanPaths = rawScanPaths as (options?: { root?: string; roots?: string[] }) => { files: string[]; findings: PublicSafetyFinding[] };

const term = (parts: string[]): string => parts.join('');
const phrase = (...parts: string[]): string => parts.join(' ');
const forbiddenFixturePath = 'tests/public-safety-terms.ts';
const makeTempRoot = (): string => {
  const root = join(tmpdir(), `ops-signal-scan-${process.pid}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(root, { recursive: true });
  mkdirSync(join(root, 'src/data'), { recursive: true });
  mkdirSync(join(root, 'tests'), { recursive: true });
  mkdirSync(join(root, 'docs'), { recursive: true });
  mkdirSync(join(root, 'dist/assets'), { recursive: true });
  return root;
};

const roots: string[] = [];
const write = (root: string, path: string, content: string): void => writeFileSync(join(root, path), content);

function writeCleanProject(root: string): void {
  write(root, 'src/main.ts', 'const demoState = "synthetic only";\n');
  write(root, 'src/data/scenarios.ts', 'export const scenarios = [{ id: "scenario-one", sourceLabel: "synthetic queue" }];\n');
  write(root, 'tests/example.test.ts', 'export const fixture = "synthetic test";\n');
  write(root, forbiddenFixturePath, 'export const forbiddenPublicArtifactTerms = [];\n');
  write(root, 'docs/public-safety.md', 'Synthetic fixture only. No live behavior is included.\n');
  write(root, 'README.md', 'Synthetic local prototype.\n');
  write(root, 'AGENTS.md', 'Keep examples invented.\n');
  write(root, 'index.html', '<main>synthetic</main>\n');
  write(root, 'package.json', '{"name":"synthetic"}\n');
  write(root, 'vite.config.ts', 'export default {};\n');
  write(root, 'dist/index.html', '<main>built synthetic</main>\n');
  write(root, 'dist/assets/app.js', 'const built="synthetic";\n');
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('public-safety release scanner', () => {
  it('fails forbidden terms outside the explicit banned-list fixture', () => {
    const blocked = scanText('src/data/scenarios.ts', `const label = "${term(['shop', 'ify'])}";`);
    const allowed = scanText(forbiddenFixturePath, `export const terms = ["${term(['shop', 'ify'])}"];`);

    expect(blocked.map((finding) => finding.kind)).toContain('forbidden/source-identifying term');
    expect(allowed).toEqual([]);
  });

  it('uses word boundaries for short forbidden terms', () => {
    expect(scanText('src/main.ts', `const safe = "the ${term(['e', 'pg'])}ress demo";`)).toEqual([]);

    const findings = scanText('src/main.ts', `const unsafe = "standalone ${term(['e', 'pg'])} token";`);
    expect(findings.map((finding) => finding.detail)).toContain(term(['e', 'pg']));
  });

  it('fails scenario data with live URLs', () => {
    const findings = scanText('src/data/scenarios.ts', `export const source = "${term(['ht', 'tps'])}://example.test/path";`);

    expect(findings.some((finding) => finding.kind === 'live URL in scenario data')).toBe(true);
  });

  it('fails banned browser network, storage, and telemetry APIs', () => {
    const beacon = term(['navigator.', 'send', 'Beacon']);
    const storage = term(['local', 'Storage']);
    const findings = scanText('src/main.ts', `${beacon}("/signal", "demo"); window.${storage}.setItem("x", "y");`);

    expect(findings.map((finding) => finding.kind)).toContain('banned API');
    expect(findings.map((finding) => finding.detail)).toEqual(expect.arrayContaining([beacon, storage]));
  });

  it('fails docs that imply real source material or live production behavior', () => {
    const findings = scanText('docs/public-safety.md', phrase('This uses', 'real', 'company', 'data', 'for the demo.'));

    expect(findings.map((finding) => finding.kind)).toContain('docs imply real source/live behavior');
  });

  it('scans built assets after build and fails network helpers there', () => {
    const root = makeTempRoot();
    roots.push(root);
    writeCleanProject(root);
    write(root, 'dist/assets/app.js', 'const helper = "__vitePreload";');

    const result = scanPaths({ root });

    expect(result.files).toContain('dist/assets/app.js');
    expect(result.findings.some((finding) => finding.kind === 'unexpected built network helper')).toBe(true);
  });

  it('prints enough path and context detail to fix findings', () => {
    const storage = term(['local', 'Storage']);
    const finding = scanText('src/main.ts', `const value = window.${storage};`)[0];

    expect(finding).toMatchObject({
      file: 'src/main.ts',
      line: 1,
      kind: 'banned API',
      detail: storage,
    });
    expect(finding.context).toContain(storage);
  });
});
