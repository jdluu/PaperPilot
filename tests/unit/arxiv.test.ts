import { describe, it, expect } from 'vitest';
import { parseArxivAtom } from '../../shared/api/arxiv';

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/1234.5678v1</id>
    <updated>2024-08-20T12:00:00Z</updated>
    <published>2024-08-19T10:00:00Z</published>
    <title>Sample Title</title>
    <summary>Sample summary text.</summary>
    <author><name>First Author</name></author>
    <author><name>Second Author</name></author>
    <link href="http://arxiv.org/abs/1234.5678" rel="alternate" type="text/html" />
    <category term="cs.CL" />
    <category term="stat.ML" />
  </entry>
</feed>`;

describe('parseArxivAtom', () => {
  it('parses id, title, authors, link, published and categories', () => {
    const results = parseArxivAtom(SAMPLE);
    expect(results.length).toBe(1);
    const r = results[0]!;
    expect(r.id).toContain('1234.5678');
    expect(r.title).toBe('Sample Title');
    expect(r.authors).toEqual(['First Author', 'Second Author']);
    expect(r.link).toContain('http');
    expect(r.published).toBe('2024-08-19T10:00:00Z');
    expect(r.categories).toEqual(['cs.CL', 'stat.ML']);
  });
});


