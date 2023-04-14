from fastapi.testclient import TestClient

from src.back.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200

def test():
    response = client.post(
        "/decode",
        headers= {"Accept": "application/json", "Content-Type": "application/json"},
        json={
            'params': '37.60611534118653,55.756042617988;37.6018238067627,55.759763416265116',
        },
    )
    assert response.status_code == 200
    #assert response.array
    """
    [(55.75837, 37.59338), (55.75835, 37.59337), (55.75833, 37.59336), (55.75829, 37.59335), (55.75825, 37.59361), (55.7582, 37.59409), (55.75814, 37.59434), (55.75808, 37.59481), (55.75798, 37.59563), (55.75796, 37.59579), (55.75794, 37.59602), (55.75787, 37.59658), (55.75782, 37.59723), (55.75776, 37.59767), (55.75776, 37.5977), (55.75774, 37.59795), (55.75772, 37.59794), (55.75762, 37.59792), (55.75752, 37.59795), (55.75749, 37.59796), (55.7574, 37.59802), (55.75736, 37.59804), (55.75673, 37.59855), (55.75607, 37.5991), (55.75599, 37.59916), (55.75553, 37.59953), (55.75529, 37.59979), (55.75486, 37.60031), (55.75479, 37.60037), (55.75474, 37.6004), (55.75467, 37.60044), (55.75455, 37.6005), (55.75437, 37.60055), (55.75421, 37.60058), (55.75382, 37.60064), (55.75365, 37.60065), (55.75321, 37.60068), (55.75268, 37.60067), (55.75226, 37.60066), (55.75199, 37.60064), (55.75191, 37.60063), (55.75159, 37.6006), (55.75153, 37.60059), (55.75136, 37.60052), (55.75127, 37.60047), (55.75121, 37.60043), (55.75114, 37.60041), (55.7511, 37.60041), (55.75107, 37.60042), (55.75105, 37.60044), (55.75104, 37.60046), (55.75103, 37.60048), (55.75102, 37.60053), (55.75102, 37.60073), (55.75101, 37.60087), (55.751, 37.60108), (55.75098, 37.60131), (55.75095, 37.60192), (55.75094, 37.6021), (55.75093, 37.60215), (55.75092, 37.6022), (55.75091, 37.60229), (55.75088, 37.60247), (55.75051, 37.60389), (55.75046, 37.60407), (55.7504, 37.60429), (55.75024, 37.60486), (55.75013, 37.60526), (55.74999, 37.60571), (55.74992, 37.60597), (55.74987, 37.60614), (55.74979, 37.60641), (55.74973, 37.60662), (55.7497, 37.60675), (55.74936, 37.60796), (55.74919, 37.60855), (55.74917, 37.60863), (55.74919, 37.6088), (55.74921, 37.60888), (55.74923, 37.60894), (55.74961, 37.60921), (55.74996, 37.6094), (55.75, 37.60942), (55.75058, 37.60976), (55.75089, 37.60994), (55.75155, 37.61031), (55.75195, 37.61054), (55.75204, 37.61057), (55.75216, 37.61059), (55.75227, 37.61061), (55.75235, 37.61058), (55.7524, 37.61054), (55.75244, 37.61046), (55.75247, 37.61036), (55.75249, 37.61019), (55.7525, 37.61007), (55.75251, 37.60994), (55.75254, 37.60956), (55.75257, 37.60903), (55.75267, 37.60905), (55.75271, 37.60906)]
    """