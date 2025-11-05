import type { ArxivEntry } from '../../shared/types';
const cache = new Map<string, { at: number; data: ArxivEntry[] }>();

export async function searchArxiv(query: string): Promise<ArxivEntry[]> {
	const key = query.trim().toLowerCase();
	const now = Date.now();
	const cached = cache.get(key);
	if (cached && now - cached.at < 60_000) return cached.data;
	const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
		key,
	)}&start=0&max_results=10`;
	const res = await fetch(url, { headers: { Accept: 'application/atom+xml' } });
	if (!res.ok) throw new Error(`arXiv error ${res.status}`);
	const text = await res.text();
	const parsed = parseArxivAtom(text);
	cache.set(key, { at: now, data: parsed });
	return parsed;
}

export function parseArxivAtom(atom: string): ArxivEntry[] {
	const parser = new DOMParser();
	const doc = parser.parseFromString(atom, 'application/xml');
	const entries = Array.from(doc.getElementsByTagName('entry'));
	return entries.map((e) => ({
		id: e.getElementsByTagName('id')[0]?.textContent ?? '',
		title: (e.getElementsByTagName('title')[0]?.textContent ?? '').trim(),
		summary: (e.getElementsByTagName('summary')[0]?.textContent ?? '').trim(),
		authors: Array.from(e.getElementsByTagName('author')).map(
			(a) => a.getElementsByTagName('name')[0]?.textContent ?? '',
		),
		link:
			Array.from(e.getElementsByTagName('link')).find(
				(l) => l.getAttribute('type') === 'text/html',
			)?.getAttribute('href') ?? e.getElementsByTagName('id')[0]?.textContent ?? '',
	}));
}


