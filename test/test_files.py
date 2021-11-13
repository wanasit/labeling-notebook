def test_list_example_directory(client):
    response = client.get("/files/ls/.")
    assert response.status_code == 200

    json_data = response.get_json()
    assert 'more_images' in json_data
    assert 'image.jpg' in json_data
    assert 'image_annotated.jpg' in json_data


def test_list_more_images_directory(client):
    response = client.get("/files/ls/more_images")
    assert response.status_code == 200

    json_data = response.get_json()
    assert '01.jpg' in json_data
    assert '02.png' in json_data


def test_get_images(client):
    response = client.get("/files/image/image.jpg")
    assert response.status_code == 200

    response = client.get("/files/image/more_images/01.jpg")
    assert response.status_code == 200


def test_get_image_datas(client):
    response = client.get("/files/image_data/image.jpg")
    assert response.status_code == 404

    response = client.get("/files/image_data/image_annotated.jpg")
    assert response.status_code == 200
