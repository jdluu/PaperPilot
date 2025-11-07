import type { ArxivEntry } from '../../shared/types';
const cache = new Map<string, { at: number; data: ArxivEntry[] }>();

export async function searchArxiv(query: string, maxResults = 10): Promise<ArxivEntry[]> {
	const key = query.trim().toLowerCase();
	const now = Date.now();
	const cached = cache.get(key);
	if (cached && now - cached.at < 60_000) return cached.data;
	const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
		key,
	)}&start=0&max_results=${maxResults}`;
	const res = await fetch(url, { headers: { Accept: 'application/atom+xml' } });
	if (!res.ok) throw new Error(`arXiv error ${res.status}`);
	const text = await res.text();
	const parsed = parseArxivAtom(text);
	cache.set(key, { at: now, data: parsed });
	return parsed;
}

export function parseArxivAtom(atom: string): ArxivEntry[] {
	// Parse XML without DOMParser (for service worker compatibility)
	const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
	const entries: ArxivEntry[] = [];
	let match;

	while ((match = entryRegex.exec(atom)) !== null) {
		const entryXml = match[1];
		
		// Extract ID
		const idMatch = entryXml.match(/<id>(.*?)<\/id>/);
		const id = idMatch?.[1] ?? '';
		
		// Extract title
		const titleMatch = entryXml.match(/<title[^>]*>(.*?)<\/title>/);
		const title = (titleMatch?.[1] ?? '').trim();
		
		// Extract summary
		const summaryMatch = entryXml.match(/<summary[^>]*>(.*?)<\/summary>/);
		const summary = (summaryMatch?.[1] ?? '').trim();
		
		// Extract authors
		const authorMatches = entryXml.matchAll(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g);
		const authors = Array.from(authorMatches, m => m[1]).filter(Boolean);
		
		// Extract link (prefer text/html type)
		// Try href first, then type
		let linkMatches = entryXml.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*type=["']text\/html["'][^>]*\/?>/g);
		let htmlLink = Array.from(linkMatches, m => m[1])[0];
		// Try type first, then href (different attribute order)
		if (!htmlLink) {
			linkMatches = entryXml.matchAll(/<link[^>]*type=["']text\/html["'][^>]*href=["']([^"']+)["'][^>]*\/?>/g);
			htmlLink = Array.from(linkMatches, m => m[1])[0];
		}
		const link = htmlLink || id.replace(/\/abs\//, '/pdf/').replace(/v\d+$/, '');
		
		// Extract published date
		const publishedMatch = entryXml.match(/<published>(.*?)<\/published>/);
		const published = publishedMatch?.[1];
		
		// Extract categories
		const categoryMatches = entryXml.matchAll(/<category[^>]*term=["']([^"']+)["'][^>]*\/?>/g);
		const categories = Array.from(categoryMatches, m => m[1]).filter(Boolean);
		
		if (id && title) {
			entries.push({
				id,
				title,
				summary,
				authors,
				link,
				published,
				categories,
			});
		}
	}
	
	return entries;
}


