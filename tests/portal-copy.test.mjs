import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteSource = readFileSync(path.join(root, 'docs/site.js'), 'utf8');
const indexHtml = readFileSync(path.join(root, 'docs/index.html'), 'utf8');

const LOCALES = ['en', 'zh-CN', 'es', 'fr', 'de', 'id', 'vi', 'th', 'ja', 'ko'];

function loadCopy() {
  const cut = siteSource.lastIndexOf('setLanguage(preferred);');
  assert.ok(cut > 0, 'site.js should call setLanguage(preferred) at the end');
  const node = { textContent: '', setAttribute() {}, addEventListener() {}, classList: { toggle() {} } };
  const doc = {
    documentElement: {},
    title: '',
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
  };
  const store = { getItem: () => null, setItem() {}, removeItem() {} };
  const fn = new Function(
    'document', 'navigator', 'localStorage', 'window', 'sessionStorage', 'node',
    `${siteSource.slice(0, cut)}\nreturn { copy, cardCopy };`,
  );
  return fn(doc, { language: 'en' }, store, {}, store, node);
}

const { copy, cardCopy } = loadCopy();
const htmlKeys = [...new Set([...indexHtml.matchAll(/data-copy="([^"]+)"/g)].map((m) => m[1]))];

test('portal copy has exactly the ten expected locales', () => {
  assert.deepEqual(Object.keys(copy).sort(), [...LOCALES].sort());
});

test('every locale has the same keys as en with non-empty strings', () => {
  const enKeys = Object.keys(copy.en).sort();
  for (const locale of LOCALES) {
    assert.deepEqual(Object.keys(copy[locale]).sort(), enKeys, `${locale} key set differs from en`);
    for (const [key, value] of Object.entries(copy[locale])) {
      assert.equal(typeof value, 'string', `${locale}.${key} should be a string`);
      assert.ok(value.trim().length > 0, `${locale}.${key} should not be empty`);
    }
  }
});

test('every data-copy key in index.html exists in en', () => {
  for (const key of htmlKeys) assert.ok(key in copy.en, `missing key in en: ${key}`);
});

test('every en key is used by index.html (no dead keys)', () => {
  for (const key of Object.keys(copy.en)) assert.ok(htmlKeys.includes(key), `unused key in en: ${key}`);
});

test('non-Chinese investmentDescription ends with the localized Chinese-only suffix', () => {
  for (const locale of LOCALES.filter((l) => l !== 'zh-CN')) {
    const suffix = cardCopy[locale][2];
    assert.ok(suffix.length > 0, `${locale} should have a Chinese-only suffix`);
    assert.ok(copy[locale].investmentDescription.endsWith(suffix), `${locale} investmentDescription lacks suffix`);
  }
  assert.ok(!copy['zh-CN'].investmentDescription.includes('Chinese'));
});
