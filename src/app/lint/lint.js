const titleOrCommentLinePattern = /^\s*(##.*)|(<!-- \.slide: class="page-.*)$/;
const nPreviousEmpty = 3;

function allEmpty(lines) {
  return lines.every((l) => l.trim() === "");
}

export async function containsAnyError(readStream) {
  // Buffer circulaire pour stocker les nPreviousEmpty lignes précédentes
  const prevLines = [];
  var index = 1;
  var containsError = false;

  for await (const line of readStream) {
    // Vérifie si la ligne courante match le pattern
    if (titleOrCommentLinePattern.test(line)) {
      if (!allEmpty(prevLines)) {
        console.info(
          `Il faut minimum ${nPreviousEmpty} lignes vides devant le bloc "${line}" ligne n°${index}.`
        );
        containsError = true;
      }
    }

    // Increment du nombre de ligne
    index += 1;

    // Ajoute la ligne actuelle dans le buffer, limite la taille à nPreviousEmpty
    prevLines.push(line);
    if (prevLines.length > nPreviousEmpty) {
      prevLines.shift(); // enlève la plus vieille ligne
    }
  }

  return containsError;
}
