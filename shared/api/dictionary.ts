import type { DictionaryEntry } from '../../shared/types';

const cache = new Map<string, { at: number; data: DictionaryEntry[] }>();

export async function lookupDefinition(term: string): Promise<DictionaryEntry[]> {
	const key = term.toLowerCase();
	const now = Date.now();
	const cached = cache.get(key);
	if (cached && now - cached.at < 60_000) return cached.data;

	const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
		key,
	)}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Dictionary error ${res.status}`);
	const json = (await res.json()) as unknown as DictionaryEntry[];
	cache.set(key, { at: now, data: json });
	return json;
}


