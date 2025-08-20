# Complete Setup Guide: Pharmacy App with Spring Boot Backend and MySQL

## 🎯 What We're Building

A full-stack pharmacy management application with:
- **Frontend**: React with modern UI
- **Backend**: Spring Boot with JWT authentication
- **Database**: MySQL with user authentication

## 📋 Prerequisites Checklist

Before we start, you need to install these tools:

### 1. Java Development Kit (JDK) 17+
```powershell
# Check if Java is installed
java -version
```
**If not installed**: Download from https://adoptium.net/

### 2. Maven 3.6+
```powershell
# Check if Maven is installed
mvn -version
```
**If not installed**: Download from https://maven.apache.org/download.cgi

### 3. MySQL Server 8.0+
**If not installed**: Download from https://dev.mysql.com/downloads/mysql/
- During installation, set a root password (remember it!)

### 4. MySQL Workbench (Optional but recommended)
Download from https://dev.mysql.com/downloads/workbench/

---

## 🗄️ Step 1: Set Up MySQL Database

### Option A: Using MySQL Workbench (Easier)

1. **Open MySQL Workbench**
2. **Connect to MySQL**:
   - Click on your local connection
   - Enter your root password
3. **Create Database**:
   - Click the "Create Schema" button (database icon)
   - Name: `pharmacy_db`
   - Click "Apply"

### Option B: Using Command Line

1. **Open Command Prompt**
2. **Connect to MySQL**:
```powershell
mysql -u root -p
```
3. **Create Database**:
```sql
CREATE DATABASE pharmacy_db;
SHOW DATABASES;
EXIT;
```

---

## ⚙️ Step 2: Configure Backend

### 1. Update Database Password

Navigate to your backend folder and edit the configuration file:

**File**: `backend\src\main\resources\application.properties`

**Change this line**:
```properties
spring.datasource.password=yourpassword
```

**To your actual MySQL root password**:
```properties
spring.datasource.password=your_actual_password
```

### 2. Open Command Prompt in Backend Directory

```powershell
cd "c:\Users\Avishka\Documents\Web_Project_4th_sem\pharmacy_app\backend"
```

---

## 🚀 Step 3: Build and Run Backend

### 1. Clean and Compile
```powershell
mvn clean compile
```
**Expected output**: `BUILD SUCCESS`

### 2. Run the Application
```powershell
mvn spring-boot:run
```

**What you should see**:
```
Started PharmacyAppApplication in X.XXX seconds
✅ Default admin user created:
   Username: admin
   Password: admin123
   Email: admin@pharmacy.com
🚀 Pharmacy App Backend is ready!
```

### 3. Test Backend is Working

Open your web browser and visit:
```
http://localhost:8080/api/auth/test
```

**Expected response**: `Auth controller is working!`

---

## 🎨 Step 4: Run Frontend

### 1. Open NEW Command Prompt for Frontend

```powershell
cd "c:\Users\Avishka\Documents\Web_Project_4th_sem\pharmacy_app"
```

### 2. Install Dependencies (if not done)
```powershell
npm install
```

### 3. Start Frontend
```powershell
npm run dev
```

**Expected output**:
```
Local:   http://localhost:5173/
```

---

## 🧪 Step 5: Test Complete System

### 1. Open Your Browser

Visit: `http://localhost:5173/`

### 2. Test Registration

1. **Click "Create account"**
2. **Fill the form**:
   - Username: `testuser`
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - ✅ Check "I agree to Terms and Conditions"
3. **Click "Create Account"**

**Expected result**: Redirected to dashboard

### 3. Test Login

1. **Go back to login page**
2. **Try the default admin**:
   - Email/Username: `admin`
   - Password: `admin123`
3. **Or use your new account**:
   - Email/Username: `testuser` or `test@example.com`
   - Password: `password123`

**Expected result**: Successful login

### 4. Test Invalid Login

1. **Try wrong credentials**:
   - Email: `wrong@email.com`
   - Password: `wrongpass`

**Expected result**: Error message displayed

---

## 📊 Step 6: Verify Database

### Check Users Table

**Using MySQL Workbench**:
1. Connect to your database
2. Navigate to `pharmacy_db` schema
3. Right-click `users` table → "Select Rows"
4. You should see your registered users

**Using Command Line**:
```sql
mysql -u root -p
USE pharmacy_db;
SELECT id, username, email, full_name, role, created_at FROM users;
```

---

## ❌ Troubleshooting Common Issues

### Backend Won't Start

**Error**: `Access denied for user 'root'@'localhost'`
- **Fix**: Check MySQL password in `application.properties`

**Error**: `Port 8080 already in use`
- **Fix**: Change port in `application.properties`:
```properties
server.port=8081
```

**Error**: `Table 'pharmacy_db.users' doesn't exist`
- **Fix**: Restart the backend application. Tables are auto-created.

### Frontend Issues

**Error**: `Failed to fetch`
- **Fix**: Make sure backend is running on `http://localhost:8080`

**Login not working**
- **Fix**: Check browser console for errors
- Make sure backend is responding at `/api/auth/test`

### Database Issues

**Error**: `Unknown database 'pharmacy_db'`
- **Fix**: Create the database manually:
```sql
CREATE DATABASE pharmacy_db;
```

---

## 🔧 Useful Commands

### Check What's Running on Port 8080
```powershell
netstat -ano | findstr :8080
```

### Stop/Start MySQL Service
```powershell
# Stop MySQL
net stop mysql80

# Start MySQL  
net start mysql80
```

### View Backend Logs
Look at the Command Prompt where you ran `mvn spring-boot:run`

---

## 🎉 Success Indicators

✅ **Backend Running**: Visit `http://localhost:8080/api/auth/test` shows "Auth controller is working!"

✅ **Frontend Running**: Visit `http://localhost:5173/` shows login page

✅ **Database Connected**: Backend starts without database connection errors

✅ **Registration Works**: Can create new accounts

✅ **Login Works**: Can login with created accounts

✅ **Authentication Works**: Wrong credentials show error messages

---

## 🔐 Security Features Implemented

- **Password Encryption**: All passwords are encrypted with BCrypt
- **JWT Tokens**: Secure session management
- **Input Validation**: All user inputs are validated
- **SQL Injection Protection**: Using JPA prevents SQL injection
- **CORS Configuration**: Properly configured for your frontend

---

## 📝 Default Test Accounts

**Admin Account** (automatically created):
- Username: `admin`
- Password: `admin123`
- Email: `admin@pharmacy.com`

**Your Account** (create via registration):
- Whatever you registered with

---

## 🚀 Next Steps After Setup

1. **Test all features** thoroughly
2. **Create more user accounts** via registration
3. **Try logging in/out** multiple times
4. **Check database** to see stored users
5. **Ready for development** of more features!

---

## 📞 Need Help?

If you encounter any issues:
1. Check the **console outputs** for error messages
2. Verify all **ports are available** (8080 for backend, 5173 for frontend)
3. Make sure **MySQL service is running**
4. Ensure **database password is correct** in application.properties

Your pharmacy app with full authentication is now ready! 🎉
