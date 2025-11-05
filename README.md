# PaperPilot

Cross-browser web extension (Chrome, Firefox, Edge) built with WXT, React, TypeScript, and Bun to help read technical papers.

Features:
- Select a word on any page to see dictionary definitions (Free Dictionary API).
- Popup to search arXiv and open results.
- Context menus: Define selection, Search on arXiv.

Development

```bash
# Dev (Chromium)
bun run dev

# Dev (Firefox)
bun run dev:firefox

# Build (Chromium)
bun run build

# Build (Firefox)
bun run build:firefox

# Package zip
bun run zip
```

Permissions/hosts:
- permissions: storage, contextMenus, activeTab
- host_permissions: https://api.dictionaryapi.dev/*, https://export.arxiv.org/*

Firefox notes:
- Uses temporary ID `paperpilot@example.com` via `browser_specific_settings`.
