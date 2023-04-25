from fastapi.testclient import TestClient

from src.back.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200

def test_decode():
    response = client.post(
        "/decode",
        headers= {"Accept": "application/json", "Content-Type": "application/json"},
        json={
            'params': '37.60611534118653,55.756042617988;37.6018238067627,55.759763416265116',
        },
    )
    assert response.status_code == 201

def test_bad_decode():
    response = client.post(
        "/decode",
        headers= {"Accept": "application/json", "Content-Type": "application/json"},
        json={
            'params': '44.12109375,58.70356530258478;85.95703125000001,71.8504294045117',
        },
    )
    assert response.status_code == 500
    assert response.text == '{\"message\":\"Impossible route between points\"}'

# def test_get_coord():
#     response = client.post(
#         "/hello",
#         headers= {"Accept": "application/json", "Content-Type": "application/json"}