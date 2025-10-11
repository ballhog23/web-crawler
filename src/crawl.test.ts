import { expect, test } from 'vitest';
import { normalizeURL } from './crawl.js';

test.each([
    { url: '', expected: 'URL string is empty' },
    { url: 'https://blog.boot.dev/path/', expected: 'blog.boot.dev/path' },
    { url: 'https://blog.boot.dev/path', expected: 'blog.boot.dev/path' },
    { url: 'http://blog.boot.dev/path/', expected: 'blog.boot.dev/path' },
    { url: 'http://blog.boot.dev/path', expected: 'blog.boot.dev/path' },
])('normalizeURL($url) -> $expected', ({ url, expected }) => {
    if (expected.includes('URL string is empty')) {
        expect(() => normalizeURL(url)).toThrowError(expected)
    } else {
        expect(normalizeURL(url)).toBe(expected);
    }
})