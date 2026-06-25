import "prismjs/themes/prism.css";
import "./labs.css";
// Optional formation-level overrides — resolved to false by webpack if absent (see webpack.config.js fallback)
import "training-material/Workbook/resources/custom.css";
import "training-material/Workbook/resources/custom.js";
import { title } from "./content.js";

// Strigo md-extended renders `> aside positive/neutral/negative` as colored blocks natively.
// marked outputs a plain <blockquote> — this transformer applies the same classes so PDF and web match.
document.querySelectorAll("blockquote").forEach(function (bq) {
  const first = bq.querySelector("p:first-child");
  if (!first) return;
  const m = first.textContent.match(/^aside (positive|neutral|negative)\s*/);
  if (!m) return;
  bq.classList.add("aside", "aside-" + m[1]);
  first.innerHTML = first.innerHTML
    .replace(/^aside (positive|neutral|negative)\s*/, "")
    .trimStart();
  if (!first.textContent.trim()) first.remove();
});

const labsContainer = document.getElementById("labs-container");
const { version } = labsContainer.dataset;

// insert title
const coverPageTitle = labsContainer.querySelector(
  ":root div:first-of-type h1:first-of-type",
);
coverPageTitle.innerHTML = title;

// insert version
const versionSpan = document.createElement("span");
versionSpan.className = "version";
versionSpan.innerHTML = version;
const coverPageContainer = labsContainer.querySelector(
  ":root div:first-of-type",
);
coverPageContainer.appendChild(versionSpan);
