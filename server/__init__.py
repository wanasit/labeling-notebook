import os

from flask import Flask, jsonify, redirect
from werkzeug.exceptions import HTTPException

from server.models import db


def create_app(
        instance_path=None,
        static_folder='../frontend/build'
):
    app = Flask(__name__,
                instance_path=instance_path,
                static_url_path='/',
                static_folder=static_folder,
                instance_relative_config=True)

    # Apply API blueprints
    from server import api_debug, api_auth
    app.register_blueprint(api_auth.bp)
    app.register_blueprint(api_debug.bp)
    # app.register_blueprint(other_api.bp)

    @app.errorhandler(ValueError)
    def http_error_handler(error):
        return jsonify(code=400, message=str(error)), 400

    @app.errorhandler(HTTPException)
    def http_error_handler(error):
        return jsonify(code=error.code, message=error.description), error.code

    @app.route('/')
    def home():
        return redirect('/index.html', code=302)

    _init_temp_dir(app)
    _init_database(app)
    return app


def _init_temp_dir(app):
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass


def _init_database(app):
    db_path = os.path.join(app.instance_path, "server.sqlite")
    app.config.from_mapping(
        SECRET_KEY='SECRET_KEY',
        SQLALCHEMY_DATABASE_URI='sqlite:///' + db_path,
        SQLALCHEMY_TRACK_MODIFICATIONS=False
    )

    with app.app_context():
        db.init_app(app)
        db.create_all()
