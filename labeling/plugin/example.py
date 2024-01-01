"""The example plugin implementation used for testing.

This is a workable dummy implementation of a plugin that can be used for testing.
The actual plugin implementation should implement all methods in this module with the same specification.
"""

from typing import Dict, Any, Union


def get_plugin_info(detailed: bool = False) -> Dict[str, Any]:
    """Returns the plugin information."""
    return {
        "name": "Example Plugin",
        "description": "Example plugin used for testing",
        "is_detailed": detailed
    }


def apply_plugin(image_path: str, image_data: Union[Dict[str, Any], None]) -> Union[Dict[str, Any], None]:
    """Applies the plugin to the image and modify the image data.

    Args:
        image_path: The path to the image file.
        image_data: The current image data (written in the JSON file).

    Returns:
        The modified/new image data (to be written in the JSON file).
    """

    if image_data is None:
        image_data = {}

    updated_image_data = image_data.copy()
    updated_image_data['example_response'] = {
        'message': 'Applied example plugin',
        'input': {
            'image_path': image_path
        }
    }
    return updated_image_data
