import slidesContent from "training-material/Slides/slides.json";

const convertTextToHtml = document.createElement("div");
convertTextToHtml.innerHTML = slidesContent[0];

const trainingTitle = convertTextToHtml.querySelector(
  "section h1:first-of-type"
).textContent;

export { trainingTitle };
