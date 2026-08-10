# integ.life Landing Page

Static bilingual directory for the Integ.Life product family.

## Brand resources

The public brand hub lives at `/brand/`. Canonical, reusable files live under
`docs/assets/brand/`; add new public brand assets there and link them from the
hub. Keep `docs/logo192.png` as a compatibility alias for existing sites.

- `integ-life-icon-192.png` — small web and UI use
- `integ-life-icon-512.png` — high-resolution app and presentation use
- `integ-life-wordmark.svg` — scalable horizontal wordmark
- `brand-tokens.css` — canonical public color tokens

The coherent master/product logo system lives in `docs/assets/brand/family/`.
Every product logo retains the master leaf and adds one fixed-position product
badge. Current product-owned icons are mirrored in
`docs/assets/brand/originals/` as migration references; product repositories
remain their source of truth until migration is explicitly approved.

## Local preview

```bash
python3 -m http.server 8080 --directory docs
```

## Deployment

GitHub Pages publishes `docs/` from the `main` branch to `https://integ.life`.
The Integ.Life application itself is deployed separately at `https://app.integ.life`.
