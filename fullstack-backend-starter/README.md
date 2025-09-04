# Notification System Backend Starter Project

The following things are implemented to help you get started with your project:

- Basic Go server with a login route stub using [Gin](https://github.com/gin-gonic/gin)
- A simple JWT parser middleware
- A sqlite in-memory database helper function stub
- 2 CSVs consisting of notification and user data

Feel free to refactor any of the existing code as needed.

## Overview

### JWT Middleware

A simple JWT middleware implementation is provided in `jwt.go`. This middleware will check for the presence of a JWT token in the `Authorization` header of the request. **The middleware doesn't implement any kind of access control.**

If the token is present, it will be parsed and its claims will be added to Gin's request context.

If the authorization header is not present, the middleware will not enforce it and the request will be processed as usual.

### Generating a JWT token

To simplify the JWT token creation, a simple `/login` route stub is provided.

This route accepts a form with an `email` value. It will then return a signed JWT token with the `email` claim set.

Example using `httpie`:

```bash
http --form POST http://localhost:8080/login email="first@customer.io
```

```json
// Response
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZpcnN0QGN1c3RvbWVyLmlvIn0.OMiLwPqOlelF0wwWhfPUjLhN8Y5KJaPL4w_f01TR1Tc"
}

// JWT claims
{
  "email": "first@customer.io"
}
```

### In-memory database

A simple sqlite in-memory database is provided and a [sqlx](https://github.com/jmoiron/sqlx) instance can be used to interact with it.

You'll need to extend the database initialization logic to import the seed data (`seed/notifications.csv`, `seed/users.csv`) into the sqlite instance, in a schema you define.

## Getting started

Before running the server, make sure you have Go installed on your machine. You can download it from the [official website](https://golang.org/dl/).

To run the server:

```bash
$ go get
$ go run .
```
