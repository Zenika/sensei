const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

async function urlToPdfString(url, options) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const pdfContent = await page.pdf(options);
  browser.close();
  return pdfContent.toString("base64");
}

async function savePdfFile(filepath, url, options) {
  const pdfDir = path.dirname(filepath);
  try {
    await fs.promises.access(pdfDir, fs.constants.F_OK);
  } catch {
    await fs.promises.mkdir(pdfDir);
  }
  const pdfContent = await urlToPdfString(url, options);
  await fs.promises.writeFile(filepath, pdfContent, "base64");
}

if (require.main === module) {
  if (process.argv.length !== 4) {
    console.error("Usage: node pdf.js <url> <output file path>");
    return;
  }
  savePdfFile(process.argv[3], process.argv[2]).then(() =>
    console.log("Done!")
  );
}
