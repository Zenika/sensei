# @zenika/sensei

⚠️ THIS IS A VERY EARLY PROTOTYPE

Sensei is meant to be a replacement of [zenika-formation-framework](https://github.com/Zenika/zenika-formation-framework/),
using a simpler and newer stack.

## Usage

### Using Docker 🐳

- Clone this repo and `cd` into the created folder
- `sh build.sh`
- `cd` into a training material folder (must have `Slides/slides.json`)
- `sh ../path/to/sensei/run.sh`
- Navigate to `http://localhost:8080/slides.html` for slides and `http://localhost:8080/labs.html` for labs
- To generate a PDF of the slides, run `sh pdf.sh` while the slide server is up.

### Using Node.js

- Clone this repo and `cd` into the created folder
- `npm install`
- `npm start -- --env.material=/path/to/training-material-folder`
- Navigate to `http://localhost:8080/slides.html` for slides and `http://localhost:8080/labs.html` for labs
- To generate a PDF of the slides, run `npm run pdf` while the slide server is up.

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
