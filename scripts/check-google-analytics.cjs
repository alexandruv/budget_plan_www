#!/usr/bin/env node
/**
 * Fails if any published static HTML page is missing the standard gtag snippet.
 * Keep paths in sync with GitHub Pages (root + blog/).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GA_ID = 'G-6HJM64ZF5Y';
const REQUIRED = [
  `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
  `gtag('config', '${GA_ID}')`,
];

function walkHtmlFiles(dir, out) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtmlFiles(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
}

function main() {
  const targets = [path.join(ROOT, 'index.html')];
  const blogRoot = path.join(ROOT, 'blog');
  if (fs.existsSync(blogRoot)) walkHtmlFiles(blogRoot, targets);

  let failed = false;
  for (const file of targets) {
    const rel = path.relative(ROOT, file);
    const content = fs.readFileSync(file, 'utf8');
    for (const fragment of REQUIRED) {
      if (!content.includes(fragment)) {
        console.error(`[check-google-analytics] Missing in ${rel}: ${fragment}`);
        failed = true;
      }
    }
  }

  if (failed) {
    console.error('[check-google-analytics] Add the same gtag block as root index.html (or extend this check if the ID changes).');
    process.exit(1);
  }

  console.log(`[check-google-analytics] OK: ${GA_ID} in ${targets.length} file(s)`);
}

main();
