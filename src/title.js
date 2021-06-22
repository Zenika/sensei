import slidesContent from "training-material/Slides/slides.json";

const convertTextToHtml = document.createElement("div");
convertTextToHtml.innerHTML = slidesContent[0];

const trainingTitleElement = convertTextToHtml.querySelector(
  "section h1:first-of-type"
);

const trainingTitle =
  (trainingTitleElement && trainingTitleElement.textContent) ||
  "TITLE NOT FOUND (see browser console)";
if (!trainingTitleElement) {
  console.warn(
    "The title of the training was not found. Please ensure that the slides include a first level title (e.g. '# My title' or '<h1>My title</h1>') in the first file referenced in 'Slides/slides.json'."
  );
}

export { trainingTitle };
