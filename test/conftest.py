import os
import shutil
import tempfile

import pytest

from server import create_app

module_dir = os.path.dirname(__file__)

@pytest.fixture
def app(tmp_path):
    """Create and configure a new app instance for each test."""
    example_path = os.path.join(module_dir, './example')
    working_dir = str(tmp_path)

    shutil.copytree(example_path, working_dir, dirs_exist_ok=True)
    return create_app(instance_path=working_dir)


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()
