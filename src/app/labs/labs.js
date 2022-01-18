import "prismjs/themes/prism.css";
import "./labs.css";

const labsContainer = document.getElementById("labs-container");
const { title, version } = labsContainer.dataset;

// insert title
const coverPageTitle = labsContainer.querySelector(
  ":root div:first-of-type h1:first-of-type"
);
coverPageTitle.textContent = title;

// insert version
const versionSpan = document.createElement("span");
versionSpan.className = "version";
versionSpan.innerHTML = version;
const coverPageContainer = labsContainer.querySelector(
  ":root div:first-of-type"
);
coverPageContainer.appendChild(versionSpan);
