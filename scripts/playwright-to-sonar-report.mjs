import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const [inputPath = 'playwright-report/results.json', outputPath = 'sonar-report/e2e-tests.xml'] =
  process.argv.slice(2);

const repoRoot = process.cwd();
const report = JSON.parse(readFileSync(inputPath, 'utf-8'));
const testDir = resolve(repoRoot, report.config.rootDir);

function escapeXml(value) {
  return String(value)
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
