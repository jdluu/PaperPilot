import { useEffect, useState } from 'react';
import { defaultPreferences, getPreferences, setPreferences, type Preferences } from '../../shared/preferences';

export default function App() {
	const [prefs, setPrefs] = useState<Preferences>(defaultPreferences);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		getPreferences().then(setPrefs);
	}, []);

	async function save() {
		setSaving(true);
		setSaved(false);
		await setPreferences(prefs);
		setSaving(false);
		setSaved(true);
		setTimeout(() => setSaved(false), 1200);
	}

	return (
		<div style={{ padding: 16, maxWidth: 520 }}>
			<h2>PaperPilot Preferences</h2>
			<label style={{ display: 'block', marginTop: 12 }}>
				<input
					type="checkbox"
					checked={prefs.enableOverlayByDefault}
					onChange={(e) => setPrefs({ ...prefs, enableOverlayByDefault: e.target.checked })}
				/>
				<span style={{ marginLeft: 8 }}>Enable overlay by default</span>
			</label>

			<div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
				<label style={{ flex: 1 }}>
					<div>Max definitions</div>
					<input
						type="number"
						min={1}
						max={5}
						value={prefs.maxDefinitions}
						onChange={(e) => setPrefs({ ...prefs, maxDefinitions: Math.max(1, Math.min(5, Number(e.target.value))) })}
						style={{ width: '100%', padding: '8px 10px' }}
					/>
				</label>
				<label style={{ flex: 1 }}>
					<div>arXiv max results</div>
					<input
						type="number"
						min={5}
						max={50}
						value={prefs.arxivMaxResults}
						onChange={(e) => setPrefs({ ...prefs, arxivMaxResults: Math.max(5, Math.min(50, Number(e.target.value))) })}
						style={{ width: '100%', padding: '8px 10px' }}
					/>
				</label>
			</div>

			<div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
				<button onClick={save} disabled={saving} style={{ padding: '8px 12px', borderRadius: 8 }}>
					{saving ? 'Saving…' : 'Save'}
				</button>
				{saved && <div style={{ color: '#059669', alignSelf: 'center' }}>Saved</div>}
			</div>
		</div>
	);
}


