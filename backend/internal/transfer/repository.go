package transfer

import (
	"context"
	"database/sql"
	"time"
)

type Repository struct {
	DB *sql.DB
}

func (r *Repository) Insert(transfer *Transfer) error {
	query := `
		INSERT INTO transfers (from_user_id, to_user_id, amount)
		VALUES ($1, $2, $3)
		RETURNING id
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return r.DB.QueryRowContext(
		ctx, query,
		transfer.FromUserID,
		transfer.ToUserID,
		transfer.Amount,
	).Scan(&transfer.ID)
}

func (r *Repository) GetAllUserTransfers(userID int64) ([]*Transfer, error) {
	query := `
		SELECT id, created_at, from_user_id, to_user_id, amount
		FROM transfers
		WHERE from_user_id = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := r.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var transfers []*Transfer
	for rows.Next() {
		transfer := &Transfer{}
		err = rows.Scan(
			&transfer.ID,
			&transfer.CreatedAt,
			&transfer.FromUserID,
			&transfer.ToUserID,
			&transfer.Amount,
		)
		if err != nil {
			return nil, err
		}
		transfers = append(transfers, transfer)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return transfers, nil
}
