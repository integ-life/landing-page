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

## Compact family chrome (0.5.0)

The logo is the product-switch trigger. Product names, local-home links and
purpose descriptions live in its expanded dialog. A 56px row uses 44px touch
targets for language, appearance and account; do not repeat identity or status
text in the header. Preserve local task navigation below or beside this row
only when it serves the active workflow. Do not duplicate a hero's CTA in it.

`languageControl`, `appearanceControl` and `accountControl` accept one existing
native control (possibly wrapped in its label), retaining routes and handlers.
Controls must have accessible names. `CompactControl` exposes the same icon
wrapper for host-owned menus. Static consumers annotate a single control or
its label with `data-il-compact="language|account|appearance"`; do not annotate
a container with multiple interactive controls. Hover/focus titles expose the
current language or account action. Existing `account` opens its detailed menu.
