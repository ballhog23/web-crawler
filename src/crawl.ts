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

export function getH1FromHTML(html: string) {
    if (html.length === 0) {
        throw new Error('HTML string is empty');
    }

    const dom = new JSDOM(html);
    const h1 = dom.window.document.querySelector('h1')?.textContent.toLowerCase() || '';
    console.log('h1: ', h1)
    return h1;
}

export function getFirstParagraphFromHTML(html: string) {
    if (html.length === 0) {
        throw new Error('HTML string is empty');
    }

    const dom = new JSDOM(html);
    const p = dom.window.document.querySelector('p')?.textContent.toLowerCase() || '';
    console.log('p: ', p)
    return p;
}