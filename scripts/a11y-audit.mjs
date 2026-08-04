/**
 * Automated web accessibility audit — the checks in `docs/ACCESSIBILITY.md`
 * that only fail in a browser, run on the static export instead of by hand.
 *
 * Every rule here exists because a real defect shipped past code review:
 * 44pt targets that were `hitSlop`, stateful roles with no state, an inactive
 * tab screen that stayed in the tab order, and a 720px off-screen capture
 * canvas that made the whole page scroll sideways.
 *
 *   npm run build:web && npm run audit:a11y
 *
 * Serves `dist/` with the same catch-all rewrite as `vercel.json`, sweeps every
 * route at phone and desktop widths, and exits non-zero on any violation.
 * Requires Chromium: `npx playwright install chromium`.
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.AUDIT_PORT || 4319);
const BASE = `http://localhost:${PORT}`;

const VIEWPORTS = [
  { name: '390x844', width: 390, height: 844 },
  { name: '1440x900', width: 1440, height: 900 },
];

const ROUTES = [
  '/',
  '/checklist',
  '/byeongpung',
  '/wantto',
  '/more',
  '/mission/p1_pack',
  '/task/residence-registration',
  '/task/housing-proof',
  '/bucket/new',
  '/campus',
  '/emergency',
  '/gallery',
  '/settings',
  '/settings/export',
];

/**
 * A completed profile, so the audit sees the real screens rather than
 * onboarding. Written straight into the MMKV web backing store.
 */
const FIXTURE_PROFILE = {
  uid: 'local-profile',
  email: null,
  displayName: null,
  photoUrl: null,
  university: 'cau',
  stayType: null,
  housing: 'dormitory',
  universityId: 'cau',
  programType: 'exchange',
  visaTypeOrStatus: 'unknown',
  housingType: 'dormitory',
  contractHolder: 'unknown',
  totalStayDays: 128,
  nationality: 'unknown',
  homeCountryInsurance: 'unknown',
  residenceCardStatus: 'unknown',
  arrivalDate: '2026-08-14',
  departureDate: '2026-12-20',
  programStartDate: '2026-08-09',
  era: 'joseon',
  onboardingCompletedAt: '2026-01-01T00:00:00.000Z',
  createdAt: null,
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function serveDist() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(DIST, urlPath);
    if (!file.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`;
    // Same catch-all rewrite as production.
    if (!fs.existsSync(file)) file = path.join(DIST, 'index.html');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

/** Runs in the page. Mirrors the snippet documented in docs/ACCESSIBILITY.md. */
function auditPage() {
  const selector =
    '[role="button"],[role="link"],[role="tab"],[role="radio"],[role="checkbox"],[role="switch"],[tabindex="0"]';
  const controls = [...document.querySelectorAll(selector)].filter(
    (el) => !el.closest('[aria-hidden="true"]') && !el.closest('[inert]'),
  );
  const describe = (el) => {
    const rect = el.getBoundingClientRect();
    return {
      role: el.getAttribute('role'),
      label: el.getAttribute('aria-label') || (el.innerText || '').trim().slice(0, 48),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  };
  const visible = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  return {
    controlCount: controls.length,
    undersized: controls
      .filter(visible)
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.height < 44 || rect.width < 44;
      })
      .map(describe),
    unnamed: controls
      .filter(visible)
      .filter((el) => !el.getAttribute('aria-label') && !(el.innerText || '').trim())
      .map(describe),
    stateless: controls
      .filter((el) => {
        const role = el.getAttribute('role');
        if (role === 'tab' || role === 'radio') return el.getAttribute('aria-selected') === null;
        if (role === 'checkbox' || role === 'switch') return el.getAttribute('aria-checked') === null;
        return false;
      })
      .map(describe),
    horizontalOverflow:
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  };
}

/** After a tab switch, no control of the screen left behind may still be focusable. */
async function auditInactiveTab(page) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page
    .waitForFunction(() => document.body.innerText.includes('Your journey'), null, { timeout: 20000 })
    .catch(() => {});
  await page.getByRole('tab', { name: /^Byeongpung/ }).first().click();
  await page.waitForTimeout(1200);

  const stops = [];
  for (let i = 0; i < 24; i++) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      return {
        label: (el.getAttribute('aria-label') || el.innerText || '').trim().slice(0, 40),
        inInactiveScreen: !!el.closest('[inert]') || !!el.closest('[aria-hidden="true"]'),
      };
    });
    if (stop) stops.push(stop);
  }
  return stops.filter((s) => s.inInactiveScreen);
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('dist/index.html not found — run `npm run build:web` first.');
    process.exit(2);
  }

  const server = await serveDist();
  const browser = await chromium.launch();
  const failures = [];

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    await context.addInitScript((profile) => {
      localStorage.setItem('k-journey\\profile:cache:v1', JSON.stringify(profile));
      localStorage.setItem('k-journey\\schema:version', '2');
      // Without this the first-launch tour covers the screen under audit.
      localStorage.setItem('k-journey\\tour:firstLaunch:shown', 'true');
    }, FIXTURE_PROFILE);

    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', (error) => consoleErrors.push(`${page.url()} — ${error.message}`));

    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: 'networkidle' });
      // The splash gate replaces the route once the local profile is read.
      await page.waitForTimeout(2500);
      const result = await page.evaluate(auditPage);
      const where = `${viewport.name} ${route}`;

      for (const control of result.undersized) {
        failures.push(`${where}: target ${control.width}×${control.height} — "${control.label}"`);
      }
      for (const control of result.unnamed) {
        failures.push(`${where}: control with no accessible name (${control.role})`);
      }
      for (const control of result.stateless) {
        failures.push(`${where}: ${control.role} announces no state — "${control.label}"`);
      }
      if (result.horizontalOverflow) {
        failures.push(`${where}: the page scrolls horizontally`);
      }
      console.log(
        `${where.padEnd(34)} ${String(result.controlCount).padStart(3)} controls  ` +
          `${result.undersized.length} undersized  ${result.unnamed.length} unnamed  ` +
          `${result.stateless.length} stateless  overflowX=${result.horizontalOverflow}`,
      );
    }

    const leaked = await auditInactiveTab(page);
    for (const stop of leaked) {
      failures.push(`${viewport.name}: Tab reached "${stop.label}" on an inactive screen`);
    }
    console.log(`${viewport.name} inactive-tab focus leaks: ${leaked.length}`);

    for (const error of consoleErrors) failures.push(`${viewport.name}: uncaught — ${error}`);
    await context.close();
  }

  await browser.close();
  server.close();

  if (failures.length) {
    console.error(`\n${failures.length} accessibility failure(s):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log('\nNo accessibility failures.');
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
