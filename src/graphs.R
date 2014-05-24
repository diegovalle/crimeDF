## Visually explore the crime data


## the data for Apr 2014 is incomplete!
date.total <- ddply(mcrime, .(crime, date), summarise,
                       count = sum(count))
ggplot(subset(date.total, crime == "Homicidio doloso"), 
       aes(as.Date(date), count)) +
  geom_line()
ggsave(file.path("graphs", "incomplete.png"), dpi = 100, width = 6, height = 4)
mcrime <- subset(mcrime, date != "Apr 2014")

## How many cuadrantes belong to an undefined Sector?
unique(mcrime$cuadrante[is.na(mcrime$sector)])
mcrime$cuadrante[is.na(mcrime$cuadrante)]
length(unique(mcrime$cuadrante)) -1 # minus 1 because there's a cuadrante '(en blanco)'

#t <- cuadrantes@data[,c("id",  "sector",  "SUMPOB1")]
#t[which(t$id == "S-3.5.15"),]
#mcrime[which(mcrime$cuadrante == "S-3.5.15"),]

crime.cuadrante <- ddply(mcrime, 
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
                      rate = (sum(total, na.rm = TRUE)/ sum(pop, na.rm = TRUE)) * 10 ^ 5*(12/15))
crime.sector <- crime.sector[order(-crime.sector$rate),]

names(crime.cuadrante) <- c("crime", "id", "total", "population", "sector", "rate")
## Homicidio doloso == 749
## Robo a negocio C/V == 4,239
## Robo de vehiculo automotor C/V == 5223
## Robo de vehiculo automotor S/V == 12,056
#ddply(crime14, .(name, year), summarise, sum(total))

cuadrantes.map <- plyr::join(fcuadrantes, subset(crime.cuadrante, 
                                                 crime == "Robo de vehiculo automotor C/V"))
cuadrantes.map$rate2 <- cuadrantes.map$rate
cuadrantes.map$rate2[log(cuadrantes.map$rate) > 6.5 ] <- exp(6.5)
ggplot(cuadrantes.map, aes(long, lat, group = group, fill = total), color = "gray") +
  geom_polygon() +
  coord_map()+
  ggtitle("Robo de vehiculo automotor C/V") +
  scale_fill_continuous(low = "#fee6ce",
                        high = "#e6550d", space = "Lab", na.value = "grey50",
                        guide = "colourbar")
ggsave(file.path("graphs", "map-cuadrante-total.png"), dpi = 100, width = 7, height = 7)

names(crime.sector)[2] <- "id"
sector.map <- plyr::join(fsector, subset(crime.sector, 
                                         crime == "Robo de vehiculo automotor C/V"))

ggplot(sector.map, aes(long, lat, group = group, fill = rate), color = "gray") +
  geom_polygon() +
  coord_map() +
  ggtitle("Robo de vehiculo automotor C/V sector") +
  scale_fill_continuous(low = "#fee6ce",
                        high = "#e6550d", space = "Lab", na.value = "grey50",
                        guide = "colourbar")
ggsave(file.path("graphs", "map-sector-rate.png"), dpi = 100, width = 7, height = 7)


## Total crimes by date and crime type
date.crime <- ddply(mcrime, .(crime, date), summarise,
                    count = sum(count))
ggplot(date.crime, 
       aes(as.Date(date), count)) +
  geom_line() +
  facet_wrap(~crime)
ggsave(file.path("graphs", "total-ts.png"), dpi = 100, width = 9, height = 6)

date.sectores <- ddply(mcrime, .(sector, crime, date), summarise,
                       count = sum(count), 
                       population = sum(population, na.rm = TRUE),
                       rate = (count / population) * 10^5 * 12)
date.sectores <- subset(na.omit(date.sectores), crime == "Homicidio doloso")
date.sectores$sector <- with(date.sectores, reorder(sector, -rate, mean))

ggplot(date.sectores, 
       aes(as.Date(date), rate, group = sector)) +
  geom_line() +
  facet_wrap(~sector) +
  #geom_smooth(method="loess", se = FALSE)  +
  scale_y_continuous(limits = c(0, 140), breaks = c(0, 100)) +
  theme(strip.text.x = element_text(size = 6))
ggsave(file.path("graphs", "total-sector-ts.png"), dpi = 100, width = 10, height = 7)






library(rMaps)
map <- Leaflet$new()
map$setView(c(24, -99), zoom = 13)
map$tileLayer(provider = 'Stamen.Watercolor')
map$marker(
  c(51.5, -0.09),
  bindPopup = 'Hi. I am a popup'
)
map
