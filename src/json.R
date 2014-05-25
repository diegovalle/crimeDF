formatCuadranteForJSON <- function(mcrime, crime.type) {
  js <- ddply(subset(mcrime[order(mcrime$cuadrante, mcrime$date),], 
                     crime == crime.type)[,c("cuadrante", "count")],
              .(cuadrante), function(x) x$count)
  js <- subset(js, cuadrante != "(en blanco)")
  nam <- js$cuadrante
  js$cuadrante <- NULL
  js <- as.data.frame(t(js))
  names(js) <- nam
  return(js)
}

formatSectorForJSON <- function(mcrime, crime.type) {
#   js <- ddply(subset(mcrime[order(mcrime$cuadrante, mcrime$date),], 
#                crime == crime.type),
#         .(cuadrante, date), summarise, 
#         count = sum(count),
#         population = population[1])
  js <- ddply(subset(mcrime[order(mcrime$sector, mcrime$date),], 
                     crime == crime.type),
              .(sector, date), summarise, 
              count = (sum(count) / sum(population)) * 10^5 * 12,
              population = sum(population))
  
  js <- subset(js, sector != "(en blanco)")
  js <- ddply(js[,c("sector", "count")],
              .(sector), function(x) x$count)
  nam <- js$sector
  js$sector <- NULL
  js <- as.data.frame(t(js))
  names(js) <- nam
  return(js)
}


## For the initial line chart diaply with total data
date.total <- ddply(mcrime, .(crime, date), summarise,
                    count = sum(count))
date.total$date <- as.Date(date.total$date)
total <- cast(date.total, date ~ crime, value = "count")
toJSON(total[,-1], dataframe = "column")


#for merging with cuadrante topojson
topo <- ddply(mcrime, .(crime, cuadrante), summarise,
              count = sum(count))
topo <- cast(topo, cuadrante ~ crime, value = "count")
names(topo) <- c("id", "hom", "rncv", "rvcv", "rvsv")
topo <- subset(topo, id != "(en blanco)")
apply(topo[,-1], 2, function(x) range(x))
write.csv(topo, "data/topo-cuadrantes.csv", row.names = FALSE)


js <- list(hom=formatCuadranteForJSON(mcrime, "Homicidio doloso"),
           rncv=formatCuadranteForJSON(mcrime, "Robo a negocio C/V"),
           rvcv=formatCuadranteForJSON(mcrime, "Robo de vehiculo automotor C/V"),
           rvsv=formatCuadranteForJSON(mcrime, "Robo de vehiculo automotor S/V"))
js <- toJSON(js, dataframe = "column")
fh <- file("html/js/hom-dol-cuad.js", "w")
writeLines(js, fh)
close(fh)


## For the initial line chart diaply with total data
date.total <- ddply(mcrime, .(crime, date), summarise,
                    rate = (sum(count) / sum(population, na.rm = TRUE)) * 10^5 * 12)
date.total$date <- as.Date(date.total$date)
total <- cast(date.total, date ~ crime, value = "rate")
toJSON(total[,-1], dataframe = "column")


js <- list(hom=formatSectorForJSON(mcrime, "Homicidio doloso"),
           rncv=formatSectorForJSON(mcrime, "Robo a negocio C/V"),
           rvcv=formatSectorForJSON(mcrime, "Robo de vehiculo automotor C/V"),
           rvsv=formatSectorForJSON(mcrime, "Robo de vehiculo automotor S/V"))
js <- toJSON(js, dataframe = "column")
fh <- file("html/js/hom-dol-sector.js", "w")
writeLines(js, fh)
close(fh)



#for merging with sector topojson
crime.cuadrante <- ddply(mcrime, 
                      .(crime, cuadrante), summarise,
                      total = sum(count),
                      population = population[1],
                      sector = sector[1])

crime.sector <- ddply(crime.cuadrante, 
                      .(crime, sector), summarise,
                      total = sum(total),
                      population = sum(population, na.rm = TRUE),
                      count = round((sum(total, na.rm = TRUE) / 
                                       sum(population, na.rm = TRUE)) * 10 ^ 5*(12/15), 1))
sum(subset(crime.sector, crime == "Homicidio doloso")$population)
topo <- crime.sector[,c("sector", "crime", "count", "population", "total")]
topo$count <- round(topo$count, 1)
topo <- cast(topo, sector ~ crime, value = "count")
names(topo) <- c("sector", "hom", "rncv", "rvcv", "rvsv")
topo <- subset(topo, sector != "(en blanco)")
apply(topo[,-1], 2, function(x) range(x))
write.csv(topo, "data/topo-sectores.csv", row.names = FALSE)

interactive.map <- crime.sector[,c("sector", "crime", "count", "population", "total")]
interactive.map$count <- round(interactive.map$count, 1)
interactive.map <- cast(interactive.map, sector + population ~ crime, value = "count")
names(interactive.map) <- c("sector", "population", "hom", "rncv", "rvcv", "rvsv")
interactive.map <- na.omit(interactive.map)
apply(interactive.map[,-1], 2, function(x) range(x))
write.csv(interactive.map, "data/interactive-sectores.csv", row.names = FALSE)

