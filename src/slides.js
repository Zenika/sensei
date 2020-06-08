import reveal from "reveal.js/js/reveal.js";
import revealPluginNotes from "reveal.js/plugin/notes/notes.js";
import "reveal.js/plugin/notes/notes.html";
import revealPluginZoom from "reveal.js/plugin/zoom-js/zoom.js";
import revealPluginMathJax from "reveal.js/plugin/math/math.js";
import "reveal.js/css/reveal.css";
import "prismjs/themes/prism.css";
import "./theme/theme-2017.css";
import slides from "training-material/Slides/slides.json";

const slideContainer = document.querySelector(".slides");
slideContainer.innerHTML = slides.join("\n");

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
  maxScale: 2.0,
  width: 1420,
  height: 800,
  dependencies: [
    // Zoom in and out with Alt+click
    { src: revealPluginZoom, async: true },
    // Speaker notes
    { src: revealPluginNotes, async: true },
    // MathJax
    { src: revealPluginMathJax, async: true }
  ]
});
