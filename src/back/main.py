from fastapi import FastAPI, Body, Response, status
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi import responses 
import polyline
import json
import requests
from recomendation_gen import recomendation 
from operator import itemgetter
import numpy as np
import uvicorn


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

"""
    Получение строки координат и передача их на API OSRM
    res Получение ответа по апи и трансформация их в массив точек, которые будут отрисовываться 

    overview = full|false|

"""
@app.post("/decode",status_code=201)
def decode(response: Response, data= Body()):
    params = ''
    points = data['params']
    points_var = np.var(np.array(points),axis=0,dtype=np.float64)
    print("     "+ f"{points_var}")
    if points_var[0] > points_var[1]:
        points = sorted(points,reverse=True) 
    else:
        points = sorted(points, key=itemgetter(1))

    #Сборка строки для отправки запросса API
    for count, point in enumerate(points):
        params += f"{point[1]},{point[0]}"
        if(count != (len(points)-1)):
            params += ";"
    print("     "+params)

    res = requests.get(OSRM_API_URL+params+"?geometries=polyline&overview=full") 
    js = json.loads(res.text)
    if js["code"]=='NoRoute': 
        resp = {"message":"Impossible route between points"}
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    else:
        resp = polyline.decode(js['routes'][0]["geometry"])
    return resp


# """
#     Создание рекомендаций и отправка их на фронтенд
#     data - список пар координат на основе которых создаются рекомендации 
    
# """
# @app.post("/recomend")
# def recomend(data= Body()):
#     content = startup_data["rec"].get_recomendation(data["data"],data["params"])
#     return responses.JSONResponse(content=content,media_type="application/json")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)