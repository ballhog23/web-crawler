import pLimit from "p-limit";
import { extractPageData, normalizeURL } from "../crawl";

export class ConcurrentCrawler {
    baseURL: string;
    pages: Pages;
    limit: ReturnType<typeof pLimit>

    constructor(
        baseURL: string,
        pages: Pages,
        limit: ReturnType<typeof pLimit> = pLimit(10),
    ) {
        this.baseURL = baseURL;
        this.pages = pages;
        this.limit = limit;
    }

    private addPageVisit(normalizedURL: string): boolean {
        const value = this.pages.get(normalizedURL) ?? 1;

        if (this.pages.has(normalizedURL)) {
            this.pages.set(normalizedURL, (value + 1));
            return false;
        }

        console.log(`crawling page... ${normalizedURL}`);
        this.pages.set(normalizedURL, value);
        return true;
    }

    private async getHTML(currentURL: string): Promise<string> {
        return await this.limit(async () => {
            const options: RequestInit = {
                method: "GET",
                headers: {
                    "User-Agent": 'BootCrawler/1.0',
                }
            }

            let res: Response;
            try {
                res = await fetch(currentURL, options);
            } catch (error) {
                throw new Error(`Network Error: ${error instanceof Error ? error.message : error}`);
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

    private async crawlPage(currentURL: string): Promise<void> {
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

        if (!html) {
            console.log('html is empty');
            return;
        }

        const pageData = extractPageData(html, currentURL);
        const links = pageData.outgoing_links;
        const internalLinks = links.map(async link => await this.crawlPage(link));


        await Promise.all(internalLinks);
    }

    async crawl(baseURL: string) {
        console.time("crawl_total");
        await this.crawlPage(baseURL);
        console.timeEnd("crawl_total");
        return this.pages;
    }
}

export type Pages = Map<string, number>;