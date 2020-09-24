# @zenika/sensei

Sensei is meant to be a replacement of [zenika-formation-framework](https://github.com/Zenika/zenika-formation-framework/),
using a simpler and newer stack. It's not up-to-par in terms of features, but it's ready for test drives.

## Usage

### Using the published Docker image 🐳

- `cd` into a training material folder (must have `Slides/slides.json` and `CahierExercices/parts.json`)
- Run `docker run -it --rm -p 8080:8080 -v $(pwd):/training-material zenika/sensei serve`.
- Navigate to `http://localhost:8080/slides.html` for slides and `http://localhost:8080/labs.html` for labs

### Using a Docker image built from sources 🐳

- Clone this repo and `cd` into the created folder
- `sh build.sh`
- `cd` into a training material folder (must have `Slides/slides.json` and `CahierExercices/parts.json`)
- `sh ../path/to/sensei/run.sh`
- Navigate to `http://localhost:8080/slides.html` for slides and `http://localhost:8080/labs.html` for labs

### Using Node.js

- `npm install -g sensei`
- `sensei serve /path/to/training-material-folder`
- Navigate to `http://localhost:8080/slides.html` for slides and `http://localhost:8080/labs.html` for labs

### Generating PDFs

PDFs are generated inside PDF folder from webpack bundle (dist folder)

#### Using Node.js

- `npm install -g sensei`
- `sensei pdf /path/to/training-material-folder` to generate a PDF for the slides & labs

#### Using Docker

- `cd` into a training material folder (must have `Slides/slides.json` and `CahierExercices/parts.json`)
- Run `docker run -it --rm -p 8080:8080 -v $(pwd):/training-material zenika/sensei pdf`

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
