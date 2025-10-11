import { expect, test } from 'vitest';
import { getFirstParagraphFromHTML, getDOMFromURL, getH1FromHTML } from './crawl.js';

// test.each([
//     { url: '', expected: 'URL string is empty' },
//     { url: 'https://blog.boot.dev/path/', expected: 'blog.boot.dev/path' },
//     { url: 'https://blog.boot.dev/path', expected: 'blog.boot.dev/path' },
//     { url: 'http://blog.boot.dev/path/', expected: 'blog.boot.dev/path' },
//     { url: 'http://blog.boot.dev/path', expected: 'blog.boot.dev/path' },
// ])('normalizeURL($url) -> $expected', ({ url, expected }) => {
//     if (expected.includes('URL string is empty')) {
//         expect(() => normalizeURL(url)).toThrowError(expected)
//     } else {
//         expect(normalizeURL(url)).toBe(expected);
//     }
// })

// h1s
test.each([
    { dom: '', expected: 'HTML string is empty' }, // error test
    {
        dom: '<h2>no h1</h2><h3>nope</h3>',
        expected: '' // elements not present
    },
    // {
    //     dom: '<!DOCTYPE html><html lang="en"><head></head><body><main><H1>Hello World</h1></main></body></html>',
    //     expected: 'hello world' // match becase of capitials converted to lowercase
    // },
    {
        dom: '<!DOCTYPE html><html lang="en"><head></head><body><main><h1>Hello World</h1></main></body></html>',
        expected: 'hello world' // match h1
    }
])('getH1FromHTML($dom) -> $expected', ({ dom, expected }) => {
    if (expected.includes('HTML string is empty')) {
        expect(() => getH1FromHTML(dom)).toThrowError(expected as string)
    } else {
        expect(getH1FromHTML(dom)).toBe(expected);
    }
})

// paragraphs
test.each([
    { html: '', expected: 'HTML string is empty' }, // error test
    {
        html: '<h2>no h1</h2><h3>nope</h3>',
        expected: '' // elements not present
    },
    // {
    //     html: '<!DOCTYPE html><html lang="en"><head></head><body><main><P>Yo yo!</P></main></body></html>',
    //     expected: 'yo yo!' // match becase of capitials converted to lowercase
    // },
    {
        html: '<!DOCTYPE html><html lang="en"><head></head><body><main><p>Hello World</p><p>second p</p></main></body></html>',
        expected: 'hello world'// match first p
    }
])('getFirstParagraphFromHTML($dom) -> $expected', ({ html, expected }) => {
    if (expected.includes('HTML string is empty')) {
        expect(() => getFirstParagraphFromHTML(html)).toThrowError(expected as string)
    } else {
        expect(getFirstParagraphFromHTML(html)).toBe(expected);
    }
})