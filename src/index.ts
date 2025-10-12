import { extractPageData, getHTML } from "./crawl.js";

async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error("usage: npm run start <page_url>");
        process.exit(1);
    }
    const baseURL = args[0];
    console.log(`starting crawl of: ${baseURL}...`);
    const page = await getHTML(baseURL);
    console.log(page)
    process.exit(0);
}

main();