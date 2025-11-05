import { Builder, Browser, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';

async function buildDriver() {
	const browser = (process.env.BROWSER || 'chrome').toLowerCase();
	if (browser === 'chrome' || browser === 'edge') {
		const opts = new chrome.Options();
		const extPath = process.env.EXT_PATH; // path to built .output/chrome-mv3
		if (extPath) opts.addArguments(`--load-extension=${extPath}`);
		return await new Builder().forBrowser(browser === 'edge' ? Browser.EDGE : Browser.CHROME).setChromeOptions(opts).build();
	}
	if (browser === 'firefox') {
		const opts = new firefox.Options();
		const xpi = process.env.EXT_XPI; // path to zipped xpi/zip
		if (xpi) opts.addExtensions(xpi);
		return await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(opts).build();
	}
	throw new Error('Unsupported BROWSER');
}

async function run() {
	const driver = await buildDriver();
	try {
		await driver.get('https://example.com');
		await driver.wait(until.elementLocated(By.css('h1')), 10_000);
		const title = await driver.getTitle();
		console.log('Page title:', title);
	} finally {
		await driver.quit();
	}
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});


