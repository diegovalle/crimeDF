Federal District Crime Information
===================================

This program scrapes the cuadrante polygon coordinates from the SSPDF's [cuadrante delictivo map](http://201.144.220.174/pid/gps/cuadrantesWeb.php?delegacionsx=10), it also cleans them and saves them as shapefiles in the cuadrantes-shps directory and as topojson in the html/js/cuadrantes-map.json file. It also cleans the PDF document of crime at the cuadrante level obtained from a FOIA request available in the _sspdf-data_ directory. The clean data also includes population figures obtained by using a point-in-polygon algorithm from the 2010 Census at the manzana level

Requirements
-----------------

* Node.js
* R
* Topojson

To recreate the whole analysis just run:

```
make
```

If you only care about the cuadrante crime data it is available from the __data/crime-df.csv__ file.
