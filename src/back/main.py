from fastapi import FastAPI, Body, Response, status
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi import responses 
import polyline
import json
import requests
from src.back.recomendation_gen import recomendation 

app = FastAPI()
 
app.mount("/front", StaticFiles(directory="front"), name="front")



@app.get("/")
def root():
    return FileResponse("front/map.html")

 
@app.post("/hello")
#def hello(name = Body(embed=True)):
def get_coord(data = Body()):
    name = data["lat"]
    age = data["lng"]
    return {"message": f"lng: {name}, lat: {age}"}


"""
    Получение строки координат и передача их на API OSRM
    res Получение ответа по апи и трансформация их в массив точек, которые будут отрисовываться 

    overview = full|false|

"""
@app.post("/decode",status_code=201)
def decode(response: Response, data= Body()):
    res = requests.get("http://router.project-osrm.org/route/v1/driving/"+data["params"]+"?geometries=polyline&overview=full")
    js = json.loads(res.text)
    if js["code"]=='NoRoute': 
        resp = {"message":"Impossible route between points"}
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    else:
        resp = polyline.decode(js['routes'][0]["geometry"])
    return resp


"""
    Создание рекомендаций и отправка их на фронтенд
    data - список пар координат на основе которых создаются рекомендации 
    
"""
@app.post("/recomend")
def recomend(data= Body()):
    recom = recomendation()
    return responses.JSONResponse(content=recom.get_recomendation(data["params"]),media_type="application/json")
