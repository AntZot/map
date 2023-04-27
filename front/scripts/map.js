
const map = L.map('map');

navigator.geolocation.getCurrentPosition(
    function(position){
    var curr_lat = position.coords.latitude;
    var curr_lng = position.coords.longitude;
    map.setView([curr_lat, curr_lng], 14);
    },

    function(error){
    map.setView([55.7422, 37.5719], 11);
    });


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);



var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var Stamen_TonerLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
});
var group = L.layerGroup([Esri_WorldImagery,Stamen_TonerLabels]);
const basemaps = {
StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',   {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),
Topography: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                            maxZoom: 17,
                            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                        }),
Стпутник: group,
};

L.control.layers(basemaps).addTo(map);


var points_list = {};

//переделывается wip
function onMapClick(e) {
    if(Object.keys(points_list).length<2){
        loc1 = new L.marker(e.latlng, {draggable: true});
        loc1.on('dragend', function(event) {
            var changedPos = event.target.getLatLng();
            points_list[event.target._leaflet_id] = [changedPos["lat"],changedPos["lng"]]
            sendPost();
        });
        map.addLayer(loc1);
        points_list[loc1._leaflet_id] = [e.latlng["lat"],e.latlng["lng"]];
    }
    if (Object.keys(points_list).length>=2){
        sendPost()
    }
    
};
map.on('click', function(e) {
    onMapClick(e);
});

var polyline;
var recom_mark_list = {};
var counter = 0

async function sendPost() {
    if (Object.keys(points_list).length >= 2) {
        point_keys_list = Object.keys(points_list);
        //Передалть просто под список координат
        params = ''
        params = params + `${points_list[point_keys_list[0]][1]},${points_list[point_keys_list[0]][0]}`
        for (let i = 1; i < Object.keys(points_list).length; i++){
            params = params + ";"
            params = params + `${points_list[point_keys_list[i]][1]},${points_list[point_keys_list[i]][0]}`
        }
        //------------------------------------------------------------
        const response = await fetch("/decode", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            params: params
        })
        });
        data = await response.json()
        if (data) {
                if (polyline) {
                    map.removeLayer(polyline);
            }
            var points = data;
            console.log(points);
            polyline = new L.polyline(points, {color: 'red'});
            console.log(polyline);
            map.addLayer(polyline);
            map.fitBounds(polyline.getBounds());
        }

        // Переделать запрос 
        const resp = await fetch("/recomend", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({
            params: params,
            data: data
            })
        });
        
        recom_data = await resp.json()
        if (recom_data) {
            if (Object.keys(recom_mark_list).length>0) {
                rec_keys = Object.keys(recom_mark_list)
                iter = Object.keys(recom_mark_list).length
                for (let i = 0; i < iter; i++){
                    map.removeLayer(recom_mark_list[rec_keys[i]]);
                    delete recom_mark_list[rec_keys[i]]
                }
            }
            var rec = JSON.parse(recom_data);
            for (let i = 0; i < rec["data"].length; i++) { 
                console.log(rec["data"][i])
                recm = rec["data"][i]
                recom_mark = new L.marker([recm[3],recm[2]],{draggable: false});
                map.addLayer(recom_mark);
                recom_mark.bindPopup(`
                <b>${recm[0]}</b>
                <br>${recm[1]}
                <input id = ${recom_mark._leaflet_id} type=\"button\" onclick=\"add_point_to_road(this); \" value=\"Добавить в маршрут\" />`);
                recom_mark_list[recom_mark._leaflet_id] = recom_mark;
            }


        }

    }
} 

function add_point_to_road(recom_mark) {
    debugger
    console.log(recom_mark)
    mrk = recom_mark_list[recom_mark.id].getLatLng()
    points_list[recom_mark.id] = [mrk["lat"],mrk["lng"]]
    delete recom_mark_list[recom_mark.id]
    sendPost()
}
const provider = new window.GeoSearch.OpenStreetMapProvider();
const search = new GeoSearch.GeoSearchControl({
provider: provider,
style: 'button',
updateMap: true,
autoClose: false,
searchLabel: "Введите адрес"
});

map.addControl(search); 

//   //Создание метки
//   async function createMarker(e){

//     var new_mark = L.marker().setLatLng(e.latlng).addTo(map);
//     new_mark.dragging.disable();
//     new_mark.bindPopup("DoubleClick to delete");
//     var lat = e.latlng.lat.toFixed(4),
//         lng = e.latlng.lng.toFixed(4);

//     // отправляем запрос
//     const response = await fetch("/hello", {
//       method: "POST",
//       headers: { "Accept": "application/json", "Content-Type": "application/json" },
//       body: JSON.stringify({ 
//           lat: lat,
//           lng: lng
//        })
//     });
//     // Логируем
//     if (response.ok) {
//       const data = await response.json();
//       console.log(data);
//     }
//     else
//         console.log(response);
//   }
//   map.on('click', createMarker);
