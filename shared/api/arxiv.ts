import type { ArxivEntry } from '../../shared/types';

export async function searchArxiv(query: string): Promise<ArxivEntry[]> {
	const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
		query,
	)}&start=0&max_results=10`;
	const res = await fetch(url, { headers: { Accept: 'application/atom+xml' } });
	if (!res.ok) throw new Error(`arXiv error ${res.status}`);
	const text = await res.text();
	return parseArxivAtom(text);
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


