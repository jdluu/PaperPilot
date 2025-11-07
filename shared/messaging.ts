import type { BgRequest, BgResponse } from './types';

export async function sendMessage<T extends BgRequest>(message: T): Promise<BgResponse> {
	try {
		console.log('[Messaging] Sending message:', message, 'to extension:', browser.runtime.id);
		const response = await browser.runtime.sendMessage(message);
		console.log('[Messaging] Received response:', response);
		if (!response) {
			console.error('[Messaging] Background script returned undefined. Is it running?');
			return { ok: false, error: 'Failed to communicate with background script' };
		}
		return response as BgResponse;
	} catch (err) {
		console.error('[Messaging] Error sending message to background script:', err);
		return { ok: false, error: err instanceof Error ? err.message : 'Failed to communicate with background script' };
	}
}


