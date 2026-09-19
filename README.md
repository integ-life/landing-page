# integ.life Landing Page

Static multilingual directory for the Integ.Life product family. Its core page
follows the workspace locale contract: `zh-CN`, `en`, `es`, `fr`, `de`, `id`,
`vi`, `th`, `ja`, and `ko`.

## Brand resources

The public brand hub lives at `/brand/`. Canonical, reusable files live under
`docs/assets/brand/`; add new public brand assets there and link them from the
hub. Retired marks and compatibility copies are removed after migration.

- `integ-life-wordmark.svg` — scalable horizontal wordmark
- `brand-tokens.css` — canonical public color tokens

The coherent master/product logo system lives in `docs/assets/brand/family/`.
Every product logo retains the master leaf and adds one fixed-position product
badge. These files are the only current public logo set; retired marks are not
kept in the published brand hub.

## Local preview

```bash
python3 -m http.server 8080 --directory docs
```

## Deployment

GitHub Pages publishes `docs/` from the `main` branch to `https://integ.life`.
The unified Integ.Life app is published at `https://app.integ.life`, with Notes, Todo, People, Money, Calendar and time tracking. The previous focused domains remain recovery clients for existing local data and installed PWAs.

`docs/service-worker.js` is a permanent retirement worker for the PWA that used
to be served from `https://integ.life`. Do not remove or rename it: browsers with
the legacy root-scope registration must be able to update that exact URL, clear
the old Cache Storage entries, and unregister the worker.

## Investment

`https://integ.life/investment/` is the Chinese options research workspace. It
shows the saved SPY Wheel scenarios, daily equity, complete assignment cycles,
cash accounting, methodology, and the limits of model-priced experiments.
The historical demos at `/investment/#demos` compare two Wheel rules and SPY
DCA across six independently restarted periods and two equal-funding plans.
They include monthly playback, contributions separated from profit, daily
profit decomposition, cash-flow-adjusted drawdowns, and downloadable ledgers.
All Wheel performance is labeled `MODEL-ONLY`; this is a research snapshot,
not live market data or an execution service.

The strategy engine and exporter live in the separate `options-lab` repository.
Update the static data, validate this publication, and then publish `main`:

```bash
cd ~/projects/options-lab
.venv/bin/python scripts/export_investment.py \
  --out ~/projects/integ-life-landing/docs/investment/data
.venv/bin/python scripts/run_demo_cases.py \
  --out ~/projects/integ-life-landing/docs/investment/data/demos
cd ~/projects/integ-life-landing
node --test tests/investment*.test.mjs
node scripts/build-investment.mjs
```

The exporter publishes an explicit research-data subset. Vendor raw option
files, credentials, local paths and account data are not part of the site.
`investment/release.json` records exact public asset hashes for deployment
verification. This uses the existing GitHub Pages publication and domain;
no additional service, authentication client, or DNS record is required.

## Page analytics

The **Integ Life Portal** GA4 property uses its own production web stream
`G-S3SWEL5RC8`, separate from the app, Blog and Hopmodo. The tag loads only on
`integ.life` in a top-level page. It counts public page paths without query
strings, fragments, referrers or page content. Unknown paths become
`/not-found`. Enhanced measurement, Google signals and ad personalization
are disabled.
