
.PHONY: all clean

all: cuadrante-shps/cuadrantes-sspdf.shp html/js/cuadrantes.json html/js/sectores.json

clean:
	rm -rf cuadrante-shps/cuadrantes-sspdf.shp

html/js/cuadrantes.json: cuadrante-shps/cuadrantes-sspdf-poblacion.shp
	topojson --id-property=id -s 1e-7 -o $@ -- cuadrantes=$^

html/js/sectores.json: cuadrante-shps/sectores.shp
	topojson --id-property=sector -s 1e-7 -o $@ -- sectores=$^

cuadrante-shps/cuadrantes-sspdf.shp: create-sspdf-shp.R
	mkdir -p html/js
	Rscript $^
	touch $@

clean-data/df-crime.csv: run-all.R
	Rscript $^
