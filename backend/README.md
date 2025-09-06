# Notification System Backend

This implementation provides a small API with JWT auth, in-memory SQLite, and CSV seeding.

Implemented endpoints:

-  POST /login: exchange an email for a JWT containing email and user_id
-  GET /notifications: returns user notifications filtered by their preferences and as well as user preferences
-  POST /preferences: upsert partial user notification preferences (email/sms/push)

## Setup and run

Prereqs: Go 1.22+

Run the server:

```bash
go get
go run .
```

Dev CORS: The API allows requests from http://localhost:5173 (the default Vite dev server). If your frontend runs elsewhere, update the CORS config in `main.go`.

Quick test (optional):

```bash
go test ./...
```

Login to get a token, then call authenticated routes (replace TOKEN):

```bash
# login
http --form POST :8080/login email=first@customer.io

# set preferences
http POST :8080/preferences Authorization:"Bearer TOKEN" email:=true sms:=false push:=false

# fetch notifications + preferences
http GET :8080/notifications Authorization:"Bearer TOKEN"
```

## Design decisions and trade-offs

-  In-memory SQLite for simplicity; data resets on restart. csv is seeded at boot.
-  Minimal schema: users, notifications, user_preferences. Preferences default to all true when absent.
-  JWT contains user_id and email. A lightweight middleware parses JWT; an authRequired guard enforces presence.
-  Simple CSV reader to avoid extra deps; handles quoted commas in description.
-  GET /notifications filters by preference types via SQL IN clause with ordering by created_at.
-  POST /preferences is a partial update (PATCH-like) with upsert to create missing row.

## Improvements with more time

-  Persisted DB and migrations; add indexes on (user_id,type,created_at).
-  Pagination and filtering (type, date ranges) on notifications.
-  Better CSV import using encoding/csv and streaming, or embed initial SQL.
-  Stronger JWT handling: expiration, issuer/audience, rotation, secret from env.
-  Add GET /preferences and DELETE to reset; add PUT for full replace.
-  Validation, error codes, and response types; OpenAPI spec.
-  Containerization (Dockerfile) and Makefile tasks.
-  CI pipeline (GitHub Actions) running go vet, fmt, lint, and tests.

## Containerization (sketch)

You can containerize with a multi-stage build:

1. Build stage uses golang:1.22 to compile a static binary.
2. Run stage uses gcr.io/distroless/base or alpine to run the binary.

## CI/CD (sketch)

-  On push: run `go fmt -s -w`, `go vet`, `go test ./...`.
-  Publish container with tags on main using GitHub Actions.
