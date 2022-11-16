import "prismjs/themes/prism.css";
import "./labs.css";
import { title } from "./content.js";

const labsContainer = document.getElementById("labs-container");
const { version } = labsContainer.dataset;

// insert title
const coverPageTitle = labsContainer.querySelector(
  ":root div:first-of-type h1:first-of-type"
);
coverPageTitle.innerHTML = title;

// insert version
const versionSpan = document.createElement("span");
versionSpan.className = "version";
versionSpan.innerHTML = version;
const coverPageContainer = labsContainer.querySelector(
  ":root div:first-of-type"
);
coverPageContainer.appendChild(versionSpan);
