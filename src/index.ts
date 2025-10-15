import { crawlSiteAsync } from './crawl';

async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 3) {
        console.error("usage: npm run start <URL> <maxConcurrency> <maxPages>");
        process.exit(1);
    }
    const baseURL = args[0];
    const maxConcurrency = Number(args[1]);
    const maxPages = Number(args[2]);

    if (!Number.isFinite(maxConcurrency) || maxConcurrency <= 0) {
        console.log("invalid maxConcurrency");
        process.exit(1);
    }

    if (!Number.isFinite(maxPages) || maxPages <= 0) {
        console.log("invalid maxPages");
        process.exit(1);
    }

    console.log(`starting crawl of: ${baseURL}...`);

    const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);
    console.log(pages);

    process.exit(0);
}

main();