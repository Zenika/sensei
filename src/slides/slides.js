import reveal from "reveal.js/dist/reveal.js";
import revealPluginNotes from "reveal.js/plugin/notes/notes.js";
import revealPluginZoom from "reveal.js/plugin/zoom/zoom.js";
import revealPluginMathJax from "reveal.js/plugin/math/math.js";
import "reveal.js/dist/reveal.css";
import "prismjs/themes/prism.css";
import "./slides.css";
import "training-material/Slides/resources/custom.css";
import slidesContent from "training-material/Slides/slides.json";
import { trainingTitle } from "../title.js";

const slideContainer = document.querySelector(".slides");
slideContainer.innerHTML = slidesContent.join("\n");

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
  keyboard: {
    37: function leftArrow() {
      if (isRemoteMode()) Reveal.prev();
      else Reveal.left();
    },
    38: function upArrow() {
      if (isRemoteMode()) Reveal.prev();
      else Reveal.up();
    },
    39: function rightArrow() {
      if (isRemoteMode()) Reveal.next();
      else Reveal.right();
    },
    40: function downArrow() {
      if (isRemoteMode()) Reveal.next();
      else Reveal.down();
    },
    82: function rKey() {
      toggleRemoteMode();
    },
  },
  margin: 0,
  width: SLIDE_WIDTH,
  height: SLIDE_HEIGHT,
  plugins: [revealPluginMathJax, revealPluginNotes, revealPluginZoom],
  math: {
    tex2jax: { inlineMath: [["\\(", "\\)"]] },
  },
});

function hasRemoteQueryParameter() {
  return window.location.search.match(/[?&]remote[&]?/i);
}

function isRemoteMode() {
  return Reveal.isOverview() ? false : hasRemoteQueryParameter();
}

function enableRemoteMode() {
  window.location.search += window.location.search.match(/[?]/)
    ? "&remote"
    : "?remote";
}

function disableRemoteMode() {
  window.location.search = window.location.search
    .replace(/[?]remote[&]/i, "?")
    .replace(/[?]remote/i, "")
    .replace(/[&]remote[&]/i, "&")
    .replace(/[&]remote$/i, "");
}

function toggleRemoteMode() {
  if (hasRemoteQueryParameter()) disableRemoteMode();
  else enableRemoteMode();
}
