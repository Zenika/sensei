# @zenika/sensei

Sensei is meant to be a replacement of [zenika-formation-framework](https://github.com/Zenika/zenika-formation-framework/),
using a simpler and newer stack. It's not up-to-par in terms of features, but it's ready for test drives.

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

> ⚠ If you expect to use this alias within Git Bash for Windows, you might need
> to set `MSYS_NO_PATHCONV` to `1` to disable path conversion on the volume paths.
> This avoids the `C:/Program Files/Git/...: no such file or directory` type of 
> errors. 

### Using a Docker image built from sources 🐳

- Clone this repo and `cd` into the created folder
- Build the image with `sh build.sh`
- Create the same alias as for the published Docker image but without the `--pull always`

> ⚠ When running sensei inside a Docker container, the `--material` is limited
> to descendants of the working directory.

### Using Node.js

- Install with `npm install --global https://github.com/Zenika/sensei`

> ⚠ You may use Yarn, however it's been to known to have cache issues when installing packages from GitHub, resulting in failures to update sensei correctly.

## Usage

### Help

Run `sensei --help` for available commands and options.

### Generating PDFs

- `cd` into a training material folder (must have `Slides/slides.json` and `Workbook/parts.json`)
- Run `sensei pdf`
- PDFs are generated inside `pdf` folder

⚠️ Note about slide sizing and PDF rendering: to avoid any layout inconsistencies, the `width` and `height` values present in [src/slides/slides.js](src/slides/slides.js) file must match the values of the `--size` parameter in the `slides` npm script

### Serving the slides and labs

- `cd` into a training material folder (must have `Slides/slides.json` and `Workbook/parts.json`)
- Run `sensei serve`
- Navigate to `http://localhost:8080/`

## Reveal plugins

The following plugins are enabled:
 - Markdown
 - Highlight
 - Zoom
 - Notes
 - Math

Refer to [Reveal's documentation](https://revealjs.com/plugins/#built-in-plugins) for usage.
