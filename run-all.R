
## Number of rows to skip in the crime data csv from the SSPDF
skipRows = 11

## Number of columns to delete at the end of the crime data csv
removeCols = 5

## The last date with valid data (note the last month is usually incomplete)
lastDate = "2014-08-01"

## File name with the SSPDF data
fileName = "Xl0000078.csv"

## Month with incomplete data used to subset 
## (note that it is assumed that data starts in Jan 2013)
badMonths = c("Aug 2014")
lastGood = "2014-07-01" #Above minus one month
yearAgo = "2013-08-01" #Above minus one year

## For the difference maps
lastyearMonths <- c("Jul 2013", "Jun 2013", "May 2013")
thisyearMonths <- c("Jul 2014", "Jun 2014", "May 2014")


## Crimes contained in the SSPDF data
crime_names <- c("Robo a negocio C/V",
                 "Robo de vehiculo automotor S/V",
                 "Robo de vehiculo automotor C/V",
                 "Homicidio doloso",
                 "Violacion")

source(file.path("src", "packages.R"))
source(file.path("src", "clean.R"))
source(file.path("src", "map-clean.R"))
source(file.path("src", "graphs.R"))
source(file.path("src", "json.R"))


chooseName <- function(name) {
  if(name == "Homicidio doloso")
    return("table-hom")
  else if(name == "Robo a negocio C/V")
    return("table-rncv")
  else if(name == "Robo de vehiculo automotor C/V")
    return("table-rvcv")
  else if(name == "Robo de vehiculo automotor S/V")
    return("table-rvsv")
  else if(name == "Violacion")
    return("table-viol")
}

top10cuads <- ddply(mcrime, .(crime), function(df)
  ddply(subset(df, date >= yearAgo), 
        .(cuadrante, sector),
        summarize,
        population = population[1],
        count=sum(count)))

top10cuads <- top10cuads[order(-top10cuads$count),]
top10cuads <- ddply(top10cuads, .(crime), transform, rank =  rank(-count))
top10cuads <- top10cuads[, c("rank", "crime", "cuadrante", "sector", "population", "count")]

ddply(top10cuads, .(crime), function(df) {
  dir <- 'interactive-maps'
  out_table_x <- xtable(prettyNum(subset(df, rank<=df$rank[10]), big.mark = ","), 
                        #digits = c(0,0,3,0,0,0,0), 
                        caption = "Top quadrants with the highest number of crimes")
  print(out_table_x, type='html', include.rownames=FALSE,
        file=file.path(dir, str_c(chooseName(df$crime[1]), "-cuadrantes.html")))
})


top10sectors <- ddply(mcrime, .(crime), 
                      function(df) ddply(subset(df, date >= yearAgo), 
                                         .(sector),
                                         summarize,
                                         count = sum(count, na.rm = TRUE),
                                         population = sum(population, na.rm = TRUE) / 12,
                                         rate=round((sum(count, na.rm = TRUE)/
                                                 sum(population, na.rm = TRUE)) * 10^5, 1)))


top10sectors <- top10sectors[order(-top10sectors$rate),]
top10sectors <- ddply(top10sectors, .(crime), transform, rank =  rank(-rate))
top10sectors <- top10sectors[,c("rank", "crime", "sector", "count", "population", "rate")]

ddply(top10sectors, .(crime), function(df) {
  dir <- 'interactive-maps'
  out_table_x <- xtable(prettyNum(subset(df, rank<=df$rank[10]), big.mark = ","), 
                                  digits = c(0,0,0,0,0,0,1),
                        caption = "Top sectors with the highest rates of crime")
  print(out_table_x, type='html', include.rownames=FALSE,
        file=file.path(dir, str_c(chooseName(df$crime[1]), "-sectores.html")))
})

