import pandas as pd
import numpy as np
from scipy.spatial.distance import cdist

class recomendation():
    def __init__(self) -> None:
        pass

    # def get_recomendation(self,num = 0):
    #     return [["Орбита",[55.8047061672586,37.391517162323005],"https://orbita-tp.ru/"],
    #             ["Сад",[55.802113258880816,37.399970797744004],"None"]]
    
    def get_recomendation(self,query,max_req=0):
        best_distance=0.02

        np_data= np.array(query)
        #Чтение датасета мест
        data_LandMark = pd.read_csv("test_feature/best_places.csv",sep=";")
        np_landmark = data_LandMark[["ltd","lng"]].to_numpy()
        data_dist = cdist(np_data,np_landmark,metric="euclidean")

        norm=[]
        for i in np.unique(np.where(data_dist<best_distance)[1]):    
            norm.append(np.min(data_dist[:,i]))
        
        sliced_data = data_LandMark.iloc[np.unique(np.where(data_dist<0.02)[1])]
        sliced_data["dist"] = norm
        sliced_data.sort_values(by='dist')

        return sliced_data[["Places","Addres","lng","ltd"]][0:5].to_json(orient="split",force_ascii=False,index=False)

