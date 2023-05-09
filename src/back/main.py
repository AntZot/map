from fastapi import FastAPI, Body, Response, status
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi import responses 
import polyline
import json
import requests
from src.back.recomendation_gen import recomendation 

OSRM_API_URL = "http://router.project-osrm.org/route/v1/driving/"


app = FastAPI()
 
app.mount("/front", StaticFiles(directory="front"), name="front")

startup_data = {}

@app.on_event("startup")
async def startup_event():
    startup_data["rec"] = recomendation()

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
    res = requests.get(OSRM_API_URL+data["params"]+"?geometries=polyline&overview=full")
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
    content = startup_data["rec"].get_recomendation(data["params"])
    return responses.JSONResponse(content=content,media_type="application/json")
