import type { DictionaryEntry } from '../../shared/types';

const cache = new Map<string, { at: number; data: DictionaryEntry[] }>();

export async function lookupDefinition(term: string): Promise<DictionaryEntry[]> {
	const key = term.toLowerCase().trim();
	const now = Date.now();
	const cached = cache.get(key);
	if (cached && now - cached.at < 60_000) return cached.data;

	// Try the full term first
	let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`;
	let res = await fetch(url);
	
	// If 404 and it's a phrase, try the first word
	if (!res.ok && res.status === 404 && key.includes(' ')) {
		const firstWord = key.split(/\s+/)[0];
		if (firstWord && firstWord !== key) {
			const cachedFirst = cache.get(firstWord);
			if (cachedFirst && now - cachedFirst.at < 60_000) return cachedFirst.data;
			
			url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(firstWord)}`;
			res = await fetch(url);
			if (res.ok) {
				const json = (await res.json()) as unknown as DictionaryEntry[];
				cache.set(firstWord, { at: now, data: json });
				return json;
			}
		}
	}
	
	if (!res.ok) {
		if (res.status === 404) {
			throw new Error(`No definition found for "${term}". Try selecting a single word.`);
		}
		throw new Error(`Dictionary error ${res.status}`);
	}
	const json = (await res.json()) as unknown as DictionaryEntry[];
	cache.set(key, { at: now, data: json });
	return json;
}


