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
    assert response.status_code == 200

# def test_get_coord():
#     response = client.post(
#         "/hello",
#         headers= {"Accept": "application/json", "Content-Type": "application/json"},
#         json=

#     )