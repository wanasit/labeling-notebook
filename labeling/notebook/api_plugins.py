import importlib
import json
import os
import pkgutil
from flask import Blueprint, request, abort, jsonify

from labeling.plugin import example
from labeling.notebook import utils

discovered_plugins = {
    name: importlib.import_module(name)
    for finder, name, ispkg
    in pkgutil.iter_modules()
    if name.startswith('labeling_notebook_')
}
discovered_plugins['example'] = example

bp = Blueprint("plugins", __name__, url_prefix="/api/plugins")


@bp.route("")
def get_plugins():
    output = {}
    for name, plugin in discovered_plugins.items():
        output[name] = plugin.get_plugin_info()
    return jsonify(output)


@bp.route("/<name>", methods=("GET",))
def get_plugin_info(name):
    if name not in discovered_plugins:
        return abort(404, "Plugin not found")

    plugin = discovered_plugins[name]
    output = plugin.get_plugin_info(detailed=True)
    return jsonify(output)


@bp.route("/<name>/apply/<path:key>", methods=("POST",))
def apply_plugin(name, key):
    if name not in discovered_plugins:
        return abort(404, "Plugin not found")

    image_info = utils.resolve_image_info(key)
    if image_info is None:
        return abort(404, "Image not found")

    image_data = None
    if os.path.isfile(image_info.data_path):
        with open(image_info.data_path, 'r') as f:
            image_data = json.load(f)

    plugin = discovered_plugins[name]
    output = plugin.apply_plugin(image_info.path, image_data)
    if output is not None:
        with open(image_info.data_path, 'w') as f:
            json.dump(output, f)

    return jsonify({
        'message': f'Successfully applied "{name}" plugin to "{key}"'
    })


if __name__ == '__main__':
    print(discovered_plugins)
    print(discovered_plugins['labeling_notebook_comic_ocr'].__version__)
