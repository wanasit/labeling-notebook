import functools

from flask import Blueprint
from flask import g
from flask import request
from flask import session
from flask import abort
from flask import jsonify
from server.models.users import User

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if 'user' not in g:
            return abort(401, "Login required")

        return view(**kwargs)

    return wrapped_view


@bp.before_app_request
def load_logged_in_user():
    user_id = session.get("user_id")
    if user_id:
        g.user = User.query.get(user_id)


@bp.route("/register", methods=("POST",))
def register():
    autologin = request.args.get("autologin", default="True").lower() == "true"

    username = request.json.get('username')
    password = request.json.get('password')

    user = User.try_register(username, password)
    if not user:
        print(username, password)
        return abort(400, "Invalid username or password")

    if autologin:
        session["user_id"] = user.id

    return jsonify({'username': user.username, 'loggedIn': autologin})


@bp.route("/login", methods=("POST",))
def login():
    username = request.json['username']
    password = request.json['password']

    user = User.by_username_password(username, password)
    if not user:
        return abort(401, "Incorrect username or password")

    session["user_id"] = user.id
    return jsonify({'username': user.username, 'loggedIn': True})


@bp.route("/logout")
def logout():
    user = None
    if 'user' in g:
        user = g.user

    session.clear()
    if not user:
        return jsonify({"loggedIn": False})

    return jsonify({
        "loggedIn": True,
        "username": user.username
    })
