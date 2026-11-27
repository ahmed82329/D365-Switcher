# D365 Company & Environment Switcher v4.0.0

Copyright © 2026 Ahmed Imam. All Rights Reserved.

A Manifest V3 extension for switching user-configured Microsoft Dynamics 365 Finance & Operations environments and company (`cmp`) values.

## Release scope

This delivery contains the public-store build only. Git history has not been rewritten; earlier revisions may still contain files removed from the current tree. Do not treat a full-history clone as a sanitized public source archive.

## Builds

- **Public store build:** empty defaults; safe for public Chrome, Edge, Firefox, and Zen distribution.

## Features

- Current environment detection by host.
- Current company detection from the `cmp` URL parameter.
- Immediate switching from the popup.
- Add, edit, and remove companies and environments.
- JSON import/export and restore defaults.
- Preserves the current D365 path, query, and fragment when switching environments.
- Does not transfer URL state from an unrelated website.
- Local storage only; no analytics, telemetry, remote code, or external requests.
- Minimal permissions: `activeTab` and `storage`.

## Developer-mode installation

### Chrome / Edge
1. Extract the Chrome or Edge package, or select `source/public-store` from this repository.
2. Ensure the selected folder contains `manifest.json`.
3. Open `chrome://extensions` or `edge://extensions`.
4. Enable Developer mode, choose **Load unpacked**, and select the extracted folder.

### Firefox / Zen
Use the Firefox package or temporarily replace `manifest.json` with `manifest.firefox.json`, then load it from `about:debugging#/runtime/this-firefox`. Permanent standard installation requires Mozilla signing.

## Public installation

Upload the browser-specific package from `packages/` to the corresponding store.
