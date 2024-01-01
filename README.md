# Labeling Notebook

A web-based image annotation/labeling tool for small projects (inspired by Jupyter notebook).

It allows you to browse and update image annotations.

<kbd><img width="1200" alt="labeling_notebook_screenshot" src="https://user-images.githubusercontent.com/1537162/147520343-61e58b87-955b-4639-94ee-f82a8c276b8b.png"></kbd>


## Usage

Install the `labeling-notebook` package from with pip (Python3).

```bash
pip install labeling-notebook
```

With the package installed, use `label` command to start the labeling notebook:

```bash
# cd <your directory with images>
label .
```

The command should start the labeling notebook application at `http://localhost:9888`.

(See `label -h` for other command line options)

## Data Format

The labeling notebook reads and saves an image information in
**a json file with the same name**. e.g.

```bash
directory/pets_01.jpg
directory/pets_01.json  # <-- `pets_01.jpg`s annotation data
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
