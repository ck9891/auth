# Auth Service API Documentation

A RESTful authentication service built with Express.js, Prisma, and JWT tokens.

## Features

- User registration and login
- JWT-based authentication with access and refresh tokens
- Token refresh mechanism
- Secure password hashing with bcrypt
- Database persistence with Prisma ORM

## API Endpoints

### Authentication

#### POST /auth/register

Register a new user account

Request body:
{
"email": "user@example.com",
"password": "password123",
"username": "username123"
}

Response:
{
"id": "123e4567-e89b-12d3-a456-426614174000",
"email": "user@example.com",
"username": "username123",

#### POST /auth/login

Authenticate user and generate tokens

Request body:
{
"email": "user@example.com",
"password": "password123"
}

Response:
{
"message": "Logged in successfully",
"tokens": {
"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
}

#### POST /auth/logout

Invalidate refresh token

Request body:
{
"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
"message": "Logged out successfully"
}
