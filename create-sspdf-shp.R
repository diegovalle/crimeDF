## Create a shapefile from the json files created by js/array.js

require(stringr)
require(jsonlite)
require(sp)
require(rgdal)
library(gsubfn)

## See js/array.js for how to create these json arrays

## The polygon long,lat coordinates that make up each cuadrante
cuads <- fromJSON(file.path('js', 'cuads.json'))
## The names of the cuadrantes
names <- fromJSON(file.path('js', 'names.json'))
## Extra information like the name of the sector and who to contact
msg <- fromJSON(file.path('js', 'msg.json'))


len <- (length(cuads)-1)
## Initialize the variables where we will store information
polys <- vector(mode = "list", length = len)
dfnames = list()
msgnames = list()

for (i in 1:len) {
  pts <- t(as.data.frame(str_split(cuads[[i]], ",")))
  names(pts) <- c('x', 'y')
  rownames(pts) <- NULL
  ## The last point is the empty string, remove it
  pts <- pts[1:(nrow(pts)-1),]
  pts <- data.frame(x = pts[,2], y = pts[,1])
  pts <- apply(pts, 2, as.numeric)
  polys[[i]] <- Polygons(list(Polygon(pts)), ID = names[i])
  ## Helpful for adding a data.frame with extra info
  dfnames[i] = names[i]
  msgnames[i] = msg[i]
}
SP <- SpatialPolygons(polys)
plot(SP)

## Clean up all the extra info in the window popup
msg2 <- str_replace_all(unlist(msgnames), "[\r\n\t]*", "") 
clean_msg <- strapplyc(msg2, ">(.*?)<")

sectors <- list()
police1 <- list()
police2 <- list()
police3 <- list()
no1 <- list()
no2 <- list()
no3 <- list()
tel <- list()
radio <- list()
for(i in 1:length(clean_msg)) {
  sectors[i] <- clean_msg[[i]][10] 
  police1[i] <- clean_msg[[i]][30] 
  police2[i] <- clean_msg[[i]][36] 
  police3[i] <- clean_msg[[i]][42] 
  no1[i] <- clean_msg[[i]][32] 
  no2[i] <- clean_msg[[i]][38] 
  no3[i] <- clean_msg[[i]][44]
  tel[i] <- clean_msg[[i]][66] 
  radio[i] <- clean_msg[[i]][68]
}


df <- data.frame(id=unlist(dfnames), 
                 sector = unlist(sectors),
                 #message = unlist(msgnames),
#                  poli1=unlist(police1),
#                  poli2=unlist(police2),
#                  poli3=unlist(police3),
#                  no1=unlist(no1),
#                  no2=unlist(no2),
#                  no3=unlist(no3),
#                  tel=unlist(tel),
#                  radio=unlist(radio),
                 row.names=unlist(dfnames))
spp <- SpatialPolygonsDataFrame(SP, data = df)
proj4string(spp) <- CRS("+proj=longlat +datum=WGS84")
## For some reason writeOGR sometimes fails
#writeOGR(spp, "cuadrante-shps", "cuadrantes-sspdf", driver = "ESRI Shapefile",
#         overwrite_layer = TRUE)
library(maptools)
writeSpatialShape(spp, "cuadrante-shps/cuadrantes-sspdf")       
