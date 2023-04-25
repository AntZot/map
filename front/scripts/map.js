
const map = L.map('map');

navigator.geolocation.getCurrentPosition(
    function(position){
    var curr_lat = position.coords.latitude;
    var curr_lng = position.coords.longitude;
    map.setView([curr_lat, curr_lng], 14);
    },

    function(error){
    map.setView([55.7422, 37.5719], 11);
    }
    );
//map.setView([55.7422, 37.5719], 11);


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


var loc1,loc2;
var points_list = [];
function onMapClick(e) {
    if (loc1 == null) {
        loc1 = new L.marker(e.latlng, {draggable: true});
        loc1.bindPopup("<b>Hello world!</b><br>I am a popup.<input type=\"button\" onclick=\"window.open('https://google.com');\" value=\"Go to Google\" />")
        loc1.on('dragend', function(event) {
            sendPost();
        });
        map.addLayer(loc1);
    }
    else if (loc2 == null) {
        loc2 = new L.marker(e.latlng, {draggable: true});
        loc2.on('dragend', function(event) {
            sendPost();
        });
        map.addLayer(loc2);
        sendPost();
    }
}
;
map.on('click', function(e) {
    onMapClick(e);
});

var polyline;
var recom_mark_list = [];

async function sendPost() {
    if (loc2 != null && loc1 != null) {
        var p1 = loc1.getLatLng(),
            p2 = loc2.getLatLng();

        const params = `${p1.lng},${p1.lat};${p2.lng},${p2.lat}`
        console.log(params)

        // const response = await fetch("http://router.project-osrm.org/route/v1/driving/"+params, {
        // method: "GET",
        // });

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
            params: data
            })
        });
        
        recom_data = await resp.json()
        if (recom_data) {
            if (recom_mark_list) {
                while(recom_mark_list.length){
                    map.removeLayer(recom_mark_list.pop());
                }
            }
            var rec = JSON.parse(recom_data);
            for (let i = 0; i < rec["data"].length; i++) { 
                console.log(rec["data"][i])
                recm = rec["data"][i]
                recom_mark = new L.marker([recm[3],recm[2]],{draggable: false});
                recom_mark.bindPopup(`
                <b>${recm[0]}</b>
                <br>${recm[1]}
                <input type=\"button\" onclick=\"add_point_to_road()\" value=\"Добавить в маршрут\" />`);
                recom_mark_list.push(recom_mark);
                map.addLayer(recom_mark);
            }


        }

    }
} 

function add_point_to_road() {
    console.log("Я вызвалось")
    points_list.push([recm[3],recm[2]])
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
