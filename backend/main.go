package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func main() {
	// Initialize the database
	db := initDB()
	db.Ping()

	r := newRouter(db)

	// Support PORT from environment with default 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Starting server on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

// Notification model for API responses
type Notification struct {
	ID          string `db:"id" json:"id"`
	UserID      string `db:"user_id" json:"userId"`
	Title       string `db:"title" json:"title"`
	Description string `db:"description" json:"description"`
	Type        string `db:"type" json:"type"`
	CreatedAt   string `db:"created_at" json:"createdAt"`
}

// newRouter configures the Gin router with handlers
func newRouter(db *sqlx.DB) *gin.Engine {
	r := gin.Default()
	r.SetTrustedProxies(nil) // Hide trusted proxies warning
	// CORS: allow frontend running on localhost:5173
	r.Use(cors.New(cors.Config{
		// allow netlify too
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:4173", "https://matts-cio-challenge.netlify.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Setup JWT middleware that parses the token
	r.Use(jwtMiddleware())

	// Login endpoint: takes email, looks up user, returns token with user_id
	r.POST("/login", func(c *gin.Context) {
		email := c.PostForm("email")
		if email == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "email required"})
			return
		}
		var userID string
		if err := db.Get(&userID, `SELECT id FROM users WHERE email = ?`, email); err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "unknown email"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
			return
		}
		tokenString, err := createJWT(email, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"token": tokenString})
	})

	// Authenticated routes
	auth := r.Group("/")
	auth.Use(authRequired())
	{
		// GET /notifications
		auth.GET("/notifications", func(c *gin.Context) {
			userID := c.GetString("user_id")
			// get preferences
			p, err := getPreferences(db, userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
				return
			}
			// Build allowed types list
			types := make([]string, 0, 3)
			if p.AllowEmail {
				types = append(types, "EMAIL")
			}
			if p.AllowSMS {
				types = append(types, "SMS")
			}
			if p.AllowPush {
				types = append(types, "PUSH")
			}
			if len(types) == 0 {
				c.JSON(http.StatusOK, gin.H{
					"notifications": []Notification{},
					"preferences":   p,
				})
				return
			}
			// Query notifications by user and type
			query, args, err := sqlx.In(`SELECT id, user_id, title, description, type, created_at FROM notifications WHERE user_id = ? AND type IN (?) ORDER BY datetime(created_at) DESC`, userID, types)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "query error"})
				return
			}
			query = db.Rebind(query)
			var rows []Notification
			if err := db.Select(&rows, query, args...); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"notifications": rows,
				"preferences": p,
			})
		})

		// POST /preferences
		auth.POST("/preferences", func(c *gin.Context) {
			userID := c.GetString("user_id")

			var body struct {
				Email *bool `json:"email"`
				SMS   *bool `json:"sms"`
				Push  *bool `json:"push"`
			}
			if err := c.BindJSON(&body); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
				return
			}
			// ensure row exists
			if _, err := db.Exec(`INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)`, userID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
				return
			}
			// build updates
			set := make([]string, 0, 3)
			args := make([]any, 0, 4)
			if body.Email != nil {
				set = append(set, "allow_email = ?")
				if *body.Email {
					args = append(args, 1)
				} else {
					args = append(args, 0)
				}
			}
			if body.SMS != nil {
				set = append(set, "allow_sms = ?")
				if *body.SMS {
					args = append(args, 1)
				} else {
					args = append(args, 0)
				}
			}
			if body.Push != nil {
				set = append(set, "allow_push = ?")
				if *body.Push {
					args = append(args, 1)
				} else {
					args = append(args, 0)
				}
			}
			if len(set) == 0 {
				// nothing to update
				c.Status(http.StatusNoContent)
				return
			}
			q := "UPDATE user_preferences SET " + strings.Join(set, ", ") + " WHERE user_id = ?"
			args = append(args, userID)
			if _, err := db.Exec(q, args...); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
				return
			}
			// return updated prefs
			p, err := getPreferences(db, userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"email": p.AllowEmail, "sms": p.AllowSMS, "push": p.AllowPush})
		})
	}

	return r
}
