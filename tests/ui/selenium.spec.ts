import { Builder, Browser, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';

async function buildDriver(): Promise<WebDriver> {
	const browser = (process.env.BROWSER || 'chrome').toLowerCase();
	if (browser === 'chrome' || browser === 'edge') {
		const opts = new chrome.Options();
		const extPath = process.env.EXT_PATH; // path to built .output/chrome-mv3
		if (extPath) opts.addArguments(`--load-extension=${extPath}`);
		return await new Builder()
			.forBrowser(browser === 'edge' ? Browser.EDGE : Browser.CHROME)
			.setChromeOptions(opts)
			.build();
	}
	if (browser === 'firefox') {
		const opts = new firefox.Options();
		const xpi = process.env.EXT_XPI; // path to zipped xpi/zip
		if (xpi) opts.addExtensions(xpi);
		return await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(opts).build();
	}
	throw new Error('Unsupported BROWSER');
}

async function selectWord(driver: WebDriver, word: string) {
	const script = `(() => {
	  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	  while (walk.nextNode()) {
	    const node = walk.currentNode;
	    const idx = node.nodeValue.indexOf('${word}');
	    if (idx >= 0) {
	      const range = document.createRange();
	      range.setStart(node, idx);
	      range.setEnd(node, idx + '${word}'.length);
	      const sel = window.getSelection();
	      sel.removeAllRanges();
	      sel.addRange(range);
	      const rect = range.getBoundingClientRect();
	      const ev = new MouseEvent('mouseup', { bubbles: true, clientX: rect.left + 5, clientY: rect.top + 5 });
	      document.dispatchEvent(ev);
	      return true;
	    }
	  }
	  return false;
	})()`;
	const ok = await driver.executeScript(script);
	if (!ok) throw new Error(`Could not select word: ${word}`);
}

async function assertOverlayAppears(driver: WebDriver, expectedTerm: string) {
	// Wait for overlay host
	await driver.wait(async () => {
		return await driver.executeScript(
			"return !!document.querySelector('#paperpilot-overlay-root');",
		);
	}, 10_000);
	// Extract text from inside shadow DOM if present
	const text = await driver.executeScript(
		`const host = document.querySelector('#paperpilot-overlay-root');
		const root = host.shadowRoot || host; 
		const div = root.querySelector('div');
		return div ? div.textContent : '';
		`,
	);
	if (typeof text !== 'string' || !text.toLowerCase().includes(expectedTerm.toLowerCase())) {
		throw new Error('Overlay did not show expected term');
	}
}

async function run() {
	const driver = await buildDriver();
	try {
		await driver.get('https://example.com');
		await driver.wait(until.elementLocated(By.css('h1')), 10_000);
		await selectWord(driver, 'Example');
		await assertOverlayAppears(driver, 'Example');
		console.log('Overlay appeared and included term text.');
	} finally {
		await driver.quit();
	}
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});


