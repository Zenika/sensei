import "./index.css";
import { trainingTitle } from "./title.js";

document.title = trainingTitle + " 🎓";
const pageTitle = document.querySelector(
  ":root div:first-of-type h1:first-of-type"
);
pageTitle.textContent = trainingTitle;
