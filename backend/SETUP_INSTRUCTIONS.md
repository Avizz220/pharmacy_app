# Pharmacy App Backend Setup Guide

## Prerequisites

Before starting, make sure you have the following installed on your computer:

1. **Java Development Kit (JDK) 17 or higher**
   - Download from: https://www.oracle.com/java/technologies/downloads/
   - Or use OpenJDK: https://adoptium.net/

2. **Maven 3.6 or higher**
   - Download from: https://maven.apache.org/download.cgi
   - Follow installation guide: https://maven.apache.org/install.html

3. **MySQL Server 8.0 or higher**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - During installation, remember your root password

4. **MySQL Workbench (Optional but recommended)**
   - Download from: https://dev.mysql.com/downloads/workbench/

## Step-by-Step Setup

### Step 1: Verify Java Installation

Open Command Prompt (PowerShell) and run:
```powershell
java -version
javac -version
```

You should see Java version 17 or higher.

### Step 2: Install and Configure Maven

#### Download and Install Maven

1. **Download Maven**
   - Go to: https://maven.apache.org/download.cgi
   - Download "Binary zip archive" (apache-maven-3.9.6-bin.zip)
   - Extract it to a folder like: `C:\Program Files\Apache\apache-maven-3.9.6`

2. **Set Environment Variables**
   - Press `Windows + R`, type `sysdm.cpl`, press Enter
   - Click "Environment Variables"
   - Under "System Variables", click "New":
     - Variable name: `MAVEN_HOME`
     - Variable value: `C:\Program Files\Apache\apache-maven-3.9.6`
   - Find "Path" in System Variables, click "Edit"
   - Click "New" and add: `%MAVEN_HOME%\bin`
   - Click "OK" on all dialogs

3. **Restart PowerShell/Command Prompt**
   - Close all PowerShell/Command Prompt windows
   - Open a new PowerShell window

4. **Verify Maven Installation**
   ```powershell
   mvn -version
   ```
   You should see Maven version 3.6 or higher.

#### Alternative: Use Maven Wrapper (If Maven installation fails)

If you still get "mvn not recognized" error, you can use the Maven Wrapper instead:

