import { crawlPage } from "./crawl.js";

async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error("usage: npm run start <page_url>");
        process.exit(1);
    }
    const baseURL = args[0];
    console.log(`starting crawl of: ${baseURL}...`);
    const pages = await crawlPage(baseURL, baseURL, new Map());

    console.log(pages)
    process.exit(0);
}

main();