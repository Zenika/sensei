# @zenika/sensei

Sensei is meant to be a replacement of [zenika-formation-framework](https://github.com/Zenika/zenika-formation-framework/),
using a simpler and newer stack. It's not up-to-par in terms of features, but it's ready for test drives.

## Usage

### Using the published Docker image 🐳

- `cd` into a training material folder (must have `Slides/slides.json` and `CahierExercices/parts.json`)
- Run `docker run -it --rm -p 8080:8080 -v $(pwd):/training-material zenika/sensei`.
- Navigate to `http://localhost:8080/slides.html` for slides and `http://localhost:8080/labs.html` for labs

### Using a Docker image built from sources 🐳

- Clone this repo and `cd` into the created folder
- `sh build.sh`
- `cd` into a training material folder (must have `Slides/slides.json` and `CahierExercices/parts.json`)
- `sh ../path/to/sensei/run.sh`
- Navigate to `http://localhost:8080/slides.html` for slides and `http://localhost:8080/labs.html` for labs

### Using Node.js

- Clone this repo and `cd` into the created folder
- `npm install`
- `npm start -- --env.material=/path/to/training-material-folder`
- Navigate to `http://localhost:8080/slides.html` for slides and `http://localhost:8080/labs.html` for labs

### Generating PDFs

- Run the web server like described above and leave it running
- `cd` into `src/pdf`
- `npm install`
- `npm run slides` to generate a PDF for the slides
- `npm run labs` to generate a PDF for the labs

⚠️ Note about slide sizing and PDF rendering: to avoid any layout inconsistencies, the `width` and `height` values present in [src/slides/slides.js](src/slides/slides.js) file must match the values of the `--size` parameter in the `slides` npm script

## Reveal plugins

The following plugins are enabled: Markdown, Highlight, Zoom, Notes and Math.
Refer to [Reveal's documentation](https://revealjs.com/plugins/#built-in-plugins) for usage.

## Tip: using a shell alias

You may want to define the following alias to be able to run slides using `slides`:

```
alias slides='docker container run \
  --interactive \
  --tty \
  --rm \
  --volume $(pwd):/training-material \
  --publish 8080:8080 \
  zenika/sensei'
```
