# Pharmacy App Backend

A Spring Boot REST API for the Pharmacy Management System with MySQL database integration.

## Features

- **User Authentication**: Registration and login with JWT tokens
- **Password Security**: BCrypt encryption
- **Database Integration**: MySQL with JPA/Hibernate
- **CORS Support**: Configured for frontend integration
- **Input Validation**: Comprehensive request validation
- **RESTful API**: Clean and documented endpoints

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security**
- **Spring Data JPA**
- **MySQL 8.0**
- **JWT (JSON Web Tokens)**
- **Maven**

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/test` | Test endpoint |

### Request/Response Examples

#### Register User
```json
POST /api/auth/register
{
    "username": "johnsmith",
    "email": "john@example.com",
    "password": "securepass123",
    "fullName": "John Smith"
}
```

#### Login User
```json
POST /api/auth/login
{
    "usernameOrEmail": "johnsmith",
    "password": "securepass123"
}
```

#### Successful Response
```json
{
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer",
    "username": "johnsmith",
    "email": "john@example.com",
    "fullName": "John Smith",
    "role": "USER",
    "message": "Authentication successful"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(120) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    is_active BOOLEAN NOT NULL DEFAULT true
);
```

## Getting Started

1. **Follow Setup Instructions**: See `SETUP_INSTRUCTIONS.md` for detailed setup
2. **Configure Database**: Update `application.properties` with your MySQL credentials
3. **Build Project**: `mvn clean compile`
4. **Run Application**: `mvn spring-boot:run`
5. **Test API**: Visit `http://localhost:8080/api/auth/test`

## Configuration

Key configuration files:
- `application.properties` - Database and JWT settings
- `pom.xml` - Maven dependencies
- `WebSecurityConfig.java` - Security configuration

## Security

- Passwords are encrypted using BCrypt
- JWT tokens for stateless authentication
- CORS configured for frontend integration
- Input validation on all endpoints
- SQL injection protection via JPA

## Development

The project follows standard Spring Boot structure:
```
src/main/java/com/pharmacy/app/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── dto/            # Data Transfer Objects
├── entity/         # JPA entities
├── repository/     # Data repositories
├── security/       # Security components
├── service/        # Business logic
└── util/           # Utility classes
```

## Future Enhancements

- Email verification
- Password reset functionality
- Role-based access control
- Medicine and inventory management APIs
- Sales and payment tracking
- Customer and supplier management
