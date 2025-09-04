package main

import (
	"fmt"
	"os"

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

	return db
}

// Execute the SQL file at the given path
func execSQLFile(db *sqlx.DB, sqlFilePath string) {
	seedNotifications, err := os.ReadFile(sqlFilePath)
	if err != nil {
		fmt.Print("Failed to load file", sqlFilePath, err)
		os.Exit(1)
	}

	if _, err := db.Exec(string(seedNotifications)); err != nil {
		fmt.Print("Failed to execute file", sqlFilePath, err)
		os.Exit(1)
	}
}
