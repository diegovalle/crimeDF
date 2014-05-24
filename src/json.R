formatCuadranteForJSON <- function(mcrime, crime.type) {
  js <- ddply(subset(mcrime[order(mcrime$cuadrante, mcrime$date),], 
                     crime == crime.type)[,c("cuadrante", "count")],
              .(cuadrante), function(x) x$count)
  nam <- js$cuadrante
  js$cuadrante <- NULL
  js <- as.data.frame(t(js))
  names(js) <- nam
  return(js)
}

formatSectorForJSON <- function(mcrime, crime.type) {
  js <- ddply(subset(mcrime[order(mcrime$sector, mcrime$date),], 
               crime == crime.type),
        .(sector, date), summarise, count = sum(count)/sum(population)*10^5 *12/15)
  js <- ddply(js[,c("sector", "count")],
              .(sector), function(x) x$count)
  nam <- js$sector
  js$sector <- NULL
  js <- as.data.frame(t(js))
  names(js) <- nam
  return(js)
}

date.total <- ddply(mcrime, .(crime, date), summarise,
                    count = sum(count))
date.total$date <- as.Date(date.total$date)
total <- cast(date.total, date ~ crime, value = "count")
names(total) <- c("Homicidio doloso", "Robo a negocio C/V",
                  "Robo de vehiculo automotor C/V",
                  "Robo de vehiculo automotor S/V")
toJSON(total[,-1], dataframe = "column")



js <- list(hom=formatCuadranteForJSON(mcrime, "Homicidio doloso"),
           rncv=formatCuadranteForJSON(mcrime, "Robo a negocio C/V"),
           rvcv=formatCuadranteForJSON(mcrime, "Robo de vehiculo automotor C/V"),
           rvsv=formatCuadranteForJSON(mcrime, "Robo de vehiculo automotor S/V"))
js <- toJSON(js, dataframe = "column")
fh <- file("html/js/hom-dol-cuad.js", "w")
writeLines(js, fh)
close(fh)


js <- list(hom=formatSectorForJSON(mcrime, "Homicidio doloso"),
           rncv=formatSectorForJSON(mcrime, "Robo a negocio C/V"),
           rvcv=formatSectorForJSON(mcrime, "Robo de vehiculo automotor C/V"),
           rvsv=formatSectorForJSON(mcrime, "Robo de vehiculo automotor S/V"))
js <- toJSON(js, dataframe = "column")
fh <- file("html/js/hom-dol-sector.js", "w")
writeLines(js, fh)
close(fh)

#for merging with cuadrante topojson
topo <- ddply(mcrime, .(crime, cuadrante), summarise,
              count = sum(count))
topo <- cast(topo, cuadrante ~ crime, value = "count")
names(topo) <- c("id", "hom", "rncv", "rvcv", "rvsv")
apply(topo[,-1], 2, function(x) range(x))
write.csv(topo, "data/topo-cuadrantes.csv", row.names = FALSE)



#for merging with sector topojson
crimme.cuadrante <- ddply(mcrime, 
                      .(crime, cuadrante), summarise,
                      total = sum(count),
                      population = population[1],
                      sector = sector[1],
                      rate = (sum(count, na.rm = TRUE)/ sum(population, na.rm = TRUE)) * 10 ^ 5*(12/15))
crime.cuadrante <- crime.cuadrante[order(-crime.cuadrante$rate),]

crime.sector <- ddply(crime.cuadrante, 
                      .(crime, sector), summarise,
                      total = sum(total),
                      pop = sum(population, na.rm = TRUE),
                      count = round((sum(total, na.rm = TRUE)/ sum(pop, na.rm = TRUE)) * 10 ^ 5*(12/15),1))
topo <- crime.sector[,c("sector", "crime", "count")]
topo <- cast(topo, sector ~ crime, value = "count")
names(topo) <- c("sector", "hom", "rncv", "rvcv", "rvsv")
apply(topo[,-1], 2, function(x) range(x))
write.csv(topo, "data/topo-sectores.csv", row.names = FALSE)

