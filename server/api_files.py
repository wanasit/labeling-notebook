import json
import os
from datetime import time
from collections import defaultdict
from flask import Blueprint, request, abort, jsonify, current_app, send_file

bp = Blueprint("files", __name__, url_prefix="/api/files")


@bp.route("ls", defaults={'path': None})
@bp.route("ls/<path:path>")
def list_directories(path):
    include_image_data = request.args.get("include_image_data", default="True").lower() == "true"
    path = path if path else ''

    instance_path = current_app.instance_path
    ls_path = os.path.join(instance_path, path)
    if not os.path.isdir(ls_path):
        return abort(404, "Directory not found")

    output = defaultdict(dict)
    image_data = {}
    for filename in os.listdir(ls_path):

        file_path = os.path.join(ls_path, filename)
        if os.path.isdir(file_path):
            output[filename]['type'] = 'DIR'
            continue

        name, ext = os.path.splitext(filename)
        if ext in ('.jpg', '.png', '.jpeg'):
            output[filename]['type'] = 'IMAGE'
            continue

        if ext == '.json' and include_image_data:
            image_data[name] = try_load_image_data_json(file_path)
            continue

    if include_image_data:
        for filename, file_info in output.items():
            name, ext = os.path.splitext(filename)
            if name in image_data:
                file_info['data'] = image_data[name]

    return output


@bp.route("image/<path:path>", methods=("GET",))
def get_image(path):
    instance_path = current_app.instance_path
    image_path = os.path.join(instance_path, path)

    if not os.path.isfile(image_path):
        return abort(404, "File not found")

    return send_file(image_path)


@bp.route("image_data/<path:path>", methods=("GET",))
def get_image_data(path):
    instance_path = current_app.instance_path
    image_path = os.path.join(instance_path, path)

    if not os.path.isfile(image_path):
        return abort(404, "File not found")

    name, ext = os.path.splitext(image_path)
    data_path = name + '.json'
    if not os.path.isfile(data_path):
        return abort(404, "File not found")

    return try_load_image_data_json(data_path)


def try_load_image_data_json(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)
