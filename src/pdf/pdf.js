const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

async function urlToPdf(url, options) {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.pdf(options);
  } finally {
    browser.close();
  }
}

async function generatePdf(filepath, url, options) {
  const pdfDir = path.dirname(filepath);
  await fs.promises.mkdir(pdfDir, { recursive: true });
  console.log(`Generating ${filepath}...`);
  await urlToPdf(url, {
    ...options,
    printBackground: true,
    path: filepath,
  });
}

module.exports = { generatePdf };
