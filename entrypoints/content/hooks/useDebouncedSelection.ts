import { useEffect, useRef, useState } from 'react';
import { debounce } from '../../../shared/utils/debounce';

export function useDebouncedSelection(enabled: boolean, delayMs = 250) {
	const [text, setText] = useState<string | null>(null);
	const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
	const update = useRef<((e: MouseEvent) => void) | null>(null);

	useEffect(() => {
		update.current = debounce((e: MouseEvent) => {
			const sel = window.getSelection()?.toString().trim();
			if (enabled && sel && sel.split(/\s+/).length === 1 && sel.length <= 50) {
				setText(sel);
				setPos({ x: e.clientX, y: e.clientY });
			} else {
				setText(null);
			}
		}, delayMs);
	}, [enabled, delayMs]);

	useEffect(() => {
		function onUp(e: MouseEvent) {
			update.current && update.current(e);
		}
		document.addEventListener('mouseup', onUp);
		return () => document.removeEventListener('mouseup', onUp);
	}, []);

	return { text, pos } as const;
}


