import { extractPageData } from "./crawl.js";

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1 || args.length > 1) {
        console.error('usage: npm run start <page_url>');
        process.exit(1);
    }

    const url = args[0];
    // extractPageData()
}

main();