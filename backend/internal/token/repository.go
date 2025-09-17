package token

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"errors"
	"time"
)

var ErrInvaildToken = errors.New("invalid token")

type Repository struct {
	DB *sql.DB
}

func (r *Repository) Insert(token *Token) error {
	query := `
		INSERT INTO tokens  (user_id, hash, expiry, scope)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`

	args := []any{
		token.UserID,
		token.hash,
		token.Expiry,
		token.Scope,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return r.DB.QueryRowContext(ctx, query, args...).Scan(&token.ID, &token.CreatedAt)
}

func (r *Repository) DeleteAllForUser(userID int64, scope string) error {
	query := `
		DELETE FROM tokens
		WHERE user_id = $1
		AND scope = $2
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := r.DB.ExecContext(ctx, query, userID, scope)
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) DeactivateToken(tokenPlaintext string) error {
	hashedToken := sha256.Sum256([]byte(tokenPlaintext))
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		SELECT id, expiry
		FROM tokens
		WHERE hash = $1
		FOR UPDATE
	`
	token := &Token{}
	err = tx.QueryRowContext(ctx, query, hashedToken[:]).Scan(
		&token.ID,
		&token.Expiry,
	)
	if err != nil {
		return err
	}

	updateQuery := `
		UPDATE tokens
		set expiry = Now()
		WHERE id = $1
	`
	_, err = tx.ExecContext(ctx, updateQuery, token.ID)
	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}
