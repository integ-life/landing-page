#!/usr/bin/env node
import { readFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { products, productGroups } from '../labels.js';

const errors = [];
const fail = message => errors.push(message);
const address = value => {
  const url = new URL(value, 'https://integ.life/');
  return url.host + url.pathname.replace(/\/+$/, '');
};
const ids = new Set();
const domains = new Set();
for (const item of products) {
  if (!item.id || ids.has(item.id)) fail(`Missing or duplicate id: ${item.id}`);
  ids.add(item.id);
  if (typeof item.listed !== 'boolean') fail(`${item.id}: listed must be boolean`);
  if (item.domain) {
    if (domains.has(item.domain)) fail(`Duplicate domain: ${item.domain}`);
    domains.add(item.domain);
    if (address(`https://${item.domain}`) !== item.domain) fail(`${item.id}: domain must be canonical`);
  }
  if (item.listed && (!item.domain || !['open', 'account'].includes(item.access))) {
    fail(`${item.id}: listed entries require domain and access=open|account`);
  }
  if (item.access !== undefined && !['open', 'account'].includes(item.access)) fail(`${item.id}: invalid access`);
  try {
    if (new URL(item.href).protocol !== 'https:' || address(item.href) !== item.domain) {
      fail(`${item.id}: href must be HTTPS and match domain`);
    }
  } catch { fail(`${item.id}: invalid href`); }
  if (!['life', 'learn', 'play'].includes(item.group)) fail(`${item.id}: unknown group`);
  if (!item.logo) fail(`${item.id}: missing logo`);
}
for (const id of ['investment', 'things', 'family', 'context']) {
  if (!products.some(item => item.id === id && item.listed)) fail(`${id}: must be listed`);
}
for (const locale of ['en','zh','es','fr','de','id','vi','th','ja','ko','hi','ar']) {
  const entries = productGroups(locale).flatMap(group => group.products);
  if (entries.length !== products.length || entries.some(item => !item.description)) {
    fail(`${locale}: groups must include every product with a description`);
  }
}

const expected = new Set(products.filter(item => item.listed).map(item => item.domain));
async function compare(kind, input) {
  let file = resolve(input);
  if ((await stat(file)).isDirectory()) {
    file = join(file, kind === 'landing' ? 'docs/index.html' : 'src/lib/site.ts');
  }
  const source = await readFile(file, 'utf8');
  let links;
  if (kind === 'landing') {
    // Current landing uses both anchor cards and article cards with a primary link.
    const cards = [...source.matchAll(/<(a|article)\b(?=[^>]*\bclass\s*=\s*["'][^"']*\bproduct-card\b)[^>]*>[\s\S]*?<\/\1\s*>/gi)];
    links = cards.map(([card]) => card.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]);
    if (!cards.length || links.some(link => !link)) throw new Error('No product cards found, or a card has no link');
  } else {
    const catalog = source.match(/export\s+const\s+PRODUCTS\s*=\s*\[([\s\S]*?)\]\s*(?:as\s+const\s*)?;/);
    if (!catalog) throw new Error('Cannot locate PRODUCTS array');
    links = [...catalog[1].matchAll(/\b(?:url|href)\s*:\s*['"`]([^'"`]+)['"`]/g)].map(match => match[1]);
    if (!links.length) throw new Error('No product URLs found in PRODUCTS');
  }
  const actual = new Set(links.map(address));
  const missing = [...expected].filter(domain => !actual.has(domain));
  const extra = [...actual].filter(domain => !expected.has(domain));
  console.log(`${kind}: ${file} (${actual.size} product links)`);
  if (missing.length || extra.length) {
    fail(`${kind}: catalog differs\n  Missing: ${missing.join(', ') || '(none)'}\n  Extra: ${extra.join(', ') || '(none)'}`);
  } else console.log(`${kind}: matches all ${expected.size} listed products`);
}

const args = process.argv.slice(2);
try {
  for (let i = 0; i < args.length; i += 2) {
    if (!['--landing', '--blog'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) {
      throw new Error('Usage: node scripts/check-catalog.mjs [--landing <path>] [--blog <path>]');
    }
    await compare(args[i].slice(2), args[i + 1]);
  }
} catch (error) { fail(error.message); }
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Catalog OK: ${products.length} products, ${expected.size} listed; unique ids/domains, valid access, groups and 12 locales.`);
