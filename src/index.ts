import { ConcurrentCrawler } from "./lib/concurrent-crawler";
import { crawlSiteAsync } from './crawl';

async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error("usage: npm run start <page_url>");
        process.exit(1);
    }
    const baseURL = args[0];

    console.log(`starting crawl of: ${baseURL}...`);

    const pages = await crawlSiteAsync(baseURL);
    console.log(pages);

    process.exit(0);
}

main();