package app

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/Yusufdot101/goBankBackend/internal/jsonutil"
	"github.com/Yusufdot101/goBankBackend/internal/token"
	"github.com/Yusufdot101/goBankBackend/internal/user"
	"github.com/Yusufdot101/goBankBackend/internal/validator"
)

func (app *Application) GetAuthorizationToken(w http.ResponseWriter, r *http.Request) {
	// the inputs expected from the client
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	err := jsonutil.ReadJSON(w, r, &input)
	if err != nil {
		app.BadRequestResponse(w, err)
		return
	}

	userService := user.Service{Repo: &user.Repository{DB: app.DB}}

	u, err := userService.GetUserByEmail(input.Email)
	if err != nil {
		switch {
		case errors.Is(err, user.ErrNoRecord):
			app.InvalidCredentialsResponse(w)
		default:
			app.ServerError(w, r, err)
		}
		return
	}

	// check if the password matches
	matches, err := u.Password.Matches(input.Password)
	if err != nil {
		app.ServerError(w, r, err)
		return
	}

	if !matches {
		app.InvalidCredentialsResponse(w)
		return
	}

	tokenService := token.Service{Repo: &token.Repository{DB: app.DB}}
	tk, err := tokenService.AuthorizationToken(u.ID)
	if err != nil {
		app.ServerError(w, r, err)
		return
	}

	// cookie := &http.Cookie{
	// 	Name:     "authToken",
	// 	Value:    tk.Plaintext,
	// 	Path:     "/",
	// 	HttpOnly: false,
	// 	Secure:   false,
	// 	SameSite: http.SameSiteNoneMode,
	// 	Expires:  tk.Expiry,
	// }
	// http.SetCookie(w, cookie)

	err = jsonutil.WriteJSON(
		w, http.StatusCreated,
		jsonutil.Envelope{
			"message": "authorization success",
			"token":   tk.Plaintext,
		},
	)
	if err != nil {
		app.ServerError(w, r, err)
	}
}

func (app *Application) DeactivateToken(w http.ResponseWriter, r *http.Request) {
	// cookie, err := r.Cookie("authToken")
	// if err != nil {
	// 	switch {
	// 	case errors.Is(err, http.ErrNoCookie):
	// 		app.RequireAuthorizedUserResponse(w)
	// 	default:
	// 		app.BadRequestResponse(w, err)
	// 	}
	// 	return
	// }
	// tk := cookie.Value
	var input struct {
		TokenPlaintext string `json:"token"`
	}
	err := jsonutil.ReadJSON(w, r, &input)
	if err != nil {
		app.BadRequestResponse(w, err)
		return
	}
	tokenService := &token.Service{
		Repo: &token.Repository{DB: app.DB},
	}
	v := validator.New()
	err = tokenService.DeactivateToken(v, input.TokenPlaintext)
	if err != nil {
		switch {
		case errors.Is(err, validator.ErrFailedValidation):
			app.FailedValidationResponse(w, v.Errors)
		case errors.Is(err, sql.ErrNoRows):
			app.NotFoundResponse(w, r)
		default:
			app.ServerError(w, r, err)
		}
		return
	}
	err = jsonutil.WriteJSON(
		w, http.StatusOK,
		jsonutil.Envelope{
			"message": "token deactivated successfully",
		},
	)
	if err != nil {
		app.ServerError(w, r, err)
	}
}
