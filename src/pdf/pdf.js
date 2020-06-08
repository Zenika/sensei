const fs = require("fs");
const puppeteer = require("puppeteer");

async function urlToPdfString(url, options) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(url);
  const pdfContent = await page.pdf(options);
  browser.close();
  return pdfContent.toString("base64");
}

async function savePdfFile(filepath, url, options) {
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
