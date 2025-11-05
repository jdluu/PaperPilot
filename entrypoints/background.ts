import type { BgRequest, BgResponse } from '../shared/types';
import { lookupDefinition } from '../shared/api/dictionary';
import { searchArxiv } from '../shared/api/arxiv';
import { getPreferences } from '../shared/preferences';

export default defineBackground(() => {
	console.log('PaperPilot background ready', { id: browser.runtime.id });

	function setupContextMenus() {
		browser.contextMenus.removeAll().catch(() => {});
		browser.contextMenus.create({
			id: 'paperpilot-define',
			title: 'PaperPilot: Define “%s”',
			contexts: ['selection'],
		});
		browser.contextMenus.create({
			id: 'paperpilot-arxiv',
			title: 'PaperPilot: Search arXiv for “%s”',
			contexts: ['selection'],
		});
	}

	setupContextMenus();

	browser.contextMenus.onClicked.addListener(async (info, tab) => {
		if (!info.selectionText) return;
		const q = info.selectionText.trim();
		if (info.menuItemId === 'paperpilot-define') {
			try {
				await lookupDefinition(q);
				// No direct UI from bg; content script handles overlay
			} catch (e) {
				console.error(e);
			}
		} else if (info.menuItemId === 'paperpilot-arxiv') {
			const url = `https://arxiv.org/search/?query=${encodeURIComponent(q)}&searchtype=all`;
			if (tab?.id) void browser.tabs.create({ url, index: tab.index ? tab.index + 1 : undefined });
		}
	});

	// Messaging
	browser.runtime.onMessage.addListener(
		(message: BgRequest): Promise<BgResponse> =>
			new Promise(async (resolve) => {
				try {
					if (message.type === 'lookupDefinition') {
						const entries = await lookupDefinition(message.term);
						resolve({ ok: true, type: 'lookupDefinition', entries });
						return;
					}
					if (message.type === 'searchArxiv') {
						const prefs = await getPreferences();
						const results = await searchArxiv(message.query, prefs.arxivMaxResults);
						resolve({ ok: true, type: 'searchArxiv', results });
						return;
					}
					resolve({ ok: false, error: 'Unknown request' });
				} catch (err) {
					resolve({ ok: false, error: err instanceof Error ? err.message : 'Unknown error' });
				}
			}),
	);
});
