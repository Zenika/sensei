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

> ⚠ To change `SENSEI_PORT` when using this alias, use the following syntax:
> `export SENSEI_PORT=9000; sensei`. See
> [here](https://github.com/Zenika/sensei/issues/147#issuecomment-1091188979).

#### Notes on running in Docker for Windows

When bind-mounting files in Docker for Windows with WSL2,
the [recommendation](https://docs.docker.com/desktop/windows/wsl/#best-practices)
is to store files in the Linux filesystem, i.e. inside WSL2.
The Linux filesystem can then be accessed from Windows through the path `\\wsl$\` (or `\\wsl.localhost\`).
When using VSCode, you can also use the [WSL extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)
to edit files on the Linux filesystem.

Therefore it is recommended to clone the training repository in the Linux filesystem then to run the alias from WSL2.

> ⚠ If you use the Windows filesystem, hot reload when changing training content won't work.

> ⚠ If you use the Windows filesystem and expect to use the alias within Git Bash for Windows, prepend the
> `--volume` and `--workdir` options with an additional slash
> (i.e. `--volume /$(pwd):/$(basename $(pwd)) --workdir //$(basename $(pwd)`).
> See [known issues of Git for Windows](https://github.com/git-for-windows/build-extra/blob/main/ReleaseNotes.md#known-issues).
> This avoids the `C:/Program Files/Git/...: no such file or directory` kind of errors.

### Using a Docker image built from sources 🐳

- Clone this repo and `cd` into the created folder
- Build the image with `docker image build --tag zenika/sensei ./`
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
  `Workbook/workbook.json`)
- Run `sensei pdf`
- PDFs are generated inside `pdf` folder

⚠️ If running native sensei on Mac M1, you need to follow special steps:

```
# Install chromium without Mac OS Quarantine to allow puppeteer to launch it
brew install --cask chromium --no-quarantine
# Put these variables export in your .bashrc or .zshrc to make sure puppeteer use the right chromium
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=`which chromium`
```

### Serving the slides and labs

- `cd` into a training material folder (must have `Slides/slides.json` and
  `Workbook/workbook.json`)
- Run `sensei serve`
- Navigate to `http://localhost:8080/`

## Material authoring

### Slides

Write slides as you would usual Reveal.js slides.
Refer to [Reveal's documentation](https://revealjs.com/) for features.
Note that the following plugins are enabled:
 - Markdown
 - Highlight
 - Zoom
 - Notes
 - Math

### Workbook

Write the workbook as you would a usual markdown document.

> ℹ You may use `<!-- toc -->` to have
> a table of content inserted at that place.

## Development

### Running

Install dependencies (`npm i`) then use `npm start --` to run the CLI
(e.g. `npm start -- serve --material=./training-material` where `./training-material`
points to directory with training material in it).
You may alternatively use `npm run dev --` instead to enable restart on change
(e.g. `npm run dev -- serve --material=./training-material`).
Note that `npm run dev` requires Node.js 18.11 or later.

### Testing

Tests are written using the built-in [test](https://nodejs.org/api/test.html)
module, which requires Node.js 18.3 or later.

- Run all tests: `npm test`
- Run one test file: `npm test path/to/test/file.test.js`

### Source file structure

- `src/app`: source code for the web app that embeds training material
- `src/build`: source code that builds the previously mentioned web app,
  including the training material
- `src/pdf`: source code that builds PDFs from the training material
- `src/cli`: source code for the CLI

### Code formating

This project uses Prettier. Don't forget to format before committing! You may
use `npm run prettier:write` to do that.
