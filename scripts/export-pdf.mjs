#!/usr/bin/env node
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import path from "node:path";

async function exportPdf(url, outputPath) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".docs-content", { timeout: 15000 });

  const cssPath = path.join(process.cwd(), "src/pdf/print.css");
  const printCss = readFileSync(cssPath, "utf8");
  await page.addStyleTag({ content: printCss });

  await page.evaluate(() => {
    document.querySelectorAll("header, nav").forEach((node) => node.remove());
    document.body.classList.add("exporting-to-pdf");
  });

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "14mm", bottom: "18mm", left: "14mm", right: "14mm" },
  });

  await browser.close();
}

async function main() {
  const [, , url, output] = process.argv;
  if (!url || !output) {
    console.error("Usage: npm run export-pdf -- <url> <output.pdf>");
    process.exit(1);
  }

  try {
    await exportPdf(url, output);
    console.log(`PDF exported to ${output}`);
  } catch (error) {
    console.error("Failed to export PDF:\n", error);
    process.exit(1);
  }
}

main();
