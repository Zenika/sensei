import "prismjs/themes/prism.css";
import "./labs.css";
import labs from "training-material/CahierExercices/parts.json";
import slidesContent from "training-material/Slides/slides.json";

const labsContainer = document.querySelector(".labs");
labsContainer.innerHTML = labs.join("\n");

let coverPageContainer = labsContainer.querySelector(":root div:first-of-type");

let versionSpan = document.createElement("span");
versionSpan.className = "version";
versionSpan.innerHTML = MATERIAL_VERSION;

coverPageContainer.appendChild(versionSpan);

const convertTextToHtml = document.createElement("div");
convertTextToHtml.innerHTML = slidesContent[0];

const trainingTitle = convertTextToHtml.querySelector("section h1:first-of-type").textContent;

document.title = trainingTitle + " - Labs 👩‍🔬";
const coverPageTitle = labsContainer.querySelector(":root div:first-of-type h1:first-of-type");
coverPageTitle.textContent = trainingTitle;
