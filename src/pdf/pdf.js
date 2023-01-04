const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

async function urlToPdfString(url, options) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  const pdfContent = await page.pdf(options);
  browser.close();
  return pdfContent.toString("base64");
}

async function savePdfFile(filepath, url, options) {
  const pdfDir = path.dirname(filepath);
  await fs.promises.mkdir(pdfDir, { recursive: true });
  const pdfContent = await urlToPdfString(url, options);
  await fs.promises.writeFile(filepath, pdfContent, "base64");
}

if (require.main === module) {
  if (process.argv.length !== 4) {
    console.error("Usage: node pdf.js <url> <output file path>");
    return;
  }
  savePdfFile(process.argv[3], process.argv[2], {
    format: "A4",
    margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
    printBackground: true,
  }).then(() => console.log("PDF saved!"));
}
