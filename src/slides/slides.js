import reveal from "reveal.js/dist/reveal.js";
import revealPluginNotes from "reveal.js/plugin/notes/notes.js";
import revealPluginZoom from "reveal.js/plugin/zoom/zoom.js";
import revealPluginMathJax from "reveal.js/plugin/math/math.js";
import "reveal.js/dist/reveal.css";
import "prismjs/themes/prism.css";
import "./slides.css";
import slidesContent from "training-material/Slides/slides.json";

const slideContainer = document.querySelector(".slides");
slideContainer.innerHTML = slidesContent.join("\n");

const trainingTitle = slideContainer.querySelector("section h1:first-of-type").textContent;
document.title = trainingTitle + " - Slides 👩‍🏫";

for (let versionContainer of slideContainer.getElementsByClassName("version")) {
  versionContainer.innerHTML = MATERIAL_VERSION;
}

reveal.initialize({
  controls: true,
  progress: true,
  history: true,
  center: false,
  transition: "fade", // default/cube/page/concave/zoom/linear/fade/none
  backgroundTransition: "fade",
  slideNumber: false,
  mouseWheel: true,
  margin: 0,
  width: 1420,
  height: 800,
  plugins: [revealPluginMathJax, revealPluginNotes, revealPluginZoom],
});
