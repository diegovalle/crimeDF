//http://201.144.220.174/pid/gps/cuadrantesWeb.php?delegacionsx=10
//respuesta[1]=1


//run http://201.144.220.174/pid/gps/cuadrantesWeb.php
//http://201.144.220.174/pid/gps/showCuadrante2.php?delegacionsx=1


//JSON.stringify(polys)
//JSON.stringify(names)
//JSON.stringify(msg)
(function () {
    'use strict';

    var html = "http://201.144.220.174/pid/gps/showCuadrante2.php";
    
    function writeFile(fname, arr) {
        fs.writeFile(fname, JSON.stringify(arr), function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log(fname + " was saved!");
            }
        });
    };
    //console.log(errors);
    var polys = [], names = [], msg = [];
    var http = require('http');
    var fs = require('fs');
    var request = http.get("http://201.144.220.174/pid/gps/showCuadrante2.php", function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            console.log('download successful');
            // clean up the cuadrante data stored in sspdf server
            var cuadrante = data.split("#");	
	    for(var m = 0; m < cuadrante.length; m++){
	        
                //points that make up the polygon lines
	        var cud = cuadrante[m].split("%");
                //the name of the sector each cuadrante belongs to and 
                //an ugly html table with the name of the cops assigned
	        var cord = cud[0].split("|");
                polys.push(cord);
                names.push(cud[1]);
                msg.push(cud[6]);
            }
            writeFile("cuads.json", polys);
            writeFile("names.json", names);
            writeFile("msg.json", msg);
            
            
        });
    });
    request.on('error', function (e) {
        console.log(e.message);
    });
    request.end();
        
}());
