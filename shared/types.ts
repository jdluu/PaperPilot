export type DictionaryMeaning = {
	partOfSpeech: string;
	definitions: { definition: string; example?: string }[];
};

export type DictionaryEntry = {
	word: string;
	phoenetics?: { text?: string; audio?: string }[];
	meanings: DictionaryMeaning[];
};

export type ArxivEntry = {
	id: string;
	title: string;
	summary: string;
	authors: string[];
	link: string;
};

export type BgRequest =
	| { type: 'lookupDefinition'; term: string }
	| { type: 'searchArxiv'; query: string };

export type BgResponse =
	| { ok: true; type: 'lookupDefinition'; entries: DictionaryEntry[] }
	| { ok: true; type: 'searchArxiv'; results: ArxivEntry[] }
	| { ok: false; error: string };


