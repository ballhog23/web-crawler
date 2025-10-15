import pLimit from "p-limit";
import { extractPageData, normalizeURL } from "../crawl";

export class ConcurrentCrawler {
    private baseURL: string;
    private pages: Pages;
    private limit: ReturnType<typeof pLimit>;
    private maxPages: number;
    private shouldStop: boolean = false;
    private allTasks = new Set<Promise<void>>();
    private abortController = new AbortController();
    private visited = new Set<string>();

    constructor(
        baseURL: string,
        maxConcurreny: number = 5,
        maxPages: number = 1000
    ) {
        this.baseURL = baseURL;
        this.pages = new Map();
        this.limit = pLimit(maxConcurreny);
        this.maxPages = Math.max(1, maxPages);
    }

    async crawl(baseURL: string): Promise<Pages> {
        console.time("crawl_total");

        const rootTask = this.crawlPage(baseURL);
        this.allTasks.add(rootTask);
        try {
            await rootTask;
        } finally {
            this.allTasks.delete(rootTask);
        }
        await Promise.allSettled(Array.from(this.allTasks));

        console.timeEnd("crawl_total");
        return this.pages;
    }

    private async crawlPage(currentURL: string): Promise<void> {
        if (this.shouldStop) return;

        const currentURLHost = new URL(currentURL).hostname;
        const baseURLHost = new URL(this.baseURL).hostname;

        if (currentURLHost !== baseURLHost) return;

        const normalizedURL = normalizeURL(currentURL)
        const visitedFirstTime = this.addPageVisit(normalizedURL);

        if (!visitedFirstTime) return;

        let html;
        try {
            html = await this.getHTML(currentURL);
        } catch (error) {
            console.error(`${error instanceof Error ? error.message : `fetching HTML from URL: ${currentURL}`}`);
            return;
        }

        if (this.shouldStop) return;

        if (!html) {
            console.log('html is empty');
            return;
        }

        const pageData = extractPageData(html, currentURL);
        const links = pageData.outgoing_links;
        const crawlPromises: Promise<void>[] = [];

        for (const link of links) {
            if (this.shouldStop) break;

            const crawlPromise = this.crawlPage(link);
            this.allTasks.add(crawlPromise);
            crawlPromise.finally(() => this.allTasks.delete(crawlPromise));
            crawlPromises.push(crawlPromise)
        }

        await Promise.all(crawlPromises);
    }

    private async getHTML(currentURL: string): Promise<string> {
        console.log('fetching HTML for: ', currentURL);
        return await this.limit(async () => {
            const options: RequestInit = {
                method: "GET",
                headers: {
                    "User-Agent": 'BootCrawler/1.0',
                },
                signal: this.abortController.signal
            }

            let res: Response;
            try {
                res = await fetch(currentURL, options);
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    throw new Error(`Aborting in-flight request`);
                } else {
                    throw new Error(`Network Error: ${error instanceof Error ? error.message : error}`);
                }
            }

            if (res.status > 399) {
                console.log(`Got HTTP error: ${res.status} ${res.statusText}`, currentURL);
                return '';
            }

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('text/html')) {
                console.error(`Got non-HTML response: ${contentType}`);
                return '';
            }

            const body = await res.text();
            return body;
        });
    }

    private addPageVisit(normalizedURL: string): boolean {
        if (this.shouldStop) return false;

        const count = this.pages.get(normalizedURL) ?? 1;
        if (this.pages.has(normalizedURL)) {
            this.pages.set(normalizedURL, (count + 1));
            return false;
        }

        this.visited.add(normalizedURL);
        console.log('VISITED SIZE: ', this.visited.size)

        if (this.visited.size >= this.maxPages) {
            this.shouldStop = true;
            console.log("Reached maximum number of pages to crawl.");
            this.abortController.abort();
            return false;
        }

        this.pages.set(normalizedURL, count);
        console.log(`crawling page... ${normalizedURL}`);
        return true;
    }
}

export type Pages = Map<string, number>;