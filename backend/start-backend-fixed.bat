@echo off
echo ========================================
echo  Pharmacy App Backend Startup Script
echo ========================================
echo.

REM Set JAVA_HOME locally as backup
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

echo Checking Java installation...
java -version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java not found! Please install Java 17 or higher.
    echo Download from: https://www.oracle.com/java/technologies/downloads/
    pause
    exit /b 1
)

echo.
echo Checking Maven Wrapper...
if not exist "mvnw.cmd" (
    echo ERROR: Maven wrapper not found!
    echo Please make sure you're in the backend directory.
    pause
    exit /b 1
)

echo.
echo Starting MySQL check...
echo Please make sure MySQL is running and database 'pharmacy_db' exists.
echo.

echo Building and starting the backend...
echo This may take a few minutes on first run...
echo.

mvnw.cmd spring-boot:run

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to start the backend!
    echo Check the error messages above.
    pause
    exit /b 1
)
