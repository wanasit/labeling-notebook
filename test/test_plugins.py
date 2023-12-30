def test_get_plugins(client):
    response = client.get("/api/plugins")
    assert response.status_code == 200

    plugin_map = response.get_json()
    assert len(plugin_map) >= 1

    example_info = plugin_map['example']
    assert example_info['name'] == 'Example Plugin'
    assert example_info['description'] == 'Example plugin used for testing'


def test_get_plugin_info(client):
    response = client.get("/api/plugins/example")
    assert response.status_code == 200

    plugin_info = response.get_json()
    assert plugin_info['name'] == 'Example Plugin'
    assert plugin_info['description'] == 'Example plugin used for testing'


def test_apply_plugin_on_image(client):
    response = client.post("/api/plugins/example/apply/image.jpg")
    assert response.status_code == 200


def test_apply_plugin_on_image_annotated(client):
    response = client.post("/api/plugins/example/apply/image_annotated.jpg")
    assert response.status_code == 200

def test_apply_plugin_on_image_modifying_image_data(client):
    response = client.get("/api/files/image_data/image.jpg")
    assert response.status_code == 404

    response = client.post("/api/plugins/example/apply/image.jpg")
    assert response.status_code == 200

    response = client.get("/api/files/image_data/image.jpg")
    assert response.status_code == 200
    data = response.get_json()
    assert data['example_response']['message'] == 'Applied example plugin'


def test_apply_plugin_to_missing_image(client):
    response = client.post("/api/plugins/example/apply/not_image.jpg")
    assert response.status_code == 404
