# PaperPilot

Cross-browser web extension (Chrome, Firefox, Edge) built with WXT, React, TypeScript, and Bun to help read technical papers.

Features:

- Select a word on any page to see dictionary definitions (Free Dictionary API).
- Popup to search arXiv and open results.
- Context menus: Define selection, Search on arXiv.

Development

```bash
# Install deps
pnpm install

# Dev (Chromium)
pnpm dev

# Dev (Firefox)
pnpm dev:firefox

# Build (Chromium)
pnpm build

# Build (Firefox)
pnpm build:firefox

# Package zip
pnpm zip
```

Permissions/hosts:

- permissions: storage, contextMenus, activeTab
- host_permissions: `https://api.dictionaryapi.dev/*`, `https://export.arxiv.org/*`

Firefox notes:

- Uses temporary ID `paperpilot@example.com` via `browser_specific_settings`.

Testing

Unit tests (Vitest):

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

UI tests (Selenium):

```bash
# Build extension first
pnpm build

# Chrome/Edge (load unpacked directory)
BROWSER=chrome EXT_PATH=".output/chrome-mv3" pnpm test:ui

# Firefox (requires zipped xpi/zip file)
# Create zip: pnpm zip:firefox (outputs .output/firefox-mv2.zip)
BROWSER=firefox EXT_XPI=".output/firefox-mv2.zip" pnpm test:ui
```
