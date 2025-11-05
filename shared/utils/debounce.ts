export function debounce<T extends (...args: any[]) => void>(fn: T, waitMs: number) {
	let id: number | null = null;
	return (...args: Parameters<T>) => {
		if (id) clearTimeout(id);
		id = setTimeout(() => fn(...args), waitMs) as unknown as number;
	};
}


