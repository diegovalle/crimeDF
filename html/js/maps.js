var margin = {top: 10, left: 10, bottom: 10, right: 10}
, width = parseInt(d3.select('#map-homicide').style('width'))
, width = width - margin.left - margin.right
, mapRatio = 1.5
, height = width * mapRatio;
var data, crimeData;
//Extra width for the tooltips
var width = 400,
    height = 500;
comma = d3.format("0,000");


createQuantized=function(domain, name) {
    return(d3.scale.quantize()
        .domain(domain)
        .range(d3.range(9).map(function(i) { return name + i + "-9"; })));

}

var max = d3.max(d3.entries(data), function(d) {
    return d3.max(d3.entries(d.value), function(e) {
        return d3.max(e.value);
    });
});


// findRange=function(name) {
//     var range = d3.extent(d3.entries(crimeData[name]), function(d) {
//         return d3.sum(d.value);
//     });
//     return(range);
// }





var projection = d3.geo.projection(function(x, y) { return [x, y];})
    .precision(0).scale(1).translate([0, 0]);

var path = d3.geo.path()
    .projection(matrix(.4, 0, 0, .4, 0, 25));

function matrix(a, b, c, d, tx, ty) {
    return d3.geo.transform({
        point: function(x, y) { this.stream.point(a * x + b * y + tx, c * x + d * y + ty); }
    });
}

var svgHomicide = d3.select("#map-homicide").append("svg")
    .attr("width", width)
    .attr("height", height);

var svgRNCV = d3.select("#map-rncv").append("svg")
    .attr("width", width)
    .attr("height", height);

var svgRVCV = d3.select("#map-rvcv").append("svg")
    .attr("width", width)
    .attr("height", height);

var svgRVSV = d3.select("#map-rvsv").append("svg")
    .attr("width", width)
    .attr("height", height);

var svgVIOL = d3.select("#map-viol").append("svg")
    .attr("width", width)
    .attr("height", height);

tip = function(crimeCode) {
    return(d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 10])
    .html(function(d) {
        return "<span>" + d.properties.sector + (topoName === "sectores" ? "" : " - " + d.properties.id) + 
            " ⇨ " + d.properties[crimeCode] + "</span>";
    }));
};
tipHom = tip('hom');
svgHomicide.call(tipHom);
tipRNCV = tip('rncv');
svgRNCV.call(tipRNCV);
tipRVCV = tip('rvcv')
svgRVCV.call(tipRVCV);
tipRVSV = tip('rvsv');
svgRVSV.call(tipRVSV);
tipVIOL = tip('viol');
svgVIOL.call(tipVIOL);

createMap=function(df, svg, crime, crimeCode, colorFun, titleId, chart, topoNam, tipFun, seriesName) {
    type = topoName === "cuadrantes" ? "id" : "sector";
    svg.append("g")
        .attr("class", "subdivisions")
        .selectAll("path")
        .data(topojson.feature(df, df.objects[topoName]).features)
        .enter().append("path")
        .attr("class", function(d) { 
            return colorFun(d.properties[crimeCode]); 
        })
        .attr("d", path)
        .attr("title", function(d) { return +d.properties.sector; })
        .on("mouseover", tipFun.show)
        .on("mouseout", tipFun.hide)
        .on("mousedown", function(d) {
            data = crimeData[crimeCode][d.properties[type]].slice(0);
            data.unshift(seriesName);
            chart.load({
                columns: [data],
            });
            d3.select(titleId).text(crime + " / " + d.properties.sector + (topoName === "sectores" ? "" : " / " + d.properties.id));
        });
}


d3.select(self.frameElement).style("height", height + "px");





function createLineChart(selection, totalCrime, labelText, color) {
    name = totalCrime[0];
    var chart1 = c3.generate({
        padding: {
        //    top: 0,
            right: 20,
        //    bottom: 0,
        //    left: 20,
        },
        bindto: selection,
        point: { show: false },
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
            //types:{'Homicides':'area', 
            //       'Violent robberies to a business':'area'},
            color: function(d) {return color}
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
                title: function (d) { d; },
                value: function (value, ratio, id) {
                    var format = d3.format('');
                    return format(value);
                }
                //            value: d3.format(',') // apply this format to both y and y2
            }
        }
    });
    return chart1;
}

createLegend=function(selection, colorFun){
    var legend = d3.select(selection)
        .append('ul')
        .attr('class', 'list-inline');

    var keys = legend.selectAll('li.key')
        .data(colorFun.range());

    keys.enter().append('li')
        .attr('class', function(d) {return('key ' + String(d))})
        .text(function(d) {
            var r = colorFun.invertExtent(d);
            return d3.round(r[0], 0);
        });
}

// var topoName = 'cuadrantes';    
// var mapFile = "js/cuadrantes.json";
// var crimeFile = "js/hom-dol-cuad.js";
d3.json(mapFile, function(error, df) {      
    d3.json(crimeFile, function(data) {
        findRange=function(name) {
            return(d3.extent(d3.entries(df.objects[topoName].geometries), function(d){return(+d.value.properties[name])} ));
        }

        crimeData=data
        quantizeRed = createQuantized(findRange('hom'), "Redsq")
        quantizeBlue = createQuantized(findRange('rncv'), "Bluesq")
        quantizePurple = createQuantized(findRange('rvcv'), "Purplesq")
        quantizeGreen = createQuantized(findRange('rvsv'), "Greensq")
        quantizeGray = createQuantized(findRange('viol'), "Graysq")
        createMap(df, svgHomicide, 'Homicides','hom', quantizeRed, '#homicide-title', chartHomicides, topoName, tipHom, HomicidesA[0]);
        createMap(df, svgRNCV, 'Violent robberies to a business', 'rncv', quantizeBlue, '#rncv-title', chartrncv, topoName, tipRNCV, rncvA[0]);
        createMap(df, svgRVCV, 'Violent car robberies', 'rvcv', quantizePurple, '#rvcv-title', chartrvcv, topoName, tipRVCV, rvcvA[0]);
        createMap(df, svgRVSV, 'Non-violent car robberies', 'rvsv', quantizeGreen, '#rvsv-title', chartrvsv, topoName, tipRVSV, rvsvA[0]);
        createMap(df, svgVIOL, 'Rape', 'viol', quantizeGray, '#viol-title', chartviol, topoName, tipVIOL, violA[0]);
        createLegend('#legend-homicides', quantizeRed)
        createLegend('#legend-rncv', quantizeBlue)
        createLegend('#legend-rvcv', quantizePurple)
        createLegend('#legend-rvsv', quantizeGreen)
        createLegend('#legend-viol', quantizeGray)
    });
});



chartHomicides = createLineChart('#chart-homicide',
                                 HomicidesA,
                                 crimePrefix + 'homicides',
                                 'rgb(203,24,29)')

chartrncv = createLineChart('#chart-rncv',
                            rncvA,
                            crimePrefix + 'violent robberies to a business','rgb(8,48,107)' )

chartrvcv = createLineChart('#chart-rvcv',
                            rvcvA,
                            crimePrefix + 'violent car robberies','rgb(63,0,125)')

chartrvsv = createLineChart('#chart-rvsv',
                            rvsvA,
                            crimePrefix + 'non-violent car robberies','rgb(0,68,27)')

chartviol = createLineChart('#chart-viol',
                            violA,
                            crimePrefix + 'rapes','rgb(0,0,0)')
