# @zenika/sensei

⚠️ THIS IS A VERY EARLY PROTOTYPE

Sensei is meant to be a replacement of [zenika-formation-framework](https://github.com/Zenika/zenika-formation-framework/),
using a simpler and newer stack.

## Usage

> 🐳 Requires Docker

- Clone this repo and `cd` into the created folder
- `sh build.sh`
- `cd` into the folder of a training (must have `Slides/slides.json`)
- `sh ../path/to/sensei/run.sh`
- Navigate to `localhost:8080`
- Enjoy the great looking slides 🎉

## Usage using a prebuilt image

> 🐳 Requires Docker

- Define an alias using 
```
>$alias slides='docker container run \
  --interactive \
  --tty \
  --rm \
  --volume $(pwd):/app/training-material \
  --publish 8080:8080 \
  zenika/sensei' 
```
- `cd` into the folder of a training (must have `Slides/slides.json`)
- Launch using the command `slides`
- Navigate to `localhost:8080`
- Enjoy the great looking slides 🎉
