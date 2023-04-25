import pandas as pd
import numpy as np
from scipy.spatial.distance import cdist

class recomendation():
    def __init__(self) -> None:
        self.data_LandMark = pd.read_csv("test_feature/best_places_copy.csv",sep=";")
    
    def get_recomendation(self,query,max_req=0):
        best_distance=0.02

        np_data= np.array(query)
        #Чтение датасета мест
        np_landmark = self.data_LandMark[["ltd","lng"]].to_numpy()
        data_dist = cdist(np_data,np_landmark,metric="euclidean")

        norm=[]
        for i in np.unique(np.where(data_dist<best_distance)[1]):    
            norm.append(np.min(data_dist[:,i]))
        
        sliced_data = self.data_LandMark.iloc[np.unique(np.where(data_dist<best_distance)[1])]
        sliced_data["dist"] = norm
        sliced_data.sort_values(by='dist')

        return sliced_data[["Places","Addres","lng","ltd"]][0:5].to_json(orient="split",force_ascii=False,index=False)

