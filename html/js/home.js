var cuadsGeojson, singleGeojson, polygonCuads= [], 
    polygonSectors = [], sectorsGeojson, map;
var cuadsLayer, sectorsLayer, singleLayer;
var latLng;
var chartHomicides, chartrncv,
    chartrvcv,chartrvsv,chartviol,
    barHomicides,
    crimeData;
var crime = {hom:[],rncv:[],
             rvcv:[], rvsv:[],
             viol:[]};
var crimeCompare = {hom:0,rncv:0,
                    rvcv:0, rvsv:9,
                    viol:0};
var sql_statement;
var last3Months_sql = "SELECT sum(count) as count,sum(population)/3 as population, crime FROM cuadrantes where cuadrante='C-1.1.1' and (date='2014-07-01' OR date='2014-06-01' or date='2014-05-01') GROUP BY crime"

$.getJSON('js/cuadrantes-map.json', function (cuads) {
    $.getJSON('js/sectores-map.json', function (secs) {
        $.getJSON('js/single.json', function (single) {
            var southWest = L.latLng(19.152952023808638, -99.55192565917969),
            northEast = L.latLng(19.597959855171077, -98.67919921875),
                bounds = L.latLngBounds(southWest, northEast);
            map = L.map('map', {
                maxBounds: bounds,
                maxZoom: 19,
                minZoom: 10
            });

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
            singleGeojson = topojson.feature(single, single.objects.single).features;
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
        crime.hom.push('DF Homicides');
        crime.rncv.push('DF Violent robberies to a business');
        crime.rvcv.push('DF Vehicle robberies with violence');
        crime.rvsv.push('DF Vehicle robberies without violence');
        crime.viol.push('DF Rape');
        $.each(data.rows, function(i, value){
            switch(value.crime) {
            case "Homicidio doloso":               
                crime.hom.push(value.count);
                break;
            case "Robo a negocio C/V":
                crime.rncv.push(value.count);
                break;
            case "Robo de vehiculo automotor C/V":
                crime.rvcv.push(value.count);
                break;
            case "Robo de vehiculo automotor S/V":
                crime.rvsv.push(value.count);
                break;
            case "Violacion":
                crime.viol.push(value.count);
                        break;
            }
        });
        len = crime.hom.length;
        crimeCompare.hom = 0
        for(var i=crime.hom.length;i>(crime.hom.length-11);i--)
            crimeCompare.hom += crime.hom[i-1] 
        crimeCompare.hom  = (crimeCompare.hom / data.rows[0].population) * Math.pow(10,5)
        chartHomicides.load({
            columns: [crime.hom],
        });
        chartrncv.load({
            columns: [crime.rncv],
        });
        chartrvcv.load({
            columns: [crime.rvcv],
        });
        chartrvsv.load({
            columns: [crime.rvsv],
        });
        chartviol.load({
            columns: [crime.viol],
        });
        barHomicides.load({
            columns: [["Cuadrante", crimeCompare.hom]],
        });
        
    });
}

function createMarker(lat, lng) {
    chartHomicides = createLineChart('#chart-homicide',
                                     HomicidesA,
                                     'number of homicides',
                                     'rgb(203,24,29)');
    barHomicides = createBarChart("#barchart-homicide", 10, 'rgb(203,24,29)');
    chartrncv = createLineChart('#chart-rncv',
                                rncvA,
                                'number of violent robberies to a business','rgb(8,48,107)' )

    chartrvcv = createLineChart('#chart-rvcv',
                                rvcvA,
                                'number of violent car robberies','rgb(63,0,125)')

    chartrvsv = createLineChart('#chart-rvsv',
                                rvsvA,
                                'number of non-violent car robberies','rgb(0,68,27)')

    chartviol = createLineChart('#chart-viol',
                                violA,
                                'number of rapes','rgb(0,0,0)')

    //Check if the location is inside the DF
    singleLayer = L.geoJson(singleGeojson);
    isDF = leafletPip.pointInLayer(L.latLng(lat,lng), singleLayer, true);
    if(!isDF[0]){
        lat= 19.432605540309215;
        lng= -99.133208;
    }
        
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
            // $.each(sectorsLayer._layers, function(i, value){
            // if(value.feature.id == polygonCuads[0].feature.properties.sector)
            //     polygonSectors[0] = value
            // });
            polygonCuads[0].addTo(map);
            //polygonSectors[0].setStyle({fillColor: '#fff',
            //                            color: '#000', opacity:1})
            //polygonSectors[0].addTo(map);

            sql_statement = "SELECT count, date, crime, population FROM cuadrantes where cuadrante='"+ polygonCuads[0].feature.id + "' ORDER BY crime,date";
            get_data(sql_statement);
            
            
        }
    });    
    cuadsLayer = L.geoJson(cuadsGeojson);
    sectorsLayer = L.geoJson(sectorsGeojson);
    polygonCuads = leafletPip.pointInLayer(marker.getLatLng(), cuadsLayer, true);
    sql_statement = "SELECT count, date, crime, population FROM cuadrantes where cuadrante='"+ polygonCuads[0].feature.id + "' ORDER BY crime,date";
    marker.addTo(map);
       //$.each(sectorsLayer._layers, function(i, value){
    //    if(value.feature.id == polygonCuads[0].feature.properties.sector)
    //        polygonSectors[0] = value
    //});
    polygonCuads[0].addTo(map);
    //polygonSectors[0].setStyle({fillColor: '#fff',color: '#000', opacity:1})
    //polygonSectors[0].addTo(map);
   
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

function createBarChart(selection, DFRate, color){
    var chart = c3.generate({
        bindto: selection,
        data: {
            columns: [
                ['All DF', DFRate],
                ['Cuadrante', 0]
            ],
            type: 'bar',
            colors: {
                "All DF": "#444",
                "Cuadrante": color,
                }
        },
        bar: {
            width: {
                ratio: 0.5 // this makes bar width 50% of length between ticks
            }
            // or
            //width: 100 // this makes bar width 100px
        },
        axis:{
            y:{
                min:-7,
                tick : {format: function (d) { return ""  } },
            }
        },
        tooltip: {
            format: {
                value: function (value, ratio, id) {
                    return value //+', '+ crimeCompare.hom;
                }
                //            value: d3.format(',') // apply this format to both y and y2
            }
        }
    });
    return(chart);
}

function createLineChart(selection, totalCrime, labelText, color) {
    name=totalCrime[0];
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
                [name,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ],
            colors: {
                "DF Homicides": color,
                "DF Violent robberies to a business": color,
                'DF Violent car robberies': color,
                'DF Non-violent car robberies': color,
                'DF Rape': color
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
                    text: "count", 
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


HomicidesA = ['DF Homicides', 62, 81, 89, 76, 97, 90, 59, 78, 60, 68, 60, 58, 69, 54, 90, 76, 62, 78, 70 ], rncvA = ['DF Violent robberies to a business', 389, 355, 355, 297, 328, 361, 379, 363, 348, 374, 420, 348, 306, 270, 248, 278, 260, 287, 365 ], rvcvA = ['DF Vehicle robberies with violence', 488, 492, 432, 434, 503, 487, 470, 501, 457, 587, 612, 510, 560, 493, 506, 474, 507, 457, 544 ], rvsvA = ['DF Vehicle robberies without violence', 944, 851, 850, 912, 949, 990, 930, 990, 903, 917, 971, 931, 980, 825, 864, 803, 884, 708, 807 ], violA = ['DF Rape', 64, 64, 46, 34, 40, 36, 45, 46, 27, 44, 34, 33, 23, 35, 46, 41, 51, 38, 43 ];



    
// data = crimeData[crimeCode][d.properties[type]].slice(0);
// data.unshift(seriesName);
// chart.load({
//     columns: [data],
// });
// d3.select(titleId).text(crime + " / " + d.properties.sector + (topoName === "sectores" ? "" : " / " + d.properties.id));
