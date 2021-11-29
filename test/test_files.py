def test_list_example_directory(client):
    response = client.get("/api/files")
    assert response.status_code == 200

    file_list = response.get_json()
    assert len(file_list) == 5
    assert file_list[0]['key'] == 'image_annotated.jpg'
    assert file_list[1]['key'] == 'image.jpg'
    assert file_list[2]['key'] == 'more_images/'
    assert file_list[3]['key'] == 'more_images/01.jpg'
    assert file_list[4]['key'] == 'more_images/02.png'


def test_list_example_directory_nested(client):
    response = client.get("/api/files?path=more_images")
    assert response.status_code == 200

    file_list = response.get_json()
    assert len(file_list) == 2
    assert file_list[0]['key'] == '01.jpg'
    assert file_list[1]['key'] == '02.png'


def test_get_example_image(client):
    response = client.get("/api/files/image/x.jpg")
    assert response.status_code == 404

    response = client.get("/api/files/image/image.jpg")
    assert response.status_code == 200

    response = client.get("/api/files/image/more_images/01.jpg")
    assert response.status_code == 200


def test_get_example_image_data(client):
    response = client.get("/api/files/image_data/image.jpg")
    assert response.status_code == 404

    response = client.get("/api/files/image_data/image_annotated.jpg")
    assert response.status_code == 200

    data = response.get_json()
    assert 'annotations' in data
    assert 'tags' in data


def test_put_example_image_data(client):
    response = client.get("/api/files/image_data/image.jpg")
    assert response.status_code == 404

    response = client.put("/api/files/image_data/image.jpg", json={
        'annotations': [{'width': 10, 'height': 10, 'x': 0, 'y': 0}],
        'tags': ['a', 'b']
    })
    assert response.status_code == 200

    response = client.get("/api/files/image_data/image.jpg")
    assert response.status_code == 200

    data = response.get_json()
    assert 'annotations' in data
    assert 'tags' in data
