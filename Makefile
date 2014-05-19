
.PHONY: all clean

all: cuadrante-shps/cuadrantes-sspdf.shp

clean:
	rm -rf cuadrante-shps/cuadrantes-sspdf.shp

cuadrante-shps/cuadrantes-sspdf.shp: create-sspdf-shp.R
	Rscript $^
	touch $@	

