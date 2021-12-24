# Labelling Notebook

A web-based image annotation/labelling tool for small projects (inspired by Jupyter notebook).

It allows you to browse and update image annotations.

## Usage

Install the `labelling-notebook` package from with pip (Python3).

```bash
pip install labelling-notebook
```

With the package installed, use `label` command to start the labelling notebook:

```bash
# cd <your directory with images>
label .
```

The command should start the labelling notebook application at `http://localhost:9888`.

(See `label -h` for other command line options)

## Data Format

The labelling notebook reads and saves an image information in
**a json file with the same name**. e.g.

```bash
directory/cat_01.jpg
directory/cat_01.json  # <-- `cat_01.jpg`s labeled data
```

```json
{
  "annotations": [
    {
      "x": 100,
      "y": 120,
      "width": 20,
      "height": 20,
      "label": "left-eye"
    },
    {
      "x": 150,
      "y": 121,
      "width": 20,
      "height": 20,
      "label": "right-eye"
    },
    ...
  ],
  "tags": [
    "cat",
    ...
  ]
}
```