JSON = js/cuads.json js/msg.json js/names.json
.PHONY: all clean

all: $(JSON) cuadrante-shps/cuadrantes-sspdf.shp html/js/cuadrantes.json html/js/sectores.json html/interactive-maps/js/sectores.json

clean:
	rm -rf $(JSON) cuadrante-shps/cuadrantes-sspdf.shp

## Download the polygon coordinates from the police website
$(JSON): input.in.intermediate
.INTERMEDIATE: input.in.intermediate
input.in.intermediate: js/scrape_coordinates.js
	node $^

## Create a shapefile from the polygon coordinates we downloaded
cuadrante-shps/cuadrantes-sspdf.shp: create-sspdf-shp.R $(JSON)
	mkdir -p html/js
	Rscript --no-save --no-restore --verbose create-sspdf-shp.R
	touch $@

## Topojson of the police cuadrantes
html/js/cuadrantes.json: cuadrante-shps/cuadrantes-sspdf-poblacion.shp
#topojson --id-property=id -s 1e-9  -o $@ --properties sector,id -- cuadrantes=$^
	topojson \
	--width 960 \
	--height 800 \
	--margin 0 \
	--external-properties data/topo-cuadrantes.csv \
	--id-property=id  \
	-s .1 \
	--projection 'd3.geo.mercator()' \
	-o $@ \
	--properties sector,id,hom,rncv,rvcv,rvsv \
	cuadrantes=$^

html/interactive-maps/js/sectores.json: cuadrante-shps/sectores.shp
	topojson --id-property=sector --external-properties data/interactive-sectores.csv -s 1e-10 -o $@ --properties sector,population,id,hom,rncv,rvcv,rvsv -- sectores=$^	
## Topojson of the police sectors (made up of many cuadrantes)
html/js/sectores.json: cuadrante-shps/sectores.shp
	topojson \
	--width 960 \
	--height 800 \
	--margin 0 \
	--external-properties data/topo-sectores.csv \
	--id-property=sector  \
	-s .9 \
	--projection 'd3.geo.mercator()' \
	-o $@ \
	--properties sector,id,hom,rncv,rvcv,rvsv \
	sectores=$^

clean-data/df-crime.csv: run-all.R
	Rscript --no-save --no-restore --verbose $^
