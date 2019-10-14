# @zenika/sensei

⚠️ THIS IS A VERY EARLY PROTOTYPE

Sensei is meant to be a replacement of [zenika-formation-framework](https://github.com/Zenika/zenika-formation-framework/),
using a simpler and newer stack.

## Usage

- Clone this repo and `cd` into the created folder
- `docker build . --tag zenika/sensei`
- `cd` into the folder of a training (must have `Slides/slides.json`)
- `docker run -it --rm -v $(pwd):/app/training-material -p 8080:8080 zenika/sensei`
- Navigate to `localhost:8080`
- Admire the great looking slides 🎉
