#!/usr/bin/env node

//the translation strings
var hogan = require('hogan.js')
  , fs    = require('fs')
  , prod  = process.argv[2] == 'production';

//read the html template
var page = fs.readFileSync('./leaflet.mustache', 'utf-8');

// var context = {scaleFun: "scaleHawt",
// 	   varname: "hawt"};

// var template = hogan.compile(page, { sectionTags: [{o:'_i', c:'i'}] });
// var output = template.render(context);
// fs.writeFileSync('./hoyodelobukis.html', output, 'utf-8');


var compileTemplate = function(page, context, fileName) {
    var template = hogan.compile(page, { sectionTags: [{o:'_i', c:'i'}] });
    var output = template.render(context);
    fs.writeFileSync("../html/" + fileName + ".html", output, 'utf-8');
};

var createTemplate = function(scaleName, property, title, level, page, fileName) {
    var context = {scaleFun: scaleName,
		   varName: property,
                   titleName : title,
                   level : level};
    compileTemplate(page, context, fileName);
};


createTemplate("scaleHomicide","hom_rate", "Homicide Rates", "sectores", page, "homicide-sectores");

createTemplate("scaleRNCV", "rncv_rate", "Violent robberies to a business", "sectores", page, "rncv-sectores");

createTemplate("scaleRVCV", "rvcv_rate", "Violent car robberies", "sectores",page,"rvcv-sectores");

createTemplate("scaleRVSV","rvsv_rate", "Non-violent car robberies", "sectores",page, "rvsv-sectores");


createTemplate("scaleHomicide","hom_count", "Homicide Counts", "cuadrantes", page, "homicide-cuadrantes");
createTemplate("scaleRNCV","rncv_count", "Violent robberies to a business (counts)", "cuadrantes", page, "rncv-cuadrantes");
createTemplate("scaleRVCV","rvcv_count", "Violent car robberies (counts)", "cuadrantes", page, "rvcv-cuadrantes");
createTemplate("scaleRVSV","rvsv_count", "Non-violent car robberies (counts)", "cuadrantes", page, "rvsv-cuadrantes");
