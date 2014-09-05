
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
