@echo off
echo =================================================
echo        Pharmacy App Backend Setup
echo =================================================
echo.

echo Step 1: Checking Java installation...
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Java is not installed or not in PATH
    echo Please install Java 17 or higher from:
    echo https://adoptium.net/
    pause
    exit /b 1
) else (
    echo ✅ Java is installed
)

echo.
echo Step 2: Checking Maven installation...
mvn -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Maven not found in PATH, using Maven Wrapper instead
    echo.
    echo Step 3: Building project with Maven Wrapper...
    .\mvnw.cmd clean compile
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Build failed! Check the error messages above.
        pause
        exit /b 1
    )
    echo.
    echo ✅ Build successful!
    echo.
    echo Step 4: Starting the application...
    echo Make sure MySQL is running and database 'pharmacy_db' exists!
    echo.
    pause
    .\mvnw.cmd spring-boot:run
) else (
    echo ✅ Maven is installed
    echo.
    echo Step 3: Building project...
    mvn clean compile
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Build failed! Check the error messages above.
        pause
        exit /b 1
    )
    echo.
    echo ✅ Build successful!
    echo.
    echo Step 4: Starting the application...
    echo Make sure MySQL is running and database 'pharmacy_db' exists!
    echo.
    pause
    mvn spring-boot:run
)
