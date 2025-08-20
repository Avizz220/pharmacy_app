@echo off
echo =================================================
echo      Maven Troubleshooting Script
echo =================================================
echo.

echo Step 1: Checking current directory...
echo Current directory: %CD%
echo.

echo Step 2: Checking if mvnw.cmd exists...
if exist "mvnw.cmd" (
    echo ✅ mvnw.cmd found
) else (
    echo ❌ mvnw.cmd not found in current directory
    echo Make sure you're in the backend folder
    echo Expected: c:\Users\Avishka\Documents\Web_Project_4th_sem\pharmacy_app\backend
    pause
    exit /b 1
)

echo.
echo Step 3: Testing Java installation...
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Java is not installed or not in PATH
    echo Please install Java 17+ from: https://adoptium.net/
    pause
    exit /b 1
) else (
    echo ✅ Java is working
    java -version
)

echo.
echo Step 4: Testing Maven installation...
mvn -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Maven not found in PATH
    echo Testing Maven Wrapper instead...
    
    echo.
    echo Step 5: Testing Maven Wrapper...
    .\mvnw.cmd --version >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Maven Wrapper also failed
        echo Let's try to download wrapper jar...
        .\mvnw.cmd -N wrapper:wrapper
        if %ERRORLEVEL% NEQ 0 (
            echo ❌ Failed to download wrapper jar
            echo Please check your internet connection
            pause
            exit /b 1
        )
    ) else (
        echo ✅ Maven Wrapper is working
        .\mvnw.cmd --version
    )
    
    echo.
    echo Using Maven Wrapper for build...
    .\mvnw.cmd clean compile
    
) else (
    echo ✅ Maven is working
    mvn -version
    echo.
    echo Using Maven for build...
    mvn clean compile
)

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo.
    echo Ready to start the application.
    echo Make sure MySQL is running with 'pharmacy_db' database!
    echo.
    pause
    
    if exist ".\mvnw.cmd" (
        .\mvnw.cmd spring-boot:run
    ) else (
        mvn spring-boot:run
    )
) else (
    echo ❌ Build failed!
    echo Check the error messages above.
    pause
)
