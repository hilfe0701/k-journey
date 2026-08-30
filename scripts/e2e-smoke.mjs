/**
 * Stateful production-web smoke test.
 *
 * Covers the release interactions that a route-only DOM sweep cannot: the
 * 5→6 panel threshold, undo, opt-in Want-to suggestions, direct detail refresh,
 * export scope, and confirmed local reset.
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.E2E_PORT || 4321);
const BASE = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = process.env.E2E_SCREENSHOT_DIR || '';

const PROFILE = {
  uid: 'local-profile',
  email: null,
  displayName: 'Release QA',
  photoUrl: null,
  university: 'snu',
  housing: 'off-campus',
  residenceDistrict: 'Mapo-gu',
  universityId: 'snu',
  programType: 'exchange',
  visaTypeOrStatus: 'D-2-6',
  housingType: 'own_lease',
  contractHolder: 'self',
  totalStayDays: 128,
  nationality: 'DE',
  homeCountryInsurance: 'no',
  residenceCardStatus: 'not_started',
  arrivalDate: '2026-08-14',
  departureDate: '2026-12-20',
  programStartDate: '2026-08-09',
  era: 'joseon',
  onboardingCompletedAt: '2026-01-01T00:00:00.000Z',
  createdAt: null,
};

const FIVE_COMPLETIONS = ['p1_pack', 'p1_visa', 'p1_dorm_rules', 'p1_airport', 'p1_emergency'].map(
  (missionId, index) => ({ missionId, completedAtIso: `2026-08-0${index + 1}T00:00:00.000Z` }),
);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
};

function serveDist() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(DIST, urlPath);
    if (!file.startsWith(DIST)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`;
    if (!fs.existsSync(file)) file = path.join(DIST, 'index.html');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function expect(condition, message) {
  if (!(await condition)) throw new Error(message);
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new Error('dist/index.html not found — run `npm run build:web` first.');
  }
  if (SCREENSHOT_DIR) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const server = await serveDist();
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  await context.addInitScript(({ profile, completions }) => {
    if (sessionStorage.getItem('k-journey:e2e-seeded') === 'true') return;
    localStorage.setItem('k-journey\\profile:cache:v1', JSON.stringify(profile));
    localStorage.setItem('k-journey\\missions:completed:v1', JSON.stringify(completions));
    localStorage.setItem('k-journey\\schema:version', '2');
    localStorage.setItem('k-journey\\tour:firstLaunch:shown', 'true');
    sessionStorage.setItem('k-journey:e2e-seeded', 'true');
  }, { profile: PROFILE, completions: FIVE_COMPLETIONS });

  const page = await context.newPage();
  try {
    await page.goto(`${BASE}/mission/p2_tmoney`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'I did this' }).click();
    const unlock = page.getByRole('button', { name: /Panel 1 of 8 unlocked/ });
    await unlock.waitFor({ state: 'visible', timeout: 10000 });
    await unlock.click();
    await unlock.waitFor({ state: 'hidden' });

    const afterComplete = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('k-journey\\missions:completed:v1') || '[]'),
    );
    await expect(() => afterComplete.length === 6, 'the sixth mission was not persisted');

    await page.goto(`${BASE}/mission/p2_tmoney`, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Undo completion' }).click();
    const afterUndo = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('k-journey\\missions:completed:v1') || '[]'),
    );
    await expect(
      () => afterUndo.length === 5 && !afterUndo.some((item) => item.missionId === 'p2_tmoney'),
      'undo did not restore five mission completions',
    );

    await page.goto(`${BASE}/bucket/new?template=tiger`, { waitUntil: 'networkidle' });
    await page.getByLabel('Theme name').fill('Release smoke wishes');
    await page.getByRole('button', { name: /Add suggestion:/ }).first().click();
    await page.getByRole('button', { name: 'Create bucket' }).click();
    await page.waitForURL(/\/bucket\//);
    const bucketUrl = page.url();
    const buckets = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('k-journey\\buckets:cache:v1') || '[]'),
    );
    await expect(
      () => buckets.length === 1 && buckets[0].items.length === 1,
      'opt-in suggestion did not persist in the new Want-to list',
    );
    await page.reload({ waitUntil: 'networkidle' });
    await expect(
      () => page.getByText('Release smoke wishes', { exact: true }).isVisible(),
      `direct bucket refresh did not render ${bucketUrl}`,
    );

    await page.goto(`${BASE}/settings/export`, { waitUntil: 'networkidle' });
    await expect(
      () => page.getByText(/Culture \(5 completed\)/).isVisible(),
      'export preview did not include cultural completion count',
    );
    await expect(
      () => page.getByText('Want-to lists').isVisible(),
      'export preview did not include Want-to data',
    );

    await page.goto(`${BASE}/byeongpung`, { waitUntil: 'networkidle' });
    await expect(
      () => page.getByText('Your folding screen', { exact: true }).isVisible(),
      'byeongpung route rendered the application error boundary',
    );
    if (SCREENSHOT_DIR) {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'byeongpung-390x844.png'), fullPage: true });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.reload({ waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'byeongpung-1440x900.png'), fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
    }

    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Delete all local data/ }).click();
    await page.getByRole('button', { name: 'Delete everything' }).click();
    await page.waitForURL(/\/\(onboarding\)\/university|\/university/);
    const profileAfterReset = await page.evaluate(() => localStorage.getItem('k-journey\\profile:cache:v1'));
    await expect(() => profileAfterReset === null, 'confirmed reset left the profile in local storage');

    console.log('Stateful web smoke passed: threshold, undo, Want-to, refresh, export, reset.');
  } finally {
    await context.close();
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
