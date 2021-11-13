from . import db

from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(256), unique=True, nullable=False)
    password_hashed = db.Column(db.String(128))

    def __repr__(self):
        return '<User %r>' % self.username

    @staticmethod
    def try_register(username, password):

        current_user = User.query.filter_by(username=username).first()
        if current_user:
            return None

        password_hashed = _check_and_hash_password(password)
        if not password_hashed:
            print(password)
            return None

        user = User(username=username, password_hashed=password_hashed)
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def by_username_password(username, password=None):
        user = User.query.filter_by(username=username).first()

        if user and password:
            if not check_password_hash(user.password_hashed, password):
                return None

        return user


def _check_and_hash_password(password):
    return generate_password_hash(password)


def _check_username(username):
    # TODO: Check username
    return username

