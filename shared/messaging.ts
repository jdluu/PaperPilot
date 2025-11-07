import type { BgRequest, BgResponse } from './types';

export async function sendMessage<T extends BgRequest>(message: T): Promise<BgResponse> {
	const response = await browser.runtime.sendMessage(message);
	if (!response) {
		return { ok: false, error: 'Failed to communicate with background script' };
	}
	return response as BgResponse;
}


