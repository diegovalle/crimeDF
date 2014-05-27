JSON = js/cuads.json js/msg.json js/names.json 
R = graphs/total-sector-hom.png graphs/total-sector-rncv.png \
    graphs/total-sector-rvcv.png data/interactive-cuadrantes.csv \
    data/interactive-sectores.csv data/topo-cuadrantes.csv \
    data/topo-sectores.csv html/js/hom-dol-sector.js \
    html/js/hom-dol-cuad.js clean-data/df-crime.csv
HTML = html/cuadrantes.html html/sectores.html
.PHONY: all clean

all: $(JSON) cuadrante-shps/cuadrantes-sspdf.shp html/js/cuadrantes.json \
     html/js/sectores.json html/js/sectores-map.json \
     html/js/cuadrantes-map.json $(R) \
     node_modules/.bin/hulk $(HTML)

clean:
	rm -rf $(JSON) cuadrante-shps/cuadrantes-sspdf.shp $(R) $(HTML)



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

html/js/cuadrantes-map.json: cuadrante-shps/cuadrantes-sspdf-poblacion.shp
	topojson --id-property=id \
	--external-properties data/interactive-cuadrantes.csv \
	-s 1e-10 \
	-o $@ \
	--properties id,sector,population,id,hom_rate,rncv_rate,rvcv_rate,rvsv_rate,hom_count,rncv_count,rvcv_count,rvsv_count \
	-- cuadrantes=$^

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

html/js/sectores-map.json: cuadrante-shps/sectores.shp
	topojson --id-property=sector \
        --external-properties data/interactive-sectores.csv \
	-s 1e-10 \
        -o $@ \
        --properties sector,population,id,hom_rate,rncv_rate,rvcv_rate,rvsv_rate,hom_count,rncv_count,rvcv_count,rvsv_count \
        -- sectores=$^	

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

$(R): input.in.intermediate2
.INTERMEDIATE: input.in.intermediate2
input.in.intermediate2: run-all.R
	Rscript --no-save --no-restore --verbose $^

node_modules/.bin/hulk:
	npm install hogan.js

$(HTML): input.in.intermediate3
.INTERMEDIATE: input.in.intermediate3
input.in.intermediate3: node_modules/.bin/hulk interactive-maps/index.js interactive-maps/leaflet.mustache
	node interactive-maps/index.js
