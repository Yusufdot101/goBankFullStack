package app

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/Yusufdot101/goBankBackend/internal/jsonutil"
	"github.com/Yusufdot101/goBankBackend/internal/loan"
	"github.com/Yusufdot101/goBankBackend/internal/loanrequests"
	"github.com/Yusufdot101/goBankBackend/internal/mailer"
	"github.com/Yusufdot101/goBankBackend/internal/token"
	"github.com/Yusufdot101/goBankBackend/internal/transaction"
	"github.com/Yusufdot101/goBankBackend/internal/transfer"
	"github.com/Yusufdot101/goBankBackend/internal/user"
	"github.com/Yusufdot101/goBankBackend/internal/validator"
)

type userDataFetcher func(userID int64) (any, error)

func (app *Application) fetchUserData(
	w http.ResponseWriter,
	r *http.Request,
	fetch userDataFetcher,
	key string,
) {
	var input struct {
		TokenPlaintext string `json:"token"`
	}
	if err := jsonutil.ReadJSON(w, r, &input); err != nil {
		app.BadRequestResponse(w, err)
		return
	}

	v := validator.New()
	if token.ValidateToken(v, input.TokenPlaintext); !v.IsValid() {
		app.FailedValidationResponse(w, v.Errors)
		return
	}

	tokenService := token.Service{Repo: &token.Repository{DB: app.DB}}
	userService := user.Service{
		Repo:         &user.Repository{DB: app.DB},
		TokenService: &tokenService,
	}

	u, err := userService.GetUserForToken(input.TokenPlaintext, token.ScopeAuthorization)
	if err != nil {
		switch {
		case errors.Is(err, user.ErrNoRecord):
			app.NotFoundResponse(w, r)
		default:
			app.ServerError(w, r, err)
		}
		return
	}

	data, err := fetch(u.ID)
	if err != nil {
		switch {
		case errors.Is(err, user.ErrNoRecord):
			app.NotFoundResponse(w, r)
		default:
			app.ServerError(w, r, err)
		}
		return
	}

	if err := jsonutil.WriteJSON(
		w, http.StatusAccepted, jsonutil.Envelope{key: data},
	); err != nil {
		app.ServerError(w, r, err)
	}
}

func (app *Application) GetUserTransfersByToken(w http.ResponseWriter, r *http.Request) {
	transferService := &transfer.Service{
		Repo:        &transfer.Repository{DB: app.DB},
		UserService: &user.Service{Repo: &user.Repository{DB: app.DB}},
	}
	app.fetchUserData(w, r,
		func(userID int64) (any, error) {
			return transferService.GetAllUserTransfers(userID)
		},
		"transfers",
	)
}

func (app *Application) GetUserLoanRequestsByToken(w http.ResponseWriter, r *http.Request) {
	loanRequestService := &loanrequests.Service{
		Repo:        &loanrequests.Repository{DB: app.DB},
		UserService: &user.Service{Repo: &user.Repository{DB: app.DB}},
	}
	app.fetchUserData(w, r,
		func(userID int64) (any, error) {
			return loanRequestService.GetAllUserLoanRequests(userID)
		},
		"loan_requests",
	)
}

func (app *Application) GetUserLoansByToken(w http.ResponseWriter, r *http.Request) {
	loanService := &loan.Service{
		Repo:        &loan.Repository{DB: app.DB},
		UserService: &user.Service{Repo: &user.Repository{DB: app.DB}},
	}
	app.fetchUserData(w, r,
		func(userID int64) (any, error) {
			return loanService.GetAllUserLoans(userID)
		},
		"loans",
	)
}

func (app *Application) GetUserTransactionsByToken(w http.ResponseWriter, r *http.Request) {
	transactionService := &transaction.Service{
		Repo:        &transaction.Repository{DB: app.DB},
		UserService: &user.Service{Repo: &user.Repository{DB: app.DB}},
	}
	app.fetchUserData(w, r,
		func(userID int64) (any, error) {
			return transactionService.GetAllUserTransactions(userID)
		},
		"transactions",
	)
}

func (app *Application) CreateUser(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	err := jsonutil.ReadJSON(w, r, &input)
	if err != nil {
		app.BadRequestResponse(w, err)
		return
	}

	tokenService := token.Service{Repo: &token.Repository{DB: app.DB}}
	userService := user.Service{
		Mailer:       mailer.NewMailerFromEnv(),
		Repo:         &user.Repository{DB: app.DB},
		TokenService: &tokenService,
	}

	v := validator.New()
	u, token, err := userService.Register(v, input.Name, input.Email, input.Password)
	if err != nil {
		switch {
		case errors.Is(err, validator.ErrFailedValidation):
			app.FailedValidationResponse(w, v.Errors)

		case errors.Is(err, user.ErrDuplicateEmail):
			v.AddError("email", "user with this email already exists")
			app.FailedValidationResponse(w, v.Errors)

		default:
			app.ServerError(w, r, err)
		}
		return
	}

	// send the email to the user the token
	app.wg.Add(1)
	go func() {
		defer app.wg.Done()
		defer func() {
			if err := recover(); err != nil {
				app.ServerError(w, r, fmt.Errorf("%s", err))
			}
		}()
		data := map[string]any{
			"userName": u.Name,
			"userID":   u.ID,
			"token":    token.Plaintext,
		}
		err = userService.Mailer.Send(u.Email, "user_welcome.html", data)
		if err != nil {
			app.ServerError(w, r, err)
		}
	}()

	err = jsonutil.WriteJSON(
		w, http.StatusAccepted, jsonutil.Envelope{
			"message": "account created successfully, please follow the instructions sent to your email to activate your account",
			"user":    u,
		},
	)
	if err != nil {
		app.ServerError(w, r, err)
	}
}

func (app *Application) ActivateUser(w http.ResponseWriter, r *http.Request) {
	var input struct {
		TokenPlaintext string `json:"token"`
	}

	err := jsonutil.ReadJSON(w, r, &input)
	if err != nil {
		app.BadRequestResponse(w, err)
		return
	}

	tokenSvc := &token.Service{
		Repo: &token.Repository{DB: app.DB},
	}

	s := user.Service{
		Repo:         &user.Repository{DB: app.DB},
		TokenService: tokenSvc,
	}

	v := validator.New()
	if token.ValidateToken(v, input.TokenPlaintext); !v.IsValid() {
		app.FailedValidationResponse(w, v.Errors)
		return
	}

	u, err := s.Activate(input.TokenPlaintext)
	if err != nil {
		switch {
		case errors.Is(err, token.ErrInvaildToken):
			app.BadRequestResponse(w, err)
		default:
			app.ServerError(w, r, err)
		}
		return
	}

	err = jsonutil.WriteJSON(
		w, http.StatusCreated,
		jsonutil.Envelope{
			"message": "account activated successfully",
			"user":    u,
		},
	)
	if err != nil {
		app.ServerError(w, r, err)
	}
}
