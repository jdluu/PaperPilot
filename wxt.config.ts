import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    manifest_version: 3,
    name: 'PaperPilot',
    description: 'Read technical papers with AI: quick dictionary lookups and arXiv search.',
    permissions: ['storage', 'contextMenus', 'activeTab'],
    host_permissions: [
      'https://api.dictionaryapi.dev/*',
      'https://export.arxiv.org/*',
    ],
    browser_specific_settings: {
      gecko: {
        id: 'paperpilot@example.com',
      },
    },
    action: {
      default_title: 'PaperPilot',
    },
  },
});
