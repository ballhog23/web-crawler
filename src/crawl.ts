import { URL } from "node:url";
import { JSDOM } from 'jsdom';

export function normalizeURL(urlString: string) {
    if (urlString.length === 0) {
        throw new Error('URL string is empty');
    }

    const url = new URL(urlString);
    const { hostname, pathname } = url;
    let fullpath = `${hostname}${pathname}`;

    if (pathname[pathname.length - 1] === '/') {
        fullpath = `${hostname}${pathname.slice(0, pathname.length - 1)}`;
    }

    return fullpath;
}

export async function crawlPage(baseURL: string, currentURL: string, pages: Map<string, number> = new Map()) {
    const currentURLHost = new URL(currentURL).hostname;
    const baseURLHost = new URL(baseURL).hostname;

    if (currentURLHost !== baseURLHost) return pages;

    const normalCurURL = normalizeURL(currentURL);
    const value = pages.get(normalCurURL) ?? 1;

    if (pages.has(normalCurURL)) {
        pages.set(normalCurURL, (value + 1));
        return pages;
    }

    console.log(`crawling page... ${currentURL}`);
    pages.set(normalCurURL, value);


    const html = await getHTML(currentURL);
    if (!html) {
        console.error(`Error fetching HTML from URL: ${currentURL}`);
        return pages;
    }

    const pageData = extractPageData(html, currentURL);
    const links = pageData.outgoing_links;

    if (links.length === 0) return pages;

    for (const link of links) {
        await crawlPage(baseURL, link, pages)
    }

    return pages;
}

export async function getHTML(url: string) {
    const options: RequestInit = {
        method: "GET",
        headers: {
            "User-Agent": 'BootCrawler/1.0',
            "content-type": "text/html"
        }
    }

    let res;
    try {
        res = await fetch(url, options);
    } catch (error) {
        throw new Error(`Network Error: ${error instanceof Error ? error.message : error}`);
    }

    if (res.status > 399) {
        console.log(`Got HTTP error: ${res.status} ${res.statusText}`, url);
        return;
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
        console.error(`Got non-HTML response: ${contentType}`);
        return;
    }

    return await res.text();
}

export function getH1FromHTML(html: string): string {
    try {
        const dom = new JSDOM(html);
        const doc = dom.window.document;
        const h1 = doc.querySelector("h1");
        return (h1?.textContent ?? "").trim();
    } catch {
        return "";
    }
}

export function getFirstParagraphFromHTML(html: string): string {
    try {
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const main = doc.querySelector("main");
        const p = main?.querySelector("p") ?? doc.querySelector("p");
        return (p?.textContent ?? "").trim();
    } catch {
        return "";
    }
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
    const urls: string[] = [];

    try {
        const dom = new JSDOM(html);
        const doc = dom.window.document;
        const anchors = doc.querySelectorAll('a');

        if (anchors.length === 0) return urls;

        anchors.forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;

            try {
                const url = new URL(href, baseURL).toString();
                urls.push(url);
            } catch (err) {
                console.error(`invalid href '${href}':`, err);
            }
        });

        return urls;

    } catch (err) {
        console.error("failed to parse HTML:", err);
    }

    return urls;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
    const srcs: string[] = [];

    try {
        const dom = new JSDOM(html);
        const doc = dom.window.document;
        const images = doc.querySelectorAll('img');

        images.forEach(img => {
            const src = img.getAttribute('src');
            if (!src) return;

            try {
                const url = new URL(src, baseURL).toString();
                srcs.push(url);
            } catch (err) {
                console.error(`${err instanceof Error ? err.message : err}`)
                console.error(`invalid src '${src}':`, err);
            }
        });
    } catch (err) {
        console.error("failed to parse HTML:", err);
    }

    return srcs;
}

export function extractPageData(html: string, pageURL: string): ExtractedPageData {
    console.log(`extracted page data successfully...`);
    return {
        url: pageURL,
        h1: getH1FromHTML(html),
        first_paragraph: getFirstParagraphFromHTML(html),
        outgoing_links: getURLsFromHTML(html, pageURL),
        image_urls: getImagesFromHTML(html, pageURL)
    }
}

export type ExtractedPageData = {
    url: string,
    h1: string,
    first_paragraph: string,
    outgoing_links: string[],
    image_urls: string[],
}