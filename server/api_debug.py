from datetime import time

from flask import Blueprint, request, abort, jsonify
from flask import g

bp = Blueprint("api", __name__, url_prefix="/api/debug")


@bp.route("", methods=("GET",))
def status():

    user = None
    if 'user' in g:
        user = {'username' : g.user.username}

    return jsonify(
        user=user,
        serverTime=int(time().microsecond * 1000)
    )
