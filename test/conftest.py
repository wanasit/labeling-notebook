import os
import shutil
import tempfile

import pytest

from server import create_app

module_dir = os.path.dirname(__file__)

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""

    example_path = os.path.join(module_dir, './example')
    return create_app(instance_path=example_path)


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()
