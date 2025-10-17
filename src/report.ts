import * as fs from "node:fs";
import * as path from "node:path";
import type { PageData } from "./lib/concurrent-crawler";

export function writeCSVReport(
    pageData: PageData,
    filename = "report.csv"
): void {
    const file = path.resolve(process.cwd(), filename);
    const headers: string[] = ["page_url", "h1", "first_paragraph", "outgoing_link_urls", "image_urls"];
    const rows: string[] = [headers.join(",")];

    for (const data of pageData.values()) {
        const url = csvEscape(data.url);
        const h1 = csvEscape(data.h1);
        const p = csvEscape(data.first_paragraph);
        const links = csvEscape(data.outgoing_links.join(';'));
        const images = csvEscape(data.image_urls.join(';'));
        const joinedData = [url, h1, p, links, images].join(',');

        rows.push(joinedData);
    }

    const formattedData = rows.join('\n');

    fs.writeFileSync(file, formattedData, { encoding: "utf-8" });
}

function csvEscape(field: string) {
    const str = field ?? "";
    const needsQuoting = /[",\n]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return needsQuoting ? `"${escaped}"` : escaped;
}