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
    fs.writeFileSync(fileName + ".html", output, 'utf-8');
};

var createTemplate = function(scaleName, property, title, page, fileName) {
    var context = {scaleFun: scaleName,
		   varName: property,
                   titleName : title};
    compileTemplate(page, context, fileName);
};


createTemplate("scaleHomicide","hom", "Homicide Rates", page, "homicide");

createTemplate("scaleRNCV", "rncv", "Violent robberies to a business", page, "rncv");

createTemplate("scaleRVCV", "rvcv", "Violent car robberies", page, "rvcv");

createTemplate("scaleRVSV","rvsv", "Non-violent car robberies", page, "rvsv");

