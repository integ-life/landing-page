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
