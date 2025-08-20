@echo off
echo =================================================
echo    JAVA_HOME Setup and Backend Runner
echo =================================================
echo.

echo Step 1: Setting up Java environment...

rem Set JAVA_HOME to the detected location
set "JAVA_HOME=C:\Program Files\Java\jdk-17"

if exist "%JAVA_HOME%\bin\java.exe" (
    echo ✅ JAVA_HOME set to: %JAVA_HOME%
) else (
    echo ❌ Java not found at expected location: %JAVA_HOME%
    echo.
    echo Trying to auto-detect Java...
    for /f "tokens=*" %%i in ('java -XshowSettings:properties -version 2^>^&1 ^| findstr "java.home"') do (
        for /f "tokens=3" %%j in ("%%i") do (
            set "JAVA_HOME=%%j"
        )
    )
    
    if exist "%JAVA_HOME%\bin\java.exe" (
        echo ✅ Auto-detected JAVA_HOME: %JAVA_HOME%
    ) else (
        echo ❌ Could not find Java installation
        echo Please install Java 17+ from: https://adoptium.net/
        pause
        exit /b 1
    )
)

echo.
echo Step 2: Testing Maven wrapper...
.\mvnw.cmd --version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Maven wrapper failed
    pause
    exit /b 1
)

echo.
echo ✅ Maven wrapper is working!
echo.

echo Step 3: Compiling the project...
echo This may take a few minutes on first run as dependencies are downloaded...
.\mvnw.cmd clean compile
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Compilation failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ✅ Compilation successful!
echo.

echo Step 4: Starting the application...
echo.
echo IMPORTANT: Make sure MySQL is running and 'pharmacy_db' database exists!
echo.
echo The application will:
echo - Download dependencies (first run takes longer)
echo - Connect to MySQL database 
echo - Create tables automatically
echo - Start on http://localhost:8080
echo.
echo When you see "Started PharmacyAppApplication" the server is ready!
echo.
pause

.\mvnw.cmd spring-boot:run
