package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const secretKey = "MY_SUPER_SECRET_KEY"

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

		tokenString := strings.Split(authorizationHeader, "Bearer ")[1]

		// Parse the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, http.ErrAbortHandler
			}

			return []byte(secretKey), nil
		})

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

// Create a signed JWT token with the given id and email
func createJWT(email string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
	})

	return token.SignedString([]byte(secretKey))
}
