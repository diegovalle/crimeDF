cuadrantes <- readOGR(file.path("cuadrante-shps", "cuadrantes-sspdf-poblacion.shp"), 
                      layer = "cuadrantes-sspdf-poblacion")
fcuadrantes <- fortify(cuadrantes, region = "id")

sectores <- readOGR(file.path("cuadrante-shps", "sectores.shp"), layer = "sectores")
fsector <- fortify(sectores, region = "sector")

mcrime <- local({pop <- cuadrantes@data[,c("id",  "sector",  "SUMPOB1")]
                 
                 mcrime <- merge(mcrime, pop, by.x = "cuadrante", by.y = "id", all.x = TRUE)
                 names(mcrime) <- c("cuadrante", "crime", "date", "count", "year", "sector",
                                    "population")
                 write.csv(mcrime, file.path("clean-data", "df-crime.csv"), row.names = FALSE)
                 mcrime
})