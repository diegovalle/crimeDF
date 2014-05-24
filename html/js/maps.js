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


findRange=function(name) {
    var range = d3.extent(d3.entries(crimeData[name]), function(d) {
        return d3.sum(d.value);
    });
    return(range);
}




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

var svgRobbery = d3.select("#map-rncv").append("svg")
    .attr("width", width)
    .attr("height", height);

var svgRVCV = d3.select("#map-rvcv").append("svg")
    .attr("width", width)
    .attr("height", height);

var svgRVSV = d3.select("#map-rvsv").append("svg")
    .attr("width", width)
    .attr("height", height);

createMap=function(df, svg, crime, crimeCode, colorFun, titleId, chart, topoName) {
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
        .on("mouseover", function(d) {
            var xPosition = d3.mouse(this)[0] ;//- 30;
            var yPosition = d3.mouse(this)[1] - 20;
            
            svg.append("text")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .attr("text-anchor", "middle")
                .style("font-size", ".7em")
                .text(d.properties.sector + (topoName === "sectores" ? "" : " - " + d.properties.id));
            
            d3.select(this)
                .attr("class", "selected");
            
        })
        .on("mousedown", function(d) {
            data = crimeData[crimeCode][d.properties[type]].slice(0);
            data.unshift(crime);
            chart.load({
                columns: [data],
            });
            d3.select(titleId).text(crime + " / " + d.properties.sector + " / " + d.properties.id);
        })
        .on("mouseout", function(d) {
            d3.select("#tooltip").remove();
            
            d3.select(this)
                .transition()
                .attr("class", function(d) { return colorFun(d.properties[crimeCode]); })
                .duration(250)
        });
}


d3.select(self.frameElement).style("height", height + "px");



chartHomicides = createLineChart('#chart-homicide',
                         ['Homicides', 66, 80, 94, 76, 99, 91, 61, 79, 
                          60, 70, 62, 61, 70, 54, 91 ],
                        'number of homicides',
                                 'rgb(203,24,29)')

chartrncv = createLineChart('#chart-rncv',
                            ['Violent robberies to a business', 380, 348, 352, 293, 329, 375, 357, 368, 364, 374, 410, 340, 326, 254, 234 ],
                            'number of violent robberies to a business','rgb(8,48,107)' )

chartrvcv = createLineChart('#chart-rvcv',
                            ['Violent car robberies', 443, 415, 356, 369, 444, 409, 422, 442, 412, 512, 553, 434, 500, 395, 391 ],
                            'number of violent car robberies','rgb(63,0,125)')

chartrvsv = createLineChart('#chart-rvsv',
                            ['Non-violent car robberies', 1016, 937, 905, 1009, 1037, 1062, 982, 1051, 965, 995, 1057, 998, 1046, 911, 871 ],
                            'number of non-violent car robberies','rgb(0,68,27)')

function createLineChart(selection, totalCrime, labelText, color) {
    var chart1 = c3.generate({
        bindto: selection,
        data: {
            x: 'x',
            columns: [
                [ "x", "2013-01-15", "2013-02-15", "2013-03-15", "2013-04-15", 
                  "2013-05-15", "2013-06-15", "2013-07-15", "2013-08-15", 
                  "2013-09-15", "2013-10-15", "2013-11-15", "2013-12-15", 
                  "2014-01-15", "2014-02-15", "2014-03-15" ],
                totalCrime
            ],
            color: function(d) {return color}
        },
        axis: {
            x: {
                
                type: 'timeseries',
                tick: {count:4,
                       format: '%Y-%b'
                      }
            },
            y: {
                min: 0,
                label: {
                    text: labelText, 
                    position:'outer-middle'
                },
                padding: {
                    top:0, 
                    bottom:0}
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

    digit = d3.format("04d")

    keys.enter().append('li')
        .attr('class', function(d) {return('key ' + String(d))})
        .text(function(d) {
            var r = colorFun.invertExtent(d);
            return d3.round(r[0], 0);
        });
}

var topoName = 'sectores';
var mapFile = "js/sectores.json";
var crimeFile = "js/hom-dol-sector.js";

var topoName = 'cuadrantes';
var mapFile = "js/cuadrantes.json";
var crimeFile = "js/hom-dol-cuad.js";

d3.json(mapFile, function(error, df) {      
    d3.json(crimeFile, function(data) {
        crimeData=data
        quantizeRed = createQuantized(findRange('hom'), "Redsq")
        quantizeBlue = createQuantized(findRange('rncv'), "Bluesq")
        quantizePurple = createQuantized(findRange('rvcv'), "Purplesq")
        quantizeGreen = createQuantized(findRange('rvsv'), "Greensq")
        createMap(df, svgHomicide, 'Homicides','hom', quantizeRed, '#homicide-title', chartHomicides, topoName);
        createMap(df, svgRobbery, 'Violent robberies to a business', 'rncv', quantizeBlue, '#rncv-title', chartrncv, topoName);
        createMap(df, svgRVCV, 'Violent car robberies', 'rvcv', quantizePurple, '#rvcv-title', chartrvcv, topoName);
        createMap(df, svgRVSV, 'Non-violent car robberies', 'rvsv', quantizeGreen, '#rvsv-title', chartrvsv, topoName);
        createLegend('#legend-homicides', quantizeRed)
        createLegend('#legend-rncv', quantizeBlue)
        createLegend('#legend-rvcv', quantizePurple)
        createLegend('#legend-rvsv', quantizeGreen)
    });
});

