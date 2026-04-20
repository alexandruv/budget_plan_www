const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(root, '.playwright-browsers');

execSync('npx playwright install chromium', {
  stdio: 'inherit',
  cwd: root,
  env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH },
});
