package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jmoiron/sqlx"
)

// helper to create test server and db
func setupTest(t *testing.T) (*sqlx.DB, *httptest.Server) {
	t.Helper()
	db := initDB()
	router := newRouter(db)
	srv := httptest.NewServer(router)
	t.Cleanup(func() { srv.Close() })
	return db, srv
}

func TestLoginAndPreferencesAndNotifications(t *testing.T) {
	_, srv := setupTest(t)

	// login as first user
	resp, err := http.Post(srv.URL+"/login", "application/x-www-form-urlencoded", strings.NewReader("email=first@customer.io"))
	if err != nil {
		t.Fatalf("login request failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("login status: %d", resp.StatusCode)
	}
	var tok struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tok); err != nil {
		t.Fatalf("decode token: %v", err)
	}
	if tok.Token == "" {
		t.Fatalf("expected token")
	}

	// set prefs to only EMAIL
	req, _ := http.NewRequest(http.MethodPost, srv.URL+"/preferences", strings.NewReader(`{"email":true,"sms":false,"push":false}`))
	req.Header.Set("Authorization", "Bearer "+tok.Token)
	req.Header.Set("Content-Type", "application/json")
	resp2, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("prefs request failed: %v", err)
	}
	if resp2.StatusCode != http.StatusOK {
		t.Fatalf("prefs status: %d", resp2.StatusCode)
	}

	// fetch notifications and ensure all are EMAIL type, response shape now includes preferences
	req3, _ := http.NewRequest(http.MethodGet, srv.URL+"/notifications", nil)
	req3.Header.Set("Authorization", "Bearer "+tok.Token)
	resp3, err := http.DefaultClient.Do(req3)
	if err != nil {
		t.Fatalf("notifications request failed: %v", err)
	}
	if resp3.StatusCode != http.StatusOK {
		t.Fatalf("notifications status: %d", resp3.StatusCode)
	}
	var respBody struct {
		Notifications []struct {
			Type string `json:"type"`
		} `json:"notifications"`
		Preferences struct {
			Email bool `json:"email"`
			SMS   bool `json:"sms"`
			Push  bool `json:"push"`
		} `json:"preferences"`
	}
	if err := json.NewDecoder(resp3.Body).Decode(&respBody); err != nil {
		t.Fatalf("decode notifications: %v", err)
	}
	if len(respBody.Notifications) == 0 {
		t.Fatalf("expected some notifications")
	}
	for _, n := range respBody.Notifications {
		if n.Type != "EMAIL" {
			t.Fatalf("expected only EMAIL type, got %v", n.Type)
		}
	}
	// ensure preferences echoed back match what we set
	if !respBody.Preferences.Email || respBody.Preferences.SMS || respBody.Preferences.Push {
		t.Fatalf("unexpected preferences in response: %+v", respBody.Preferences)
	}
}
