import pandas as pd
import numpy as np
from scipy.spatial.distance import cdist
from typing import List

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
        points = np.array(points)
        #Чтение датасета мест
        np_landmark = self.data_LandMark[["ltd","lng"]].to_numpy()



        data_dist = cdist(data,np_landmark,metric="euclidean")

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

