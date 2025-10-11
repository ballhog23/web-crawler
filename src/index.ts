import {
    normalizeURL,
    getDOMFromURL,
    getFirstParagraphFromHTML,
    getH1FromHTML,
    getURLsFromHTML,
    getImagesFromHTML
} from "./crawl.js";

async function main() {
    const inputURL = "https://blog.boot.dev";
    const inputBody =
        `<html><body>` +
        `<img src="/logo.png" alt="Logo">` +
        `<img src="https://cdn.boot.dev/banner.jpg">` +
        `</body></html>`;

    console.log(getImagesFromHTML(inputBody, inputURL))
}

main();