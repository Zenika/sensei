import "prismjs/themes/prism.css";
import "./labs.css";
import labs from "training-material/CahierExercices/parts.json";

const labsContainer = document.querySelector(".labs");
labsContainer.innerHTML = labs.join("\n");
