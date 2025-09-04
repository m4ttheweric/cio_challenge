package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize the database
	db := initDB()
	db.Ping()

	// Initialize the web framework
	r := gin.Default()
	r.SetTrustedProxies(nil) // Hide trusted proxies warning
	r.Use(cors.Default())
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Setup JWT middleware that parses the token
	// and injects the claims into gin's context
	r.Use(jwtMiddleware())

	// A login endpoint stub that takes any id and email and returns a signed JWT
	r.POST("/login", func(c *gin.Context) {
		email := c.PostForm("email")

		tokenString, err := createJWT(email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"token": tokenString})
	})

	r.Run()
}
