package transfer

import (
	"time"

	"github.com/Yusufdot101/goBankBackend/internal/user"
	"github.com/Yusufdot101/goBankBackend/internal/validator"
)

type Transfer struct {
	ID         int64
	CreatedAt  time.Time
	FromUserID int64
	ToUserID   int64
	Amount     float64
}

func ValidateTransfer(v *validator.Validator, transfer *Transfer, fromUser *user.User) {
	v.CheckAddError(transfer.FromUserID != transfer.ToUserID, "to account", "cannot be your account")
	v.CheckAddError(transfer.Amount != 0, "amount", "must be given")
	v.CheckAddError(transfer.Amount > 0, "amount", "must be greater than 0")
	v.CheckAddError(
		fromUser.AccountBalance >= transfer.Amount, "account balance", "insufficient funds",
	)
}
