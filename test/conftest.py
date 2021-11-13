import shutil
import tempfile

import pytest

from server import create_app


@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    # create a temporary file to isolate the database for each test
    tmp_path = tempfile.mkdtemp()
    # create the app with common test config
    app = create_app(instance_path=tmp_path)

    yield app

    # close and remove the temporary database
    shutil.rmtree(tmp_path)


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()


