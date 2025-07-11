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

test("Lint - Contains any error should return false using a sub-title with 3 or more '#'", async () => {
  const content = `
  ## Sub title
  
  ### Sub sub title

  #### Sub sub sub title
  `;

  const actual = await containsAnyError(createReadStream(content));
  assert.strictEqual(actual, false);
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

    <!-- .slide: class="page-new" -->
    `;

  const actual = await containsAnyError(createReadStream(content));
  assert.strictEqual(actual, true);
});

test("Lint - Contains any error should return true using 2 specifics html comment that not follows 3 empty lines.", async () => {
  const content = `
    # Titre de la formation

    <!-- .slide: class="page-new" -->

    <!-- .slide: class="page-new" -->
    `;

  const actual = await containsAnyError(createReadStream(content));
  assert.strictEqual(actual, true);
});

// page-title is an exception that do not trigger an error
test("Lint - Contains any error should return false using html comment that with class 'page-title'.", async () => {
  const content = `
    # Titre de la formation

    <!-- .slide: class="page-title" -->
    `;

  const actual = await containsAnyError(createReadStream(content));
  assert.strictEqual(actual, false);
});

function createReadStream(content) {
  return readline.createInterface({
    input: Readable.from(content),
  });
}
