const test = require("node:test");
const assert = require("node:assert");
const readline = require("readline");
const { containsAnyError } = require("./lint");
const { Readable } = require("node:stream");

test("Lint - Contains any error should return false using a title that follows 3 empty lines.", async () => {
  const content = `
    # Titre de la formation



    ## Sommaire
    `;

  const actual = await containsAnyError(createReadStream(content));
  assert.strictEqual(actual, false);
});

test("Lint - Contains any error should return true using a title that not follows 3 empty lines.", async () => {
  const content = `
  # Titre de la formation
  
  ## Sommaire
  `;

  const actual = await containsAnyError(createReadStream(content));
  assert.strictEqual(actual, true);
});

test("Lint - Contains any error should return false using a specific html comment that follows 3 empty lines.", async () => {
  const content = `
    # Titre de la formation


    
    <!-- .slide: class="page-title" -->
    `;

  const actual = await containsAnyError(createReadStream(content));
  assert.strictEqual(actual, false);
});

test("Lint - Contains any error should return true using a specific html comment that not follows 3 empty lines.", async () => {
  const content = `
    # Titre de la formation

    <!-- .slide: class="page-title" -->
    `;

  const actual = await containsAnyError(createReadStream(content));
  assert.strictEqual(actual, true);
});

test("Lint - Contains any error should return true using 2 specifics html comment that not follows 3 empty lines.", async () => {
  const content = `
    # Titre de la formation

    <!-- .slide: class="page-title" -->

    <!-- .slide: class="page-title" -->
    `;

  const actual = await containsAnyError(createReadStream(content));
  assert.strictEqual(actual, true);
});

function createReadStream(content) {
  return readline.createInterface({
    input: Readable.from(content),
  });
}
