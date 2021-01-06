import "prismjs/themes/prism.css";
import "./labs.css";
import labs from "training-material/CahierExercices/parts.json";

const labsContainer = document.querySelector(".labs");
labsContainer.innerHTML = labs.join("\n");

let coverPageContainer = labsContainer.querySelector(":root div:first-of-type");

let versionSpan = document.createElement("span");
versionSpan.className = 'version';
versionSpan.innerHTML = MATERIAL_VERSION;

coverPageContainer.appendChild(versionSpan);
