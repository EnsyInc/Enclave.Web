import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const [inputPath = 'playwright-report/results.json', outputPath = 'sonar-report/e2e-tests.xml'] =
  process.argv.slice(2);

const repoRoot = process.cwd();
const report = JSON.parse(readFileSync(inputPath, 'utf-8'));
const testDir = resolve(repoRoot, report.config.rootDir);

// Playwright's expect() diffs (e.g. toEqual mismatches) are colorized with ANSI
// escape codes, which end up in error.message/stack in the JSON report. Raw
// control characters are illegal in XML 1.0 regardless of entity-escaping, so
// SonarQube's parser rejects the whole file the first time a failure's message
// contains one — strip them before escaping the rest.
function stripAnsi(value) {
  const ESC = String.fromCharCode(0x1b);
  const CSI = String.fromCharCode(0x9b);
  const pattern = new RegExp(
    `[${ESC}${CSI}][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\x07)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))`,
    'g',
  );
  return String(value).replace(pattern, '');
}

function stripIllegalXmlChars(value) {
  // eslint-disable-next-line no-control-regex
  return String(value).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function escapeXml(value) {
  return stripIllegalXmlChars(stripAnsi(value))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function collectSpecs(suite, out) {
  for (const spec of suite.specs ?? []) {
    out.push({ ...spec, file: suite.file });
  }
  for (const child of suite.suites ?? []) {
    collectSpecs(child, out);
  }
}

const specsByFile = new Map();
for (const suite of report.suites) {
  const specs = [];
  collectSpecs(suite, specs);
  for (const spec of specs) {
    const relPath = relative(repoRoot, resolve(testDir, spec.file)).replaceAll('\\', '/');
    if (!specsByFile.has(relPath)) specsByFile.set(relPath, []);
    specsByFile.get(relPath).push(spec);
  }
}

function testCaseXml(spec) {
  const name = escapeXml(spec.title);
  // Sonar's schema wants one result per testCase; use the last (i.e. final retry) attempt.
  const result = spec.tests[0]?.results.at(-1);
  const duration = result?.duration ?? 0;

  if (!result || result.status === 'skipped') {
    return `    <testCase name="${name}" duration="${duration}"><skipped/></testCase>`;
  }
  if (result.status === 'passed') {
    return `    <testCase name="${name}" duration="${duration}"/>`;
  }

  const error = result.errors?.[0];
  const message = escapeXml(error?.message?.split('\n')[0] ?? 'Test failed');
  const stack = escapeXml(error?.stack ?? error?.message ?? '');
  const tag = result.status === 'timedOut' ? 'error' : 'failure';
  return `    <testCase name="${name}" duration="${duration}">\n      <${tag} message="${message}">${stack}</${tag}>\n    </testCase>`;
}

const fileBlocks = [...specsByFile.entries()].map(
  ([file, specs]) =>
    `  <file path="${escapeXml(file)}">\n${specs.map(testCaseXml).join('\n')}\n  </file>`,
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<testExecutions version="1">\n${fileBlocks.join('\n')}\n</testExecutions>\n`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, xml);
console.log(`Wrote Sonar test execution report (${specsByFile.size} file(s)) to ${outputPath}`);
