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
                 
                 mcrime2 <- mcrime
                 mcrime2$population[which(is.na(mcrime2$population) & 
                                      mcrime2$cuadrante != "NO ESPECIFICADO")] <- 0
                 mcrime2$sector <- as.character(mcrime2$sector)
                 mcrime2$sector[is.na(mcrime2$sector)]  <- "NO ESPECIFICADO"
                 mcrime2$date <- as.Date(mcrime2$date)
                 mcrime2 <- subset(mcrime2, date <= lastGood)
                 write.csv(mcrime2, file.path("clean-data", "cuadrantes.csv"), row.names = FALSE)
                 mcrime
})
