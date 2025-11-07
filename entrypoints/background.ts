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
				// Handle tab ID -1 (PDF viewer or special pages) by getting active tab
				let targetTabId = tab?.id;
				if (targetTabId === undefined || targetTabId < 0) {
					// Try to get the active tab
					const tabs = await browser.tabs.query({ active: true, currentWindow: true });
					if (tabs[0]?.id !== undefined && tabs[0].id >= 0) {
						targetTabId = tabs[0].id;
					}
				}
				
				// Send message to content script to show definition overlay
				if (targetTabId !== undefined && typeof targetTabId === 'number' && targetTabId >= 0) {
					try {
						await browser.tabs.sendMessage(targetTabId, {
							type: 'showDefinition',
							term: q,
							position: {
								x: info.pageX || 0,
								y: info.pageY || 0,
							},
						});
					} catch (sendError: any) {
						// Content script might not be loaded
						console.error('[Background] Error sending message to content script:', sendError);
					}
				} else {
					console.error('[Background] Could not find valid tab ID');
				}
			} catch (e) {
				console.error('[Background] Error handling context menu click:', e);
			}
		} else if (info.menuItemId === 'paperpilot-arxiv') {
			const url = `https://arxiv.org/search/?query=${encodeURIComponent(q)}&searchtype=all`;
			if (tab?.id !== undefined && typeof tab.id === 'number' && tab.id >= 0) {
				void browser.tabs.create({ url, index: tab.index ? tab.index + 1 : undefined });
			} else {
				// Fallback: open in new tab without index
				void browser.tabs.create({ url });
			}
		}
	});

	// Messaging
	console.log('[Background] Registering message listener...');
	browser.runtime.onMessage.addListener((message: BgRequest, sender, sendResponse) => {
		console.log('[Background] Received message:', message, 'from sender:', sender);
		
		// Handle async response
		(async () => {
			try {
				if (message.type === 'lookupDefinition') {
					console.log('[Background] Looking up definition for:', message.term);
					const entries = await lookupDefinition(message.term);
					const response = { ok: true, type: 'lookupDefinition' as const, entries };
					console.log('[Background] Sending response:', response);
					sendResponse(response);
					return;
				}
				if (message.type === 'searchArxiv') {
					console.log('[Background] Searching arXiv for:', message.query);
					const prefs = await getPreferences();
					const results = await searchArxiv(message.query, prefs.arxivMaxResults);
					const response = { ok: true, type: 'searchArxiv' as const, results };
					console.log('[Background] Sending response:', response);
					sendResponse(response);
					return;
				}
				const response = { ok: false, error: 'Unknown request' };
				console.log('[Background] Unknown request, sending:', response);
				sendResponse(response);
			} catch (err) {
				const response = { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
				console.error('[Background] Error handling message:', err);
				console.log('[Background] Sending error response:', response);
				sendResponse(response);
			}
		})();
		
		// Return true to indicate we will send a response asynchronously
		return true;
	});
	console.log('[Background] Message listener registered');
});
