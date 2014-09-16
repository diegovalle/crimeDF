var cuadsGeojson, polygonCuads= [], polygonSectors = [], sectorsGeojson, map;
var cuadsLayer, sectorsLayer;
var latLng;
var chartHomicides, crimeData;
var crime = {hom:[],rncv:[],
             rvcv:[], rvsv:[],
             viol:[]};

$.getJSON('js/cuadrantes-map.json', function (cuads) {
    $.getJSON('js/sectores-map.json', function (secs) {
        $.getJSON('js/single.json', function (single) {
            
            map = L.map('map');

            function get_location() {
                if (Modernizr.geolocation) {
                    navigator.geolocation.
                        getCurrentPosition(geoSuccess, geoError,
                                           {enableHighAccuracy:true,
                                            maximumAge: 18000,
                                            timeout: 5000});
                } else {
                    map.setView([lat, lng], 14)
                    createMarker(lat, lng)
                }
            }
            // if (geoPosition.init()) {
            //     geoPosition.getCurrentPosition(geoSuccess, geoError,
            //                                    {enableHighAccuracy:true});
            // }
            // else{
            //     map.setView([lat, lng], 15)
            //     createMarker(lat, lng)
            // }
            function geoSuccess(p) {
                latLng = {
                    lat:p.coords.latitude,
                    lng:p.coords.longitude
                };
                map.setView([latLng.lat, latLng.lng], 14);
                createMarker(latLng.lat, latLng.lng)
            }
            function geoError() {
                if(!latLng){
                    latLng = {
                        lat: 19.432605540309215, 
                        lng: -99.133208
                    };
                    map.setView([latLng.lat, latLng.lng], 14)
                    createMarker(latLng.lat, latLng.lng)
                }
            }
            get_location();
            setTimeout(function () {
                if(!latLng){
                    window.console.log("No confirmation from user, using fallback");
                    geoError();
                }else{
                    window.console.log("Location was set");
                }
            }, 5000+ 1000);

	    L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
	        attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
	        minZoom: 0,
	        maxZoom: 20
	    }).addTo(map);

            var myStyle = {
                "color": "red",
                "fillColor": "#fff",
                "weight": 2,
                "opacity": 1
            };
            var singleGeojson = topojson.feature(single, single.objects.single).features;
            L.geoJson(singleGeojson, {
                style: myStyle
            }).addTo(map);
            sectorsGeojson = topojson.feature(secs, secs.objects.sectores).features;
            cuadsGeojson = topojson.feature(cuads, cuads.objects.cuadrantes).features;
            //map.on('locationfound', onLocationFound);
            //map.locate({setView: true});
        });
        
    } );
    
});

function get_data(sql_statement){
    $.getJSON('http://'+ 'diegovalle'+'.cartodb.com/api/v2/sql/?q='+sql_statement, function(data) {           
        var i = 0;
        crime.hom.length = 0;
        crime.rncv.length = 0;
        crime.rvcv.length = 0;
        crime.rvsv.length = 0;
        crime.viol.length = 0;
        crime.hom.push('Sector homicide rate');
        crime.rncv.push('Sector robbery to a business with violence rate');
        crime.rvcv.push('Sector vehicle robbery with violence rate');
        crime.rvsv.push('Sector vehicle robbery without violence rate');
        crime.viol.push('Sector rape rate');
        $.each(data.rows, function(i, value){
            switch(value.crime) {
            case "Homicidio doloso":               
                crime.hom.push(value.rate);
                chartHomicides.load({
                    columns: [crime.hom],
                });
                break;
            case "Robo a negocio C/V":
                crime.rncv.push(value.rate);
                break;
            case "Robo de vehiculo automotor C/V":
                crime.rvcv.push(value.rate);
                break;
            case "Robo de vehiculo automotor S/V":
                crime.rvsv.push(value.rate);
                break;
            case "Violacion":
                crime.viol.push(value.rate);
                        break;
            }
        });
    });
}

