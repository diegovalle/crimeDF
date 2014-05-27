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

The shapefile scraped from the cuadrante polygon coordinates actually had some geometry errors (introduced at the source, not from the scrapping), so I cleaned them up in QGIS and saved them as _cuadrantes-sspdf-no-errors.shp_, then I added population data from the 2010 census and saved the file as _cuadrantes-sspdf-poblacion.shp_. There's also a file called _sectores.shp_ with all cuadrantes merged at the sector level.

If you only care about the cuadrante crime data it is available from the __data/crime-df.csv__ file.
