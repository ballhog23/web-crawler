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

export async function getDOMFromURL(url: string) {
    if (url.length === 0) throw new Error('Provide a URL, then try again.');

    let dom = null;
    try {
        dom = await JSDOM.fromURL(url);
    } catch (error) {
        console.log(`${error instanceof Error ? error.message : error}`);
    }

    return dom?.serialize() || '';
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
        if (images.length === 0) return [];

        images.forEach(img => {
            const src = img.getAttribute('src');
            if (!src) return;

            try {
                const url = new URL(src, baseURL).toString();
                srcs.push(url);
            } catch (err) {
                console.error(`invalid src '${src}':`, err);
            }
        })

    } catch (err) {
        console.error("failed to parse HTML:", err);
    }

    return srcs;
}