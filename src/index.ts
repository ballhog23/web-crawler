import { normalizeURL, getDOMFromURL, getFirstParagraphFromHTML, getH1FromHTML } from "./crawl.js";

async function main() {
    const normalizedURL = normalizeURL('https://calebpirkle.com/');
    const url = `https://${normalizedURL}`;
    const parsed = await getDOMFromURL(url);
    if (!parsed) throw new Error('unable to parse html');
    getH1FromHTML(parsed);
    getFirstParagraphFromHTML(parsed);
}

main();