1. **Download Maven Wrapper files** (I'll create them for you)
2. **Use `mvnw` instead of `mvn`** in all commands:
   ```powershell
   .\mvnw.cmd clean compile
   .\mvnw.cmd spring-boot:run
   ```

### Step 3: Set Up MySQL Database

#### Option A: Using MySQL Workbench (Recommended)

1. **Open MySQL Workbench**
2. **Connect to your MySQL server**
   - Click on your local MySQL connection
   - Enter your root password

3. **Create the database**
   - Click on "Create a new schema" button (database icon)
   - Name it: `pharmacy_db`
   - Click "Apply"

4. **Or use SQL command**
   ```sql
   CREATE DATABASE pharmacy_db;
   USE pharmacy_db;
   ```

#### Option B: Using Command Line

1. **Open Command Prompt**
2. **Connect to MySQL**
   ```powershell
   mysql -u root -p
   ```
   Enter your password when prompted.

3. **Create database**
   ```sql
   CREATE DATABASE pharmacy_db;
   EXIT;
   ```

### Step 4: Configure Application Properties

1. **Navigate to the backend folder**
   ```powershell
   cd "c:\Users\Avishka\Documents\Web_Project_4th_sem\pharmacy_app\backend"
   ```

2. **Edit application.properties**
   - Open: `src\main\resources\application.properties`
   - Update the database password:
   ```properties
   spring.datasource.password=YOUR_MYSQL_ROOT_PASSWORD
   ```
   Replace `YOUR_MYSQL_ROOT_PASSWORD` with your actual MySQL root password.

### Step 5: Build and Run the Backend

#### Option A: Using the Easy Setup Script (Recommended)

1. **Navigate to the backend folder**
   ```powershell
   cd "c:\Users\Avishka\Documents\Web_Project_4th_sem\pharmacy_app\backend"
   ```

2. **Run the setup script**
   ```powershell
   .\setup-and-run.bat
   ```
   This script will automatically detect if Maven is installed and use the appropriate method.

#### Option B: Manual Commands

If you have Maven installed:
```powershell
mvn clean compile
mvn spring-boot:run
```

If Maven is NOT installed, use Maven Wrapper:
```powershell
.\mvnw.cmd clean compile
.\mvnw.cmd spring-boot:run
```

#### What to Expect

1. **First run will take longer** as it downloads dependencies
2. **You'll see lots of text scrolling** - this is normal
3. **Look for this message**: `Started PharmacyAppApplication in X.XXX seconds`
4. **Default admin user will be created**: username: `admin`, password: `admin123`

3. **Verify it's running**
   - Open your browser
   - Go to: http://localhost:8080/api/auth/test
   - You should see: "Auth controller is working!"

### Step 6: Verify Database Tables

1. **Check if tables were created**
   - Open MySQL Workbench
   - Connect to your database
   - Navigate to `pharmacy_db` schema
   - You should see a `users` table

2. **Or use SQL command**
   ```sql
   USE pharmacy_db;
   SHOW TABLES;
   DESCRIBE users;
   ```

## Testing the API

### Test Registration

Use a tool like Postman or curl:

**URL:** `POST http://localhost:8080/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
}
```

### Test Login

**URL:** `POST http://localhost:8080/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
    "usernameOrEmail": "testuser",
    "password": "password123"
}
```

## Troubleshooting

### Common Issues

1. **"mvn/mevan is not recognized as the name of a cmdlet"**
   - **Check spelling**: Make sure you type `mvn` not `mevan`
   - **Restart PowerShell**: Close all PowerShell windows and open a new one
   - **Refresh environment variables**:
     ```powershell
     $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
     mvn -version
     ```
   - **Use Maven Wrapper instead**:
     ```powershell
     .\mvnw.cmd clean compile
     .\mvnw.cmd spring-boot:run
     ```
   - **Try with cmd instead of PowerShell**:
     ```cmd
     cmd /c "mvn clean compile"
     ```

2. **Maven Wrapper `mvnw.cmd` not working**
   - **Check you're in the right directory**:
     ```powershell
     cd "c:\Users\Avishka\Documents\Web_Project_4th_sem\pharmacy_app\backend"
     dir  # Check if mvnw.cmd exists
     ```
   - **Test wrapper first**:
     ```powershell
     .\mvnw.cmd --version
     ```
   - **If still fails, use the setup script**:
     ```powershell
     .\setup-and-run.bat
     ```

3. **"Access denied for user 'root'@'localhost'"**
   - Check your MySQL password in `application.properties`
   - Make sure MySQL server is running

4. **"Table 'pharmacy_db.users' doesn't exist"**
   - Make sure `spring.jpa.hibernate.ddl-auto=update` is in application.properties
   - Restart the application

5. **Port 8080 already in use**
   - Change port in application.properties: `server.port=8081`
   - Or stop the process using port 8080

6. **Maven build fails**
   - Make sure Java 17+ is installed
   - Check internet connection (Maven downloads dependencies)

### Useful Commands

**Check what's running on port 8080:**
```powershell
netstat -ano | findstr :8080
```

**Stop MySQL service:**
```powershell
net stop mysql80
```

**Start MySQL service:**
```powershell
net start mysql80
```

## Next Steps

After successful setup:

1. **Update Frontend** - Modify your React app to use the backend API
2. **Remove hardcoded credentials** from your frontend login
3. **Test registration and login** from your React app

## Database Schema

The `users` table will be automatically created with these columns:

- `id` (BIGINT, Primary Key, Auto Increment)
- `username` (VARCHAR(50), Unique, Not Null)
- `email` (VARCHAR(100), Unique, Not Null)
- `password` (VARCHAR(120), Not Null) - Encrypted
- `full_name` (VARCHAR(100))
- `role` (VARCHAR(20), Default: 'USER')
- `created_at` (DATETIME, Not Null)
- `updated_at` (DATETIME)
- `is_active` (BOOLEAN, Default: true)

## Security Features

- **Password Encryption**: Uses BCrypt
- **JWT Tokens**: For session management
- **CORS Support**: Configured for your frontend
- **Input Validation**: Validates all user inputs
- **SQL Injection Protection**: Using JPA/Hibernate

Need help? Check the console output for detailed error messages!
