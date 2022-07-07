# @zenika/sensei

The compiler for our training material. Sensei is a replacement for
[zenika-formation-framework](https://github.com/Zenika/zenika-formation-framework/).

## Installation

### Using the published Docker image 🐳

- Pull the image with `docker image pull zenika/sensei`
- Create an alias `sensei`

    ```shell
    alias sensei='docker container run \
      --pull always \
      --interactive \
      --tty \
      --rm \
      --volume $(pwd):/$(basename $(pwd)) \
      --workdir /$(basename $(pwd)) \
      --publish ${SENSEI_PORT:-8080}:${SENSEI_PORT:-8080} \
      --env SENSEI_PORT \
      --cap-add=SYS_ADMIN \
      zenika/sensei'
    ```

> ⚠ When running sensei inside a Docker container, the `--material` is limited
> to descendants of the working directory.

> ⚠ If you expect to use this alias within Git Bash for Windows, prepend the
> `--volume` and `--workdir` options with an additional slash (ie `--volume
> /$(pwd):/$(basename $(pwd)) --workdir //$(basename $(pwd)`. See [known issues
> of Git for
> Windows](https://github.com/git-for-windows/build-extra/blob/main/ReleaseNotes.md#known-issues).
> This avoids the `C:/Program Files/Git/...: no such file or directory` kind of
> errors.

> ⚠ To change `SENSEI_PORT` when using this alias, use the following syntax:
> `export SENSEI_PORT=9000; sensei`. See
> [here](https://github.com/Zenika/sensei/issues/147#issuecomment-1091188979).

### Using a Docker image built from sources 🐳

- Clone this repo and `cd` into the created folder
- Build the image with `sh build.sh`
- Create the same alias as for the published Docker image but without the
  `--pull always`

> ⚠ The same warnings as for the published Docker image apply.

### Using Node.js

- Install with `npm install --global https://github.com/Zenika/sensei`

> ⚠ You may use Yarn, however it's been known to have cache issues when
> installing packages from GitHub, resulting in failures to update sensei
> correctly.

## Usage

### Help

Run `sensei --help` for available commands and options.

### Generating PDFs

- `cd` into a training material folder (must have `Slides/slides.json` and
  `Workbook/parts.json`)
- Run `sensei pdf`
- PDFs are generated inside `pdf` folder

### Serving the slides and labs

- `cd` into a training material folder (must have `Slides/slides.json` and
  `Workbook/parts.json`)
- Run `sensei serve`
- Navigate to `http://localhost:8080/`

## Material authoring

### Slides

Write slides as you would usual Reveal.js slides. Refer to [Reveal's
documentation](https://revealjs.com/) for features. Note that the following
plugins are enabled:
 - Markdown
 - Highlight
 - Zoom
 - Notes
 - Math

### Workbook

Write the workbook as you would a usual markdown document.

> ℹ You may use `<!-- toc -->` to have
a table of content inserted at that place.

## Development

### Running

Install dependencies (`npm i`) then use `npm start --` to run the CLI (eg `npm
start -- serve --material=./training-material` where `./training-material`
points to directory with training material in it). You may alternatively use
`npm run dev --` instead to enable restart on change (eg `npm run dev -- serve
--material=./training-material`).

### Source file structure

- `src/app`: source code for the web app that embeds training material
- `src/build`: source code that builds the previously mentioned web app,
  including the training material
- `src/pdf`: source code that builds PDFs from the training material
- `src/cli`: source code for the CLI

### Code formating

This project uses Prettier. Don't forget to format before committing! You may
use `npm run prettier:write` to do that.
