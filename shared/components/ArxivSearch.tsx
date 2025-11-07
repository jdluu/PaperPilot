import { useState } from 'react';
import { sendMessage } from '../messaging';
import type { ArxivEntry } from '../types';

type Props = {
	onClose?: () => void;
};

export function ArxivSearch({ onClose }: Props) {
	const [q, setQ] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [results, setResults] = useState<ArxivEntry[]>([]);

	async function onSearch(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResults([]);
		console.log('Sending search message:', { type: 'searchArxiv', query: q.trim() });
		const res = await sendMessage({ type: 'searchArxiv', query: q.trim() });
		console.log('Received response:', res);
		if (!res) {
			setError('Failed to communicate with background script');
		} else if (!res.ok) {
			setError(res.error);
		} else if (res.type === 'searchArxiv') {
			setResults(res.results);
		}
		setLoading(false);
	}

	return (
		<div
			style={{
				...(onClose
					? {
							position: 'fixed',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							zIndex: 2147483647,
							width: 480,
							maxHeight: '80vh',
							boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
						}
					: {
							width: '100%',
							maxHeight: 'none',
						}),
				background: 'white',
				border: '1px solid #e5e7eb',
				borderRadius: 12,
				padding: 20,
				color: '#111827',
				fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif',
				fontSize: 14,
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
			}}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
				<h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Search arXiv</h2>
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						style={{
							background: 'none',
							border: 'none',
							fontSize: 24,
							cursor: 'pointer',
							padding: 0,
							width: 28,
							height: 28,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							borderRadius: 4,
							color: '#6b7280',
						}}
					>
						×
					</button>
				)}
			</div>
			<form onSubmit={onSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
				<input
					value={q}
					onChange={(e) => setQ(e.target.value)}
					placeholder="Search arXiv papers..."
					style={{
						flex: 1,
						padding: '10px 12px',
						borderRadius: 8,
						border: '1px solid #e5e7eb',
						fontSize: 14,
					}}
					autoFocus
				/>
				<button
					type="submit"
					disabled={!q.trim() || loading}
					style={{
						padding: '10px 20px',
						borderRadius: 8,
						background: '#2563eb',
						color: 'white',
						border: 'none',
						cursor: loading || !q.trim() ? 'not-allowed' : 'pointer',
						opacity: loading || !q.trim() ? 0.5 : 1,
						fontSize: 14,
						fontWeight: 500,
					}}
				>
					{loading ? '...' : 'Search'}
				</button>
			</form>
			{error && (
				<div style={{ color: '#b91c1c', marginBottom: 12, padding: 8, background: '#fee2e2', borderRadius: 6 }}>
					{error}
				</div>
			)}
			<div
				style={{
					flex: 1,
					overflowY: 'auto',
					display: 'grid',
					gap: 12,
				}}
			>
				{results.map((r) => (
					<div
						key={r.id}
						style={{
							border: '1px solid #e5e7eb',
							borderRadius: 8,
							padding: 12,
							background: '#f9fafb',
						}}
					>
						<div style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>{r.title}</div>
						<div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>
							{r.authors.join(', ')}
						</div>
						<div style={{ color: '#111827', fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>
							{r.summary.slice(0, 200)}{r.summary.length > 200 ? '…' : ''}
						</div>
						<div>
							<a
								href={r.link}
								target="_blank"
								rel="noreferrer"
								style={{
									color: '#2563eb',
									textDecoration: 'none',
									fontSize: 13,
									fontWeight: 500,
								}}
							>
								Open paper →
							</a>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

