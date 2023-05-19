
const map = L.map('map');

map.doubleClickZoom.disable();

var greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


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
    "По умолчанию": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',   {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),
    Топографичейский: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                            maxZoom: 17,
                            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                        }),
    Стпутник: group,
};

L.control.layers(basemaps).addTo(map);


var points_list = {};
var last_point_lists_lenght = 0;

//переделывается wip
function onMapClick(e) {
    debugger
    if (Object.keys(points_list).length==0){
        loc1 = new L.marker(e.latlng, {draggable: true, icon: greenIcon});
    }
    else{
        loc1 = new L.marker(e.latlng, {draggable: true, icon: redIcon});
    }

    // loc1.on("mouseover", function(e){e.target.style.cursor = 'move';});
    // loc1.on("mouseout", function(e){e.target.style.cursor = 'move';});

    loc1.on('dragend', function(event) {
        var changedPos = event.target.getLatLng();
        points_list[event.target._leaflet_id] = [changedPos["lat"],changedPos["lng"]]
        sendPost();
    });
    map.addLayer(loc1);
    points_list[loc1._leaflet_id] = [e.latlng["lat"],e.latlng["lng"]];
    // else{
    //     loc1 = new L.marker(e.latlng, {draggable: true});
    //     loc1.on('dragend', function(event) {
    //         var changedPos = event.target.getLatLng();
    //         points_list[event.target._leaflet_id] = [changedPos["lat"],changedPos["lng"]]
    //         sendPost();
    //     });
    //     map.addLayer(loc1);
    //     points_list[loc1._leaflet_id] = [e.latlng["lat"],e.latlng["lng"]];
    // }
    if ((Object.keys(points_list).length>=2) && (Object.keys(points_list).length != last_point_lists_lenght)){
        last_point_lists_lenght = Object.keys(points_list).length
        console.log("after drag")
        sendPost()
    } 
};
map.on('dblclick', function(e) {
    onMapClick(e);
});

var polyline;
var recom_mark_list = {};
var counter = 0

//Отправка запроса на создание маршрута и рекомендаций
async function sendPost() {
    if (Object.keys(points_list).length >= 2) {
        point_keys_list = Object.keys(points_list);
        //Передалть просто под список координат
        params = ''
        //params = [points_list[point_keys_list[0]][1],points_list[point_keys_list[0]][0]]
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
        console.log(data);
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
                <br><input id = ${recom_mark._leaflet_id} type=\"button\" onclick=\"add_point_to_road(this); \" value=\"Добавить в маршрут\" />
                <input id = ${recom_mark._leaflet_id}_d type=\"button\" onclick=\"delete_point_on_road(this); \" value=\"Удалить из маршрута\" disabled/>`);
                recom_mark_list[recom_mark._leaflet_id] = recom_mark;
                console.log(`${recom_mark._leaflet_id}_d`);  
            }


        }

    }
} 

//Добавление метки в маршрут
function add_point_to_road(recom_mark) {
    console.log(recom_mark)
    mrk = recom_mark_list[recom_mark.id].getLatLng()
    points_list[recom_mark.id] = [mrk["lat"],mrk["lng"]]
    delete recom_mark_list[recom_mark.id]
    document.getElementById(`${recom_mark.id}`).disabled = true;
    document.getElementById(`${recom_mark.id}_d`).disabled = false;  
    sendPost()
}

//Удаление метки
function delete_point_on_road(mark){
    // sendPost()
}

//Поисковая строка
const provider = new window.GeoSearch.OpenStreetMapProvider();
debugger
const search = new GeoSearch.GeoSearchControl({
provider: provider,
style: 'button',
updateMap: true,
autoClose: false,
searchLabel: "Введите адрес"
});
map.addControl(search);

// L.Control.RemoveAll = L.Control.extend(
//     {
//         options:
//         {
//             position: 'topleft',
//         },
//         onAdd: function (map) {
//             var controlDiv = L.DomUtil.create('div', 'leaflet-draw-toolbar leaflet-bar');
            
//             L.DomEvent
//                 // .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
//                 // .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
//                 .addListener(controlDiv, 'click', function () {
//                     console.log("hello")
//                 }
//             );
//             var controlUI = L.DomUtil.create('a', 'leaflet-draw-edit-remove', controlDiv);
//             controlUI.title = 'Remove All Polygons';
//             controlUI.href = '#';
//             return controlDiv;
//         }
//     });
//     var removeAllControl = new L.Control.RemoveAll();
//     map.addControl(removeAllControl);

