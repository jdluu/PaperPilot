import { createRoot } from 'react-dom/client';
import '@/assets/overlay.css';
import { useEffect, useRef, useState } from 'react';
import { sendMessage } from '../shared/messaging';
import type { DictionaryEntry } from '../shared/types';
import { getPreferences } from '../shared/preferences';
import { useDebouncedSelection } from './content/hooks/useDebouncedSelection';
import { Overlay as OverlayView } from './content/components/Overlay';

function Overlay() {
	const [selectedText, setSelectedText] = useState<string | null>(null);
	const [definitions, setDefinitions] = useState<DictionaryEntry[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
	const [enabled, setEnabled] = useState<boolean>(true);
	const [maxDefinitions, setMaxDefinitions] = useState<number>(2);
	const containerRef = useRef<HTMLDivElement | null>(null);
  const { text, pos } = useDebouncedSelection(enabled, 250);

	useEffect(() => {
		getPreferences().then((p) => {
			setEnabled(!!p.enableOverlayByDefault);
			setMaxDefinitions(p.maxDefinitions);
		});
	}, []);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.altKey && (e.key === 'o' || e.key === 'O')) {
				setEnabled((v) => !v);
				setSelectedText(null);
				setDefinitions(null);
				setError(null);
			}
		}
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('keydown', onKey);
		};
	}, []);

	useEffect(() => {
		if (text && pos) {
			setSelectedText(text);
			setPosition(pos);
		} else {
			setSelectedText(null);
			setDefinitions(null);
			setError(null);
		}
	}, [text, pos]);

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

	if (!enabled || !position || !selectedText) return null;

	return <OverlayView term={selectedText} position={position} definitions={definitions} error={error} maxDefinitions={maxDefinitions} />;
}

export default defineContentScript({
	matches: ['<all_urls>'],
	main() {
		const host = document.createElement('div');
		host.id = 'paperpilot-overlay-root';
		const shadow = host.attachShadow?.({ mode: 'open' });
		const container = document.createElement('div');
		(shadow ?? host).appendChild(container);
		document.documentElement.appendChild(host);
		const root = createRoot(container);
		root.render(<Overlay />);
	},
});
