declare module '../scripts/scan-public-safety.mjs' {
  export type PublicSafetyFinding = {
    file: string;
    line: number;
    column: number;
    kind: string;
    detail: string;
    context: string;
  };

  export function scanText(file: string, text: string): PublicSafetyFinding[];
  export function scanPaths(options?: { root?: string; roots?: string[] }): { files: string[]; findings: PublicSafetyFinding[] };
  export function formatFinding(finding: PublicSafetyFinding): string;
}
