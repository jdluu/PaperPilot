import type { DictionaryEntry } from '../../../shared/types';

type Props = {
	term: string;
	position: { x: number; y: number };
	definitions: DictionaryEntry[] | null;
	error: string | null;
	maxDefinitions: number;
};

export function Overlay({ term, position, definitions, error, maxDefinitions }: Props) {
	return (
		<div
			style={{
				position: 'fixed',
				top: position.y + 12,
				left: position.x + 12,
				zIndex: 2147483647,
				maxWidth: 360,
				background: 'white',
				border: '1px solid #e5e7eb',
				borderRadius: 8,
				boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
				padding: 12,
				color: '#111827',
				fontFamily:
					'system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif',
				fontSize: 14,
			}}
		>
			<div style={{ fontWeight: 600, marginBottom: 6 }}>{term}</div>
			{error && <div style={{ color: '#b91c1c' }}>{error}</div>}
			{!error && !definitions && <div>Loading…</div>}
			{definitions && (
				<div style={{ display: 'grid', gap: 8 }}>
					{definitions[0]?.meanings?.slice(0, maxDefinitions).map((m) => (
						<div key={m.partOfSpeech}>
							<div style={{ fontStyle: 'italic', color: '#6b7280' }}>{m.partOfSpeech}</div>
							<ul style={{ margin: 0, paddingLeft: 18 }}>
								{m.definitions.slice(0, 2).map((d, i) => (
									<li key={i}>
										{d.definition}
										{d.example && <div style={{ color: '#6b7280' }}>“{d.example}”</div>}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			)}
		</div>
	);
}


