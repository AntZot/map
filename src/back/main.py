from fastapi import FastAPI, Body, Response, status
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi import responses 
import polyline
import json
import requests
from operator import itemgetter
import numpy as np
import uvicorn
from typing import List
import pandas as pd


OSRM_API_URL = "http://router.project-osrm.org/route/v1/driving/"

class recomendation():
    
    def __init__(self) -> None:
        self.data_LandMark = pd.read_csv("test_feature/best_places_copy.csv",sep=";")
    
    def get_recomendation(self, query:List[List[float]], points: List[List[float]], max_rec:int = 0,rec_distance:float = 0.02):
        """
        Get recomendation on json format

        :param query: List with ltd, lng pairs.

        :param points: List with ltd, lng pairs.

        :max_rec: maximum number of recomendations.

        :rec_distance: distance to L1 norm
        """
        data= np.array(query)
        print(data.shape)
        points = np.array(points)
        #Чтение датасета мест
        np_landmark = self.data_LandMark[["ltd","lng"]].to_numpy()
        path_point = []
        for i in data:
            land_metric = []
            for j in np_landmark:
                land_metric.append(np.sqrt(sum(pow(a-b, 2) for a, b in zip(i, j))))
            path_point.append(land_metric)
        data_dist = np.array(path_point)

        print(data_dist.shape)
        norm=[]
        for i in np.unique(np.where(data_dist<rec_distance)[1]):    
            norm.append(np.min(data_dist[:,i]))
        sliced_data = self.data_LandMark.iloc[np.unique(np.where(data_dist<rec_distance)[1])]
        sliced_data["dist"] = norm
        sliced_data.sort_values(by='dist')

        """
        сделать проверку на уже существующие поинты
        
        """
        mask = np.round(sliced_data['lng'],4).isin(np.round(points[:,1],4)) & np.round(sliced_data['ltd'],4).isin(np.round(points[:,0],4))
        sliced_data = sliced_data[~mask]

        return sliced_data[["Places","Addres","lng","ltd"]][0:5].to_json(orient="split",force_ascii=False,index=False)



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
@app.post("/recomend")
def recomend(data= Body()):
    content = startup_data["rec"].get_recomendation(data["data"],data["params"])
    return responses.JSONResponse(content=content,media_type="application/json")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)