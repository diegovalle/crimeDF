mcrime <- local({
  getNames <- function(fileName, n){
    #crimes <- c()
    cuadrantes <- data.frame()
    for(i in 1:n) {
      print(i)
      
      df = read.xls(file.path("sspdf-data", fileName),
                    sheet = i)
      
      crimeName <- str_replace_all(names(df)[2], "\\.\\.", " ")
      crimeName <- str_replace_all(crimeName, "\\.", " ")
      crimeName <- str_replace_all(crimeName, "[0-9]", "")
      crimeName <- str_replace_all(crimeName, " *$", "")
      crimeName <- str_replace_all(crimeName, "c v", "C.V.")
      crimeName <- str_replace_all(crimeName, "s v", "S.V.")
      year <- str_extract(names(df)[2], "[0-9]+")
      #crimes <- c(crimes, crimeName)
      df$Total.2013 <- NULL
      df$Total.2014 <- NULL
      names(df)[1]  <- "cuadrante"
      names(df)[2:(ncol(df)-1)] <- as.character(as.yearmon(seq(as.Date(str_c(year, "-01-01")), 
                                                               as.Date(str_c(year, "-12-01")), 
                                                               "month")))[1:(ncol(df)-2)]
      print(head(df))
      print(year)
      print(crimeName)
      names(df)[ncol(df)] <- "total"
      df$total <- NULL
      df <- df[(2:nrow(df)),]
      df = melt(df, id = "cuadrante")
      names(df) <- c("cuadrante", "date", "count")
      df$crime <- crimeName
      cuadrantes <- rbind(cuadrantes, df)
    }
    return(cuadrantes)
  }
  
  crime <- getNames("(385304111) ArchivoSPIHibrido.aspx.1-50.xlsx", 50)
  crime <- rbind(crime,
                 getNames("(385306624) ArchivoSPIHibrido.aspx.51-100.xlsx", 50))
  crime <- rbind(crime, 
                 getNames("(385308729) ArchivoSPIHibrido.aspx.101-144.xlsx", 44))
  
  crime$year <- year(as.yearmon(crime$date))
  crime$date <- as.Date(as.yearmon(crime$date))
  crime <- crime[,c("cuadrante", "crime", "date", "count", "year")]
  
  # Preserve NA's 
  crime <- subset(crime, !cuadrante %in% "TOTAL")  
  
  crime$cuadrante <- as.character(crime$cuadrante)
  crime[which(crime$cuadrante == "No específica"),]$cuadrante <- "NO ESPECIFICADO"
  
  crime[which(crime$crime == "Robo de vehiculo C.V."),]$crime <- "Robo de vehiculo automotor C.V."
  crime[which(crime$crime == "Robo de vehiculo S.V."),]$crime <- "Robo de vehiculo automotor S.V."
  
  
  crime$count <- str_replace_all(crime$count, ",", "")
  crime$count <- as.numeric(crime$count)
  mcrime <- crime
  mcrime
})
## Clean the sspdf crime data from the pdf turned into 3 excel files
# 
# mcrime <- local({
#   readCSV <- function(fileName, skipRows, removeCols, lastDate ) {
#     
#     df <- read.csv(file.path("sspdf-data",  fileName),
#                    skip = skipRows, header = FALSE)
#     df <- df[ ,1:(ncol(df)-removeCols)]
#     names(df) <- c("crime", 
#                    as.character(as.yearmon(seq(as.Date("2013-01-01"), 
#                                                as.Date("2013-12-01"), 
#                                                "month"))),
#                    "Total13", 
#                    as.character(as.yearmon(seq(as.Date("2014-01-01"), 
#                                                as.Date(lastDate), 
#                                                "month"))),
#                    "Total14", "Total.General")
#     return(df)
#   }
#   
#   
#   crime <- readCSV(fileName, skipRows, removeCols, lastDate)
#   
#   
#   crime$cuadrante <- NA
#   
#   for(i in 1:nrow(crime)) {
#     if(!crime$crime[i] %in% crime_names)
#       cuadrante <- as.character(crime$crime[i])
#     crime$cuadrante[i] <- cuadrante
#   }
#   totals <- crime[nrow(crime),]
#   # 
#   # test_that("Total matches sum", {
#   #   expect_that(sum(as.numeric(crime$Total.General[1:(nrow(crime)-1)])), 
#   #               equals(crime$Total.General[nrow(crime)])
#   # })
#   
#   
#   crime$Total13 <- NULL
#   crime$Total14 <- NULL
#   crime$Total.General <- NULL
#   crime <- subset(crime, crime %in% crime_names)
#   mcrime <- melt(crime, id = c("cuadrante", "crime"))
#   mcrime$variable <- as.yearmon(mcrime$variable)
#   
#   expand <- expand.grid(crime = unique(mcrime$crime),
#                         variable = unique(mcrime$variable),
#                         cuadrante = unique(mcrime$cuadrante))
#   
#   mcrime <- merge(mcrime, expand, all = TRUE)
#   mcrime$year <- year(mcrime$variable)
#   mcrime$value <- str_replace(mcrime$value, "", "0")
#   mcrime$value <- as.numeric(mcrime$value)
#   mcrime[is.na(mcrime)] <- 0
#   
#   mcrime$crime <- str_replace(mcrime$crime, "C/V", "C.V.")
#   mcrime$crime <- str_replace(mcrime$crime, "S/V", "S.V.")
#   
#   mcrime
# })
