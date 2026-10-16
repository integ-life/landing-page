# Integ.Life UI

A small shared React shell and CSS token package, first consumed by Things and Tools.

## MVP card

- Target user: a person moving between Integ.Life products on desktop or phone.
- Job: recognize the product, switch products, navigate locally and finish an existing task.
- Riskiest assumption: the same shell can support a signed-in inventory workspace and anonymous utility catalog without crowding mobile controls or disrupting existing workflows.
- P1 loop: open Things, navigate and inspect an item; switch to Tools, find and run JSON Formatter; change language and appearance without losing the working content.
- Representative conditions: desktop and 390px mobile, keyboard, light/dark, Chinese/English and existing RTL Tools locale.
- Success proof: both products bundle the exact same package; real public versions and browser interaction match the verified builds.
- No-gos: cross-site session changes, data migrations, unrelated home-model changes, camera behavior changes, invented account or notification capabilities.
- Appetite: family header/product switcher, appearance control, accessible mobile navigation and shared geometry/tokens in two consumers.
- Later: remaining products, notification aggregation, cross-origin preference synchronization and general component-library expansion.

## Distribution

Run `npm pack` and commit the versioned tarball to each consumer's `vendor/` directory.
Consumers install a `file:` dependency and bundle it locally; CI needs no private
registry credential, and a shell release cannot change another site implicitly.
The package version is recorded in each product's build-version.json. Source
changes require a new version and an explicit consumer upgrade.

React and React DOM are host peer dependencies. The shell owns presentation and
non-secret origin-local appearance preferences; products own locale selection,
routing, authentication, data, and authorization.

## Static and Astro consumers (0.2.0)

Import `@integ-life/ui/static` and the shared stylesheet, then render
`<integ-family-bar product="games" locale="en" home-href="/">`.
Put existing language/account/audio controls inside a child with
`data-il-actions`; these same DOM nodes and listeners are retained. Changing
`locale` updates the shell copy. `default-theme="dark"` supports an existing
dark game catalog without changing canvas colors or saved game state.

The React and static adapters use the same registry, bundled product marks,
12-language descriptions, theme preference key and CSS. Static hosting can
vendor these ES modules without adding React or a build system. Existing
product marks are copied from the public brand hub; Things retains its own
box badge, and Family retains its existing typographic home mark.

The product switcher groups apps into Tools & life, Learning & reading, and Games. React and static consumers use the same localized group registry.

Host applications can pass `actions` for existing workspace controls and `appearanceControl` for an existing appearance picker (or `null` when the app has no appearance setting). Custom appearance controls retain ownership of the document theme. Context uses its existing bracket mark in the shared product registry.

## Compact family chrome (0.6.0)

From 0.6.0 the header shows a visible product wordmark beside the logo in both
React and static adapters, following Yangyu’s 2026-10-14 decision (UX-14/19).
This replaces the 0.5.0 rule that kept product names out of the header. At
viewport widths of 400px or less, the wordmark is hidden and the logo remains.
The existing `name` prop/attribute supplies the wordmark; the component API is
unchanged. The logo remains the product-switch trigger. Local-home links and
purpose descriptions live in its expanded dialog. A 56px row uses 44px touch
targets for language, appearance and account. Preserve local task navigation below or beside this row
only when it serves the active workflow. Do not duplicate a hero's CTA in it.

`languageControl`, `appearanceControl` and `accountControl` accept one existing
native control (possibly wrapped in its label), retaining routes and handlers.
Controls must have accessible names. `CompactControl` exposes the same icon
wrapper for host-owned menus. Static consumers annotate a single control or
its label with `data-il-compact="language|account|appearance"`; do not annotate
a container with multiple interactive controls. Hover/focus titles expose the
current language or account action. Existing `account` opens its detailed menu.

## Authoritative product registry (0.6.0)

`labels.js` owns the product catalog shared by the switcher, public landing
catalog and blog directory. Add or retire products here first, then explicitly
update and verify consumer catalogs before upgrading their vendored package.
Do not maintain a separate authoritative product list in a consumer.

- `id`: stable product identifier; keep existing IDs such as `lingulet`.
- `href`: canonical HTTPS product entrance.
- `domain`: unique display address without scheme or trailing slash, including
  a path for subpath products such as `integ.life/investment`.
- `listed`: whether the product belongs in the public landing and blog catalogs.
  Listing does not grant access to private product content.
- `access`: `open` for use without an account, `account` when product use requires
  sign-in, even if its marketing page is public. Verify live login behavior when
  changing this field; HTTP 200 from a frontend shell alone is insufficient.
- `group`: existing switcher group (`life`, `learn`, `play`); group membership is
  derived from this field. `listed` does not change switcher behavior.
- `invite`: optional membership restriction; Family Daily uses `true` for private
  family membership. `lang: 'zh'` marks Investment’s Chinese-only content.

Maintain the 12 localized purpose descriptions alongside the registry entries.
Investment temporarily reuses `logos.home`; existing product marks are unchanged.

Run `node scripts/check-catalog.mjs` to check registry consistency. Optional
read-only comparisons accept repository roots (or the catalog files themselves):

```sh
node scripts/check-catalog.mjs --landing ../integ-life-landing --blog ../integ-blog
```

The coarse comparison reads product-card links in `docs/index.html` and product
URLs in the `PRODUCTS` array of `src/lib/site.ts`, ignoring unrelated navigation,
assets and vendored catalogs. URL schemes, query strings, fragments and trailing
slashes are normalized. Missing or extra catalog links fail with a nonzero exit
code and a printed diff. It does not evaluate arbitrary templates or TypeScript.
The checker uses Node built-ins only and is included in the release tarball.
