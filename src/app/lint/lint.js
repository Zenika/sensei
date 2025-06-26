/**
 * Regular expression to capture lines in the following format:
 * - Multiple blank lines (tabs, new lines, white space)
 * - Followed by a title starting with double # and potentially tabs, new lines, white spaces
 */
const titleLineWithEmptyLineRegex = /(?:^\s*)((##)|(<!--).*)/gm;



// Number of new lines to creates a new slide
const newLineNumber = 3;

export function clearText(text) {
    return text.replaceAll(titleLineWithEmptyLineRegex, ("\n".repeat(newLineNumber) + "$1"));
}
