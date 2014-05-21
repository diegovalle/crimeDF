//http://201.144.220.174/pid/gps/cuadrantesWeb.php?delegacionsx=10
//respuesta[1]=1


//run http://201.144.220.174/pid/gps/cuadrantesWeb.php
polys = []
names = []
msg = []
//http://201.144.220.174/pid/gps/showCuadrante2.php?delegacionsx=1
$.post("showCuadrante2.php?",{ya:"manceraespurio"},function(datoCuadrante){
						
					
						cuadrante=datoCuadrante.split("#");	
						for(var m=0; m<cuadrante.length; m++){
							
							var cud=cuadrante[m].split("%");
							var cord=cud[0].split("|");
                                                        polys.push(cord);
                                                        names.push(cud[1]);
                                                        msg.push(cud[6]);
}
})

JSON.stringify(polys)
JSON.stringify(names)
JSON.stringify(msg)