function createMarker(lat, lng) {
    chartHomicides = createLineChart('#chart-homicide',
                                     HomicidesA,
                                     'homicide rate',
                                     'rgb(203,24,29)')
    marker = new L.marker([lat, lng], {draggable: true});
    marker.on('dragend', function(event){
        var marker = event.target;
        var position = marker.getLatLng();
        
        if(polygonCuads)
            if(polygonCuads[0])
                map.removeLayer(polygonCuads[0]);
        if(polygonSectors)
            if(polygonSectors[0])
                map.removeLayer(polygonSectors[0])
        //console.time("PIP");
        polygonCuads = leafletPip.pointInLayer(position, cuadsLayer, true);
        
        if(polygonCuads[0]) {
            $.each(sectorsLayer._layers, function(i, value){
            if(value.feature.id == polygonCuads[0].feature.properties.sector)
                polygonSectors[0] = value
            });
            polygonCuads[0].addTo(map);
            polygonSectors[0].setStyle({fillColor: '#fff',
                                        color: '#000', opacity:1})
            polygonSectors[0].addTo(map);

            sql_statement = "SELECT rate, date, crime FROM sectores where sector='"+ polygonSectors[0].feature.id + "' ORDER BY crime,date"
            get_data(sql_statement);
            
            
        }
    });    
    marker.addTo(map);
    cuadsLayer = L.geoJson(cuadsGeojson);
    sectorsLayer = L.geoJson(sectorsGeojson);
    polygonCuads = leafletPip.pointInLayer(marker.getLatLng(), cuadsLayer, true);
    $.each(sectorsLayer._layers, function(i, value){
        if(value.feature.id == polygonCuads[0].feature.properties.sector)
            polygonSectors[0] = value
    });
    polygonCuads[0].addTo(map);
    polygonSectors[0].setStyle({fillColor: '#fff',color: '#000', opacity:1})
    polygonSectors[0].addTo(map);
    sql_statement = "SELECT rate, date, crime FROM sectores where sector='"+ polygonSectors[0].feature.id + "' ORDER BY crime,date"
    get_data(sql_statement);
    // data = crimeData['hom'][polygonSectors[0].feature.id].slice(0);
    // data.unshift('Sector homicide rate');
    // chartHomicides.load({
    //     columns: [data],
    // });
    /*L.circle(e.latlng, radius).addTo(map);
      map.initlat = e.latlng.lat;
      map.initlng = e.latlng.lng;*/
    // Modify the line chart
    
    //d3.select("#homicide-title").text(polygonSectors[0].feature.id);
}

function createLineChart(selection, totalCrime, labelText, color) {
    name = totalCrime[0];
    var chart1 = c3.generate({
        padding: {
        //    top: 0,
            right: 20,
        //    bottom: 0,
        //    left: 20,
        },
        transition: { duration: 0 },
        bindto: selection,
        point: { show: false },
        regions: [
            {start:"2013-05-15", end:"2013-07-15"},
            {start:"2014-05-15", end:"2014-07-15", class:'foo'}
        ],
        data: {
            x: 'x',
            columns: [
                [ "x", "2013-01-15", "2013-02-15", "2013-03-15", "2013-04-15", 
                  "2013-05-15", "2013-06-15", "2013-07-15", "2013-08-15", 
                  "2013-09-15", "2013-10-15", "2013-11-15", "2013-12-15", 
                  "2014-01-15", "2014-02-15", "2014-03-15", "2014-04-15",
                  "2014-05-15", "2014-06-15", "2014-07-15" ],
                totalCrime
            ],
            colors: {
                "DF homicide rate": 'rgb(0,0,0)',
                "Sector homicide rate": 'rgb(203,24,29)'
            }
            //types:{'Homicides':'area', 
            //       'Violent robberies to a business':'area'},
            //color: function(d)  {
                // d will be 'id' when called for legends
               // return d.id && d.id === 'DF homicide rate' ? d3.rgb(color).darker(color / 150) : color;
            //}
        },
        axis: {
            x: {
                
                type: 'timeseries',
                tick: {count:4,
                       format: '%Y-%B'
                      }
            },
            y: {
                tick : {format: function (d) { return d % 1 == 0 ? d : ""  } },
                min: 0,
                label: {
                    text: labelText, 
                    position:'outer-middle'
                },
                padding: {
                    top:0, 
                    bottom:0}
            }
        },
        tooltip: {
            format: {
                title: function (d) { 
                    var format = d3.time.format("%Y-%B");
                    return format(d); 
                },
                value: function (value, ratio, id) {
                    var format = d3.format('');
                    return format(value);
                }
            }
        }
    });
    return chart1;
}

HomicidesA = ['DF homicide rate', 8.47, 11.06, 12.16, 10.38, 13.25, 12.29, 8.06, 10.65, 8.19, 9.29, 8.19, 7.92, 9.42, 7.38, 12.29, 10.38, 8.47, 10.65, 9.56 ], rncvA = ['Violent robbery to a business rate', 53.13, 48.49, 48.49, 40.57, 44.8, 49.31, 51.76, 49.58, 47.53, 51.08, 57.36, 47.53, 41.79, 36.88, 33.87, 37.97, 35.51, 39.2, 49.85 ], rvcvA = ['Violent car robbery rate', 66.65, 67.2, 59, 59.28, 68.7, 66.52, 64.19, 68.43, 62.42, 80.17, 83.59, 69.66, 76.49, 67.34, 69.11, 64.74, 69.25, 62.42, 74.3 ], rvsvA = ['Non-violent car robbery rate', 128.93, 116.23, 116.1, 124.56, 129.62, 135.22, 127.02, 135.22, 123.33, 125.25, 132.62, 127.16, 133.85, 112.68, 118.01, 109.68, 120.74, 96.7, 110.22 ], violA = ['Rape rate', 8.74, 8.74, 6.28, 4.64, 5.46, 4.92, 6.15, 6.28, 3.69, 6.01, 4.64, 4.51, 3.14, 4.78, 6.28, 5.6, 6.97, 5.19, 5.87 ];


    
// data = crimeData[crimeCode][d.properties[type]].slice(0);
// data.unshift(seriesName);
// chart.load({
//     columns: [data],
// });
// d3.select(titleId).text(crime + " / " + d.properties.sector + (topoName === "sectores" ? "" : " / " + d.properties.id));
