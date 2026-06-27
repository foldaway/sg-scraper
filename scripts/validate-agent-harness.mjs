import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

const requiredFiles = [
  'AGENTS.md',
  'ARCHITECTURE.md',
  'docs/README.md',
  'docs/HARNESS_ENGINEERING.md',
  'docs/PLANS.md',
  'docs/QUALITY.md',
  'docs/RELIABILITY.md',
  'docs/exec-plans/README.md',
  'docs/exec-plans/active/.gitkeep',
  'docs/exec-plans/completed/.gitkeep',
];

const requiredScripts = ['typecheck', 'check', 'validate:harness', 'validate'];

const docsToCheck = [
  'AGENTS.md',
  'ARCHITECTURE.md',
  'docs/README.md',
  'docs/HARNESS_ENGINEERING.md',
  'docs/PLANS.md',
  'docs/QUALITY.md',
  'docs/RELIABILITY.md',
  'docs/exec-plans/README.md',
];

const failures = [];

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function normalizeLinkTarget(sourceFile, target) {
  const withoutAnchor = target.split('#')[0];

  if (withoutAnchor.length === 0) {
    return null;
  }

  if (
    withoutAnchor.startsWith('http://') ||
    withoutAnchor.startsWith('https://') ||
    withoutAnchor.startsWith('mailto:')
  ) {
    return null;
  }

  return path.normalize(path.join(path.dirname(sourceFile), withoutAnchor));
}

for (const file of requiredFiles) {
  if (!(await exists(file))) {
    failures.push(`Missing required harness file: ${file}`);
  }
}

const packageJson = JSON.parse(await readFile(path.join(root, 'package.json')));
for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) {
    failures.push(`Missing package script: ${script}`);
  }
}

const agentsText = await readFile(path.join(root, 'AGENTS.md'), 'utf8');
const agentsLineCount = agentsText.trimEnd().split('\n').length;
if (agentsLineCount > 120) {
  failures.push(
    `AGENTS.md has ${agentsLineCount} lines; keep it at 120 or less`,
  );
}

for (const expectedLink of [
  'ARCHITECTURE.md',
  'docs/README.md',
  'docs/HARNESS_ENGINEERING.md',
  'docs/QUALITY.md',
  'docs/RELIABILITY.md',
  'docs/PLANS.md',
]) {
  if (!agentsText.includes(expectedLink)) {
    failures.push(`AGENTS.md does not link to ${expectedLink}`);
  }
}

const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
for (const doc of docsToCheck) {
  const text = await readFile(path.join(root, doc), 'utf8');
  const links = text.matchAll(markdownLinkPattern);

  for (const [, target] of links) {
    const normalized = normalizeLinkTarget(doc, target);

    if (normalized !== null && !(await exists(normalized))) {
      failures.push(`${doc} links to missing path: ${target}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Agent harness validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log('Agent harness validation passed.');
}
