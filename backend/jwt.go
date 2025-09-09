package main

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// getJWTSecret reads the JWT secret from the environment.
// For local dev, it falls back to an insecure default.
func getJWTSecret() []byte {
	if s := os.Getenv("JWT_SECRET"); s != "" {
		return []byte(s)
	}
	return []byte("MY_SUPER_SECRET_KEY")
}

// Middleware responsible for parsing the JWT token if present on the Authorization header.
// Once parsed, it injects the claims into the Gin context.
//
// If no token is present, it will simply pass the request to the next handler.
func jwtMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authorizationHeader := c.GetHeader("Authorization")
		// No header present, skip
		if authorizationHeader == "" {
			c.Next()
			return
		}

		var tokenString string
		if strings.HasPrefix(authorizationHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authorizationHeader, "Bearer ")
		} else if strings.HasPrefix(authorizationHeader, "bearer ") {
			tokenString = strings.TrimPrefix(authorizationHeader, "bearer ")
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		// Parse the token with standard claims validation and small leeway
		claims := jwt.MapClaims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, http.ErrAbortHandler
			}

			return getJWTSecret(), nil
		}, jwt.WithLeeway(1*time.Minute))

		// Check if the token is valid
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		// Inject claims into context
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("claims", claims)
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
		}

		c.Next()
	}
}

// Create a signed JWT token with the given user_id and email
func createJWT(email string, userID string) (string, error) {
	// Basic token hygiene: include iat and short exp (e.g., 24h)
	now := time.Now()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":   email,
		"user_id": userID,
		"iat":     now.Unix(),
		"exp":     now.Add(24 * time.Hour).Unix(),
	})

	return token.SignedString(getJWTSecret())
}

// authRequired ensures a valid JWT with a user_id is present
func authRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		v, exists := c.Get("claims")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}
		claims, ok := v.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}
		uidRaw, ok := claims["user_id"]
		if !ok || uidRaw == nil || uidRaw == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}
		c.Set("user_id", uidRaw)
		c.Next()
	}
}
