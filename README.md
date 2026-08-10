# integ.life Landing Page

Static bilingual directory for the Integ.Life product family.

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
The Integ.Life application itself is deployed separately at `https://app.integ.life`.
