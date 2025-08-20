@echo off
cd /d "C:\Users\Avishka\Documents\Web_Project_4th_sem\pharmacy_app\backend"
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo ========================================
echo  Pharmacy App Backend Startup Script
echo ========================================
echo.
echo Current directory: %CD%
echo JAVA_HOME: %JAVA_HOME%
echo.

echo Checking Java installation...
java -version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java not found!
    pause
    exit /b 1
)

echo.
echo Checking if mvnw.cmd exists...
if exist "mvnw.cmd" (
    echo ✅ Maven wrapper found
) else (
    echo ❌ Maven wrapper not found
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
