@echo off
echo Starting Pharmacy App Backend...
echo.
echo Make sure MySQL is running and database 'pharmacy_db' exists.
echo.
pause
echo.
echo Building and starting the application...
mvn spring-boot:run
