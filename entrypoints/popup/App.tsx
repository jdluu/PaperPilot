import { useMemo, useState } from 'react';
import './App.css';
import { sendMessage } from '../../shared/messaging';
import type { ArxivEntry } from '../../shared/types';

function App() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ArxivEntry[]>([]);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    const res = await sendMessage({ type: 'searchArxiv', query: q.trim() });
    if (!res.ok) {
      setError(res.error);
    } else if (res.type === 'searchArxiv') {
      setResults(res.results);
    }
    setLoading(false);
  }

  return (
    <div style={{ width: 360, padding: 12 }}>
      <form onSubmit={onSearch} style={{ display: 'flex', gap: 8 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search arXiv"
          style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <button disabled={!q.trim() || loading} style={{ padding: '8px 12px', borderRadius: 8 }}>
          {loading ? '...' : 'Search'}
        </button>
      </form>
      {error && <div style={{ color: '#b91c1c', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        {results.map((r) => (
          <div key={r.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.title}</div>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 6 }}>
              {r.authors.join(', ')}
            </div>
            <div style={{ color: '#111827', fontSize: 13, marginBottom: 6 }}>
              {r.summary.slice(0, 220)}{r.summary.length > 220 ? '…' : ''}
            </div>
            <div>
              <a href={r.link} target="_blank" rel="noreferrer">Open</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
