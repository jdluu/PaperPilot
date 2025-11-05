import type { BgRequest, BgResponse } from './types';

export function sendMessage<T extends BgRequest>(message: T) {
	return browser.runtime.sendMessage(message) as Promise<BgResponse>;
}


