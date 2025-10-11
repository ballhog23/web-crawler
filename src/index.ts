import { normalizeURL, getDOMFromURL, getFirstParagraphFromHTML, getH1FromHTML, getURLsFromHTML } from "./crawl.js";

async function main() {
    const inputBody = `
    <html>
        <body>
            <a href="https://blog.boot.dev">Go to Boot.dev</a>
            <a href="">Go to Boot.dev</a>
            <a href="/">Go to Boot.dev</a>
            <img src="/logo.png" alt="Boot.dev Logo" />
        </body>
    </html>`;

    console.log(getURLsFromHTML(inputBody, 'https://blog.boot.dev'))
}

main();