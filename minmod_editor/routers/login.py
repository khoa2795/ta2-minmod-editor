from __future__ import annotations

import logging
from datetime import timedelta

import httpx
import requests
from fastapi import (
    APIRouter,
    Body,
    Cookie,
    Depends,
    FastAPI,
    HTTPException,
    Path,
    Request,
    Response,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from pydantic import BaseModel, validator

from minmod_editor.config import URI_MINMOD_APP

router = APIRouter(tags=["mineral_sites"])

# Logging setup
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Secret key for JWT encoding
SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300


# JWT Token Response Model
class Token(BaseModel):
    access_token: str
    token_type: str


class LoginInfo(BaseModel):
    username: str
    password: str


# Login endpoint to get JWT token
@router.post("/api/v1/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), response: Response = Response()
):
    # Authenticate user using an external API
    url = f"{URI_MINMOD_APP}login"
    payload = {"username": form_data.username, "password": form_data.password}

    try:
        # Send a request to authenticate the user
        logger.info(
            f"Sending authentication request to {url} for user: {form_data.username}"
        )
        login_response = requests.post(url, json=payload, verify=False)

        if login_response.status_code == 200 and login_response.json() == "Logged in":
            logger.info(f"User '{form_data.username}' logged in successfully")
            # Generate JWT token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            session_id = login_response.cookies.get("session")
            logger.info(f"PLEASE {session_id}")
            access_token = create_access_token(
                data={"sub": form_data.username, "session_id": session_id},
                expires_delta=access_token_expires,
            )

            # Store JWT token in cookie
            response.set_cookie(
                key="session_id",
                value=access_token,
                httponly=True,
                max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            )

            logger.error(f"Access Token: {access_token}")
            return {"access_token": access_token, "token_type": "bearer"}
        else:
            logger.error(f"Authentication failed for user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
            )
    except requests.exceptions.RequestException as e:
        logger.error(f"Error during login request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service unavailable",
        )
