export type Preferences = {
	maxDefinitions: number;
	arxivMaxResults: number;
	enableOverlayByDefault: boolean;
};

export const defaultPreferences: Preferences = {
	maxDefinitions: 2,
	arxivMaxResults: 10,
	enableOverlayByDefault: true,
};

export async function getPreferences(): Promise<Preferences> {
	const obj = await browser.storage.sync.get(defaultPreferences);
	return { ...defaultPreferences, ...(obj as Partial<Preferences>) };
}

export async function setPreferences(update: Partial<Preferences>): Promise<void> {
	await browser.storage.sync.set(update);
}


