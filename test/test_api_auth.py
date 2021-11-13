def test_register_and_autologin(client):
    response = client.post("/api/auth/register", json={"username": "wanasit", "password": "abc"})
    assert response.status_code == 200
    assert response.json['username'] == "wanasit"

    response = client.get("/api/debug")
    assert response.status_code == 200
    assert response.json['user'] is not None


def test_register_not_autologin(client):
    response = client.post("/api/auth/register?autologin=false",
                           json={"username": "wanasit", "password": "abc"})
    assert response.status_code == 200
    assert response.json['username'] == "wanasit"

    response = client.get("/api/debug")
    assert response.status_code == 200
    assert response.json['user'] is None


def test_duplicate_register(client):
    response = client.post("/api/auth/register", json={"username": "wanasit", "password": "abc"})
    assert response.status_code == 200

    response = client.post("/api/auth/register", json={"username": "wanasit", "password": "abc"})
    assert response.status_code == 400
    assert response.json['message'] == 'Invalid username or password'


def test_login_success(client):
    response = client.get("/api/debug")
    assert response.status_code == 200
    assert response.json['user'] is None

    response = client.post("/api/auth/register?autologin=false",
                           json={"username": "wanasit", "password": "abc"})
    assert response.status_code == 200

    response = client.post("/api/auth/login", json={"username": "wanasit", "password": "abc"})
    assert response.status_code == 200
    assert response.json['username'] == "wanasit"

    response = client.get("/api/debug")
    assert response.status_code == 200
    assert response.json['user'] is not None


def test_login_fail(client):
    response = client.get("/api/debug")
    assert response.status_code == 200
    assert response.json['user'] is None

    response = client.post("/api/auth/register?autologin=false",
                           json={"username": "wanasit.wt@gmail.com", "password": "abc"})
    assert response.status_code == 200

    response = client.post("/api/auth/login", json={"username": "wanasit", "password": "xyz"})
    assert response.status_code == 401
    assert response.json['message'] == "Incorrect username or password"

    response = client.get("/api/debug")
    assert response.status_code == 200
    assert response.json['user'] is None


def test_logout(client):
    response = client.get("/api/auth/logout")
    assert response.status_code == 200
    assert not response.json['loggedIn']

    response = client.post("/api/auth/register", json={"username": "wanasit", "password": "abc"})
    assert response.status_code == 200
    assert response.json['username'] == "wanasit"

    response = client.get("/api/auth/logout")
    assert response.status_code == 200
    assert response.json['loggedIn']
    assert response.json['username'] == "wanasit"

    response = client.get("/api/debug")
    assert response.status_code == 200
    assert response.json['user'] is None
