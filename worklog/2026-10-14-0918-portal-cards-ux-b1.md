# Clarify access, verbs, and positioning on the portal cards (UX B1)

## Goal

Apply UX-20261014-02, -04, -05 and -06 to the product directory as one
change, without touching card order or the 01–10 numbering (INS-09).

## Changes

- UX-02: an "Account required" badge on the four cards whose product needs an
  account to use (App, Integ-Chat, Chinese Chess, Chess); the open products get
  no badge. Ten locales via `badgeAccount`.
- UX-04: every card's primary action is now "Open ↗" (`open`, ten locales);
  the per-type enter/play/use/read keys are removed. The Obsidian setup link
  is restyled as small muted text so it no longer competes with the action.
- UX-05: the two chess cards open with "for serious study and play"; the Games
  card opens with "arcade games with no sign-up". Ten locales plus the static
  English fallback.
- UX-06: a 中文 badge on the Investment card and a localized "(Chinese only)"
  suffix on its description in the nine non-Chinese locales.
- Refresh the changed stylesheet/script URLs.

## Verification

- `node --test tests/` 16/16.
- Local headless Chromium at 1280 and 390 in en, zh-CN and ja: card indexes
  01–10 in order, one action label per locale, badges on exactly the five
  intended cards, no horizontal overflow; with JavaScript disabled the static
  HTML shows the same badges and "Open ↗".
