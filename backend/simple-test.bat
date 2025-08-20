@echo off
echo =================================================
echo      Simple Backend Test Script
echo =================================================
echo.

echo Checking current directory...
echo %CD%
echo.

echo Checking if we're in the right folder...
if not exist "pom.xml" (
    echo ❌ pom.xml not found!
    echo Please navigate to: c:\Users\Avishka\Documents\Web_Project_4th_sem\pharmacy_app\backend
    pause
    exit /b 1
)

echo ✅ Found pom.xml
echo.

echo Checking Java...
java -version 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Java not found! Please install Java 17+
    pause
    exit /b 1
)

echo ✅ Java found
echo.

echo Trying different methods to compile...

echo.
echo Method 1: Using mvnw.cmd (Maven Wrapper)
if exist "mvnw.cmd" (
    echo Found mvnw.cmd, trying...
    .\mvnw.cmd clean compile
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Compilation successful with mvnw!
        goto :start_app
    ) else (
        echo ❌ mvnw compilation failed
    )
) else (
    echo mvnw.cmd not found
)

echo.
echo Method 2: Using mvn
mvn clean compile 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Compilation successful with mvn!
    goto :start_app
) else (
    echo ❌ mvn compilation failed or not found
)

echo.
echo Method 3: Using full path
if exist "C:\Program Files\Apache\apache-maven-3.9.6\bin\mvn.cmd" (
    echo Found Maven in Program Files, trying...
    "C:\Program Files\Apache\apache-maven-3.9.6\bin\mvn.cmd" clean compile
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Compilation successful with full path!
        goto :start_app
    )
)

echo.
echo ❌ All compilation methods failed!
echo.
echo Let's check what's wrong...
echo.

echo Checking Maven wrapper files...
if exist ".mvn\wrapper\maven-wrapper.properties" (
    echo ✅ Maven wrapper properties found
) else (
    echo ❌ Maven wrapper properties missing
)

if exist "mvnw.cmd" (
    echo ✅ mvnw.cmd found
    echo File size:
    dir mvnw.cmd | find "mvnw.cmd"
) else (
    echo ❌ mvnw.cmd missing
)

echo.
echo Checking pom.xml...
type pom.xml | find "spring-boot-starter-web" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ pom.xml looks valid
) else (
    echo ❌ pom.xml might be corrupted
)

echo.
echo Please share the error message with the developer.
pause
exit /b 1

:start_app
echo.
echo Ready to start the application!
echo Make sure MySQL is running and database 'pharmacy_db' exists.
echo.
pause

if exist "mvnw.cmd" (
    .\mvnw.cmd spring-boot:run
) else (
    mvn spring-boot:run
)
