import { createRoot } from 'react-dom/client';
import '@/assets/overlay.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sendMessage } from '../shared/messaging';
import type { DictionaryEntry } from '../shared/types';

function Overlay() {
	const [selectedText, setSelectedText] = useState<string | null>(null);
	const [definitions, setDefinitions] = useState<DictionaryEntry[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function handleMouseUp(e: MouseEvent) {
			const sel = window.getSelection()?.toString().trim();
			if (sel && sel.split(/\s+/).length === 1 && sel.length <= 50) {
				setSelectedText(sel);
				setPosition({ x: e.clientX, y: e.clientY });
			} else {
				setSelectedText(null);
				setDefinitions(null);
				setError(null);
			}
		}
		document.addEventListener('mouseup', handleMouseUp);
		return () => document.removeEventListener('mouseup', handleMouseUp);
	}, []);

	useEffect(() => {
		async function fetchDef(term: string) {
			setError(null);
			setDefinitions(null);
			const res = await sendMessage({ type: 'lookupDefinition', term });
			if (!res.ok) {
				setError(res.error);
				return;
			}
			if (res.type === 'lookupDefinition') setDefinitions(res.entries);
		}
		if (selectedText) void fetchDef(selectedText);
	}, [selectedText]);

	if (!position || !selectedText) return null;

	return (
		<div
			ref={containerRef}
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
				fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif',
				fontSize: 14,
			}}
		>
			<div style={{ fontWeight: 600, marginBottom: 6 }}>{selectedText}</div>
			{error && <div style={{ color: '#b91c1c' }}>{error}</div>}
			{!error && !definitions && <div>Loading…</div>}
			{definitions && (
				<div style={{ display: 'grid', gap: 8 }}>
					{definitions[0]?.meanings?.slice(0, 2).map((m) => (
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

export default defineContentScript({
	matches: ['<all_urls>'],
	main() {
		const host = document.createElement('div');
		host.id = 'paperpilot-overlay-root';
		document.documentElement.appendChild(host);
		const root = createRoot(host);
		root.render(<Overlay />);
	},
});
