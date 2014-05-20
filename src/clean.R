## Clean the sspdf crime data from the pdf turned into 3 excel files

mcrime <- local({
  crime_names <- c("Robo a negocio C/V",
                   "Robo de vehiculo automotor S/V",
                   "Robo de vehiculo automotor C/V",
                   "Homicidio doloso")
  readExcel <- function(fileName, n) {
    crime <- data.frame()
    for(i in 1:n) {
      df <- read.xls(file.path("sspdf-data", fileName),
                     sheet = i)
      df <- df[3:nrow(df),]
      names(df) <- c("crime", 
                     as.character(as.yearmon(seq(as.Date("2013-01-01"), 
                                                 as.Date("2013-12-01"), 
                                                 "month"))),
                     "Total13", 
                     as.character(as.yearmon(seq(as.Date("2014-01-01"), 
                                                 as.Date("2014-04-01"), 
                                                 "month"))),
                     "Total14", "Total.General")
      crime <- rbind(crime, df)
    }
    return(crime)
  }
  
  crime <- rbind(readExcel("(282553956) ArchivoSPIHibrido.1-50.xls", 50),
                 readExcel("(282554796) ArchivoSPIHibrido.51-100.xls", 50))
  crime <- rbind(crime,
                 readExcel("(282554953) ArchivoSPIHibrido.101-122.xls", 22))  
  
  crime$cuadrante <- NA
  
  for(i in 1:nrow(crime)) {
    if(!crime$crime[i] %in% crime_names)
      cuadrante <- as.character(crime$crime[i])
    crime$cuadrante[i] <- cuadrante
  }
  totals <- crime[nrow(crime),]
  # 
  # test_that("Total matches sum", {
  #   expect_that(sum(as.numeric(crime$Total.General[1:(nrow(crime)-1)])), 
  #               equals(crime$Total.General[nrow(crime)])
  # })
  
  
  crime$Total13 <- NULL
  crime$Total14 <- NULL
  crime$Total.General <- NULL
  crime <- subset(crime, crime %in% crime_names)
  mcrime <- melt(crime, id = c("cuadrante", "crime"))
  mcrime$variable <- as.yearmon(mcrime$variable)
  
  expand <- expand.grid(crime = unique(mcrime$crime),
                        variable = unique(mcrime$variable),
                        cuadrante = unique(mcrime$cuadrante))
  
  mcrime <- merge(mcrime, expand, all = TRUE)
  mcrime$year <- year(mcrime$variable)
  mcrime$value <- str_replace(mcrime$value, "", "0")
  mcrime$value <- as.numeric(mcrime$value)
  mcrime[is.na(mcrime)] <- 0
  
  
  mcrime
})
