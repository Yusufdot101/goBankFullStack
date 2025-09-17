package transaction

import (
	"context"
	"database/sql"
	"time"
)

type Repository struct {
	DB *sql.DB
}

func (r *Repository) Insert(transaction *Transaction) error {
	query := `
		INSERT INTO transactions (user_id, action, amount, performed_by)
		VALUES ($1, $2, $3, $4)	
		RETURNING id, created_at
	`
	args := []any{
		transaction.UserID,
		transaction.Action,
		transaction.Amount,
		transaction.PerformedBy,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return r.DB.QueryRowContext(ctx, query, args...).Scan(
		&transaction.ID,
		&transaction.CreatedAt,
	)
}

func (r *Repository) GetAllUserTransactions(userID int64) ([]*Transaction, error) {
	query := `
		SELECT id, created_at, user_id, action, amount, performed_by
		FROM transactions
		WHERE user_id = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := r.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var transactions []*Transaction
	for rows.Next() {
		transaction := &Transaction{}
		err = rows.Scan(
			&transaction.ID,
			&transaction.CreatedAt,
			&transaction.UserID,
			&transaction.Action,
			&transaction.Amount,
			&transaction.PerformedBy,
		)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return transactions, nil
}
