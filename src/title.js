import slidesContent from "training-material/Slides/slides.json";

const convertTextToHtml = document.createElement("div");
convertTextToHtml.innerHTML = slidesContent[0];

const trainingTitleElement = convertTextToHtml.querySelector(
  "section h1:first-of-type"
);

const trainingTitle =
  (trainingTitleElement && trainingTitleElement.textContent) ||
  "{Training Title}";

export { trainingTitle };
