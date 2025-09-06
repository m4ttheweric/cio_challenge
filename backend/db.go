package main

import (
	"database/sql"
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

// Initialize an in-memory SQLite database
func initDB() *sqlx.DB {
	fmt.Print("Connecting to the database... ")
	db, err := sqlx.Connect("sqlite3", ":memory:")
	if err != nil {
		fmt.Print("Failed to connect to DB", err)
		os.Exit(1)
	}
	fmt.Println("Done")

	// Enable foreign keys
	if _, err := db.Exec("PRAGMA foreign_keys = ON;"); err != nil {
		log.Fatalf("failed to enable foreign keys: %v", err)
	}

	// Create schema
	createSchema(db)

	// Seed data from CSVs
	if err := seedUsers(db, "seed/users.csv"); err != nil {
		log.Fatalf("failed to seed users: %v", err)
	}
	if err := seedNotifications(db, "seed/notifications.csv"); err != nil {
		log.Fatalf("failed to seed notifications: %v", err)
	}

	return db
}

// // Execute the SQL file at the given path (not used by main, but kept handy)
// func execSQLFile(db *sqlx.DB, sqlFilePath string) {
// 	sqlBytes, err := os.ReadFile(sqlFilePath)
// 	if err != nil {
// 		fmt.Print("Failed to load file", sqlFilePath, err)
// 		os.Exit(1)
// 	}
// 	if _, err := db.Exec(string(sqlBytes)); err != nil {
// 		fmt.Print("Failed to execute file", sqlFilePath, err)
// 		os.Exit(1)
// 	}
// }

// createSchema creates the necessary tables for the API
func createSchema(db *sqlx.DB) {
	const schema = `
CREATE TABLE IF NOT EXISTS users (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS notifications (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	type TEXT NOT NULL CHECK (type IN ('EMAIL','SMS','PUSH')),
	created_at TEXT NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_preferences (
	user_id TEXT PRIMARY KEY,
	allow_email BOOLEAN NOT NULL DEFAULT 1,
	allow_sms BOOLEAN NOT NULL DEFAULT 1,
	allow_push BOOLEAN NOT NULL DEFAULT 1,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`
	if _, err := db.Exec(schema); err != nil {
		log.Fatalf("failed to create schema: %v", err)
	}
}

// seedUsers loads users from a CSV file with header: id,email
func seedUsers(db *sqlx.DB, csvPath string) error {
	f, err := os.Open(csvPath)
	if err != nil {
		return err
	}
	defer f.Close()

	r := csv.NewReader(f)
	r.ReuseRecord = true

	// Read header
	if _, err := r.Read(); err != nil {
		if err == io.EOF {
			return nil
		}
		return err
	}

	tx, err := db.Beginx()
	if err != nil {
		return err
	}
	stmt, err := tx.Preparex(`INSERT OR IGNORE INTO users (id, email) VALUES (?, ?)`)
	if err != nil {
		_ = tx.Rollback()
		return err
	}
	defer stmt.Close()

	for {
		rec, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			_ = tx.Rollback()
			return err
		}
		if len(rec) < 2 {
			continue
		}
		id, email := rec[0], rec[1]
		if id == "" || email == "" {
			continue
		}
		if _, err := stmt.Exec(id, email); err != nil {
			_ = tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}

// seedNotifications loads notifications from CSV with header:
// id,userId,title,description,type,createdAt
func seedNotifications(db *sqlx.DB, csvPath string) error {
	f, err := os.Open(csvPath)
	if err != nil {
		return err
	}
	defer f.Close()

	r := csv.NewReader(f)
	r.ReuseRecord = true

	// Read header
	if _, err := r.Read(); err != nil {
		if err == io.EOF {
			return nil
		}
		return err
	}

	const layout = "2006-01-02 15:04:05"

	tx, err := db.Beginx()
	if err != nil {
		return err
	}
	stmt, err := tx.Preparex(`
		INSERT OR IGNORE INTO notifications
			(id, user_id, title, description, type, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		_ = tx.Rollback()
		return err
	}
	defer stmt.Close()

	for {
		rec, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			_ = tx.Rollback()
			return err
		}
		if len(rec) < 6 {
			continue
		}
		id, userID, title, description, typ, createdAt :=
			rec[0], rec[1], rec[2], rec[3], rec[4], rec[5]
		if id == "" || userID == "" {
			continue
		}

		// Validate createdAt (keep raw string even if parse fails)
		if _, err := time.Parse(layout, createdAt); err != nil {
			log.Printf("warning: invalid createdAt %q: %v", createdAt, err)
		}

		if _, err := stmt.Exec(id, userID, title, description, typ, createdAt); err != nil {
			_ = tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}

// Preferences represents stored preferences
type Preferences struct {
	UserID     string `db:"user_id" json:"-"`
	AllowEmail bool   `db:"allow_email" json:"email"`
	AllowSMS   bool   `db:"allow_sms" json:"sms"`
	AllowPush  bool   `db:"allow_push" json:"push"`
}

// getPreferences returns preferences for the user, defaulting to all true if none exist
func getPreferences(db *sqlx.DB, userID string) (Preferences, error) {
	var p Preferences
	err := db.Get(&p, `SELECT user_id, allow_email, allow_sms, allow_push FROM user_preferences WHERE user_id = ?`, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			// default if none
			return Preferences{UserID: userID, AllowEmail: true, AllowSMS: true, AllowPush: true}, nil
		}
		return Preferences{}, err
	}
	return p, nil
}
