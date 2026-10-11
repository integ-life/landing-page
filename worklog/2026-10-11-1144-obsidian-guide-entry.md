# Add the public Obsidian setup entry

## Goal

Make Notes setup discoverable from the product-family directory while the
complete public configuration guide stays in the Integ.Life app.

## Changes

- Keep the unified Integ.Life card's primary app link and add a separate
  `https://app.integ.life/#/obsidian` setup link.
- Supply the guide label in all ten existing directory locales.
- Preserve whole-card app navigation and a separate keyboard-accessible guide
  link without nesting anchors. Refresh the changed stylesheet/script URLs.
- Reconcile the organization site-content brief with this Notes entry point.

## Verification and publication

- Repository README and CNAME identify `https://integ.life` as the root site,
  published by GitHub Pages from `main/docs`.
- The product app uses hash routing and publishes to `https://app.integ.life`;
  the complete guide is owned by the product frontend.
- `node --check docs/site.js` and `git diff --check` pass. HTML inspection
  confirms separate primary/guide anchors and no nested anchors. All 34
  `data-copy` keys have values in all ten locales.
- Actual Chrome checks pass in English and Simplified Chinese, including a
  390px phone viewport: keyboard focus reaches the guide, its focus outline is
  visible, its 44px target fits within the card, and pointer hits resolve to the
  guide rather than the stretched primary app link. The viewport was reset.
- A separate read-only review found no actionable layout, localization or
  publish-safety issue.
- The public release manifest currently identifies clean commit `8b9ee1df2f9d`
  for `integ-life/landing-page`. The new entry is locally verified and awaits
  the coordinating task's commit, push and public verification.
- Publish this entry after the product's public guide route is available.
- Only public product names, domains, labels and assets are changed. No
  credentials, real notes, migration or existing Git synchronization changes.

## Coordinated release checkpoint

The product guide and setup UI are now published as v1.26.2 from clean commit
`85063a056762d41b40b996e2056f57ec31220c86`. Public UI verification created an
isolated empty test vault, copied its actual configuration, confirmed WebDAV
access, and revoked the synthetic device. Organization messaging is pushed as
`bf2e706`. This root entry is ready for its main/docs publication; final public
version and asset checks are recorded in the coordinating product worklog.

## Help destination and language handoff

The follow-up request moves the public Obsidian Sync guide into Help while
keeping account-specific configuration in Settings and maintaining useful
links. The root card now targets `https://app.integ.life/#/help/obsidian`.
Changing the root site's language updates only this guide link's hash query
to `?lang=<locale>`; the static fallback uses `?lang=en`. The product owns the
matching whitelist and the old `/#/obsidian` redirect. No account, device,
token, credential or other query data is carried between origins.

- Preserve the existing guide labels and all directory copy in ten locales.
- Refresh the changed script URL without changing the root stylesheet,
  primary app links, card structure or retired service worker.
- Fetch both owned repositories before edits; local and remote `main` match.
- `node --check docs/site.js` and `git diff --check` pass.
- A real Chromium run passes 14 gates: complete page copy in ten locales;
  each locale's translated label, exact Help destination, retained selection
  after refresh and separate pointer target; a 390px viewport with a 44px
  target and visible keyboard focus; Enter navigation to the exact Chinese
  Help URL; and zero page errors. Navigation uses an isolated destination
  fixture until the coordinated product publication is complete.
- Local evidence: `/private/tmp/integ-obsidian-help-landing-local/report.json`
  and the Chinese phone keyboard screenshot in the same directory.
- Await the product's canonical Help route publication before committing,
  pushing and verifying this `main/docs` release at `https://integ.life`.

## Help publication checkpoint

The coordinating task has verified the canonical public Help guide in the
current app v1.26.7 (`7897c244`), with the reviewed guide bytes preserved.
The local 14-gate root check remains green, so this entry can now publish
through `main/docs`. Final root manifest, served-asset and real cross-site
language results are recorded in the coordinating product worklog.
