import os
from dataclasses import dataclass
from typing import Any, Dict, Union

from flask import current_app


@dataclass
class ImageInfo:
    path: str
    data_path: str


def resolve_image_info(input_key: str) -> Union[ImageInfo, None]:
    image_path = os.path.join(current_app.instance_path, input_key)

    # TODO: Also check if the file is really an image
    if not os.path.isfile(image_path):
        return None

    path_without_ext, ext = os.path.splitext(image_path)
    image_data_path = path_without_ext + '.json'
    return ImageInfo(
        path=image_path,
        data_path=image_data_path
    )
