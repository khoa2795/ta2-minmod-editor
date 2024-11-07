import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from .config import URI_MINMOD_APP 
import requests
from fastapi import (
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

from minmod_editor.routers import mineral_site

# Logging setup
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Secret key for JWT encoding
SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()

app.include_router(mineral_site.router)


# JWT Token Response Model
class Token(BaseModel):
    access_token: str
    token_type: str


async def get_minmod_headers(request: Request):
    session_id = request.cookies.get("session") or request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(
            status_code=401, detail="Session token not provided in cookies."
        )

    # Decode session token
    payload = jwt.decode(session_id, SECRET_KEY, algorithms=[ALGORITHM])
    session_id_A = payload.get("session_id")

    # Set up headers and cookie for the outgoing request to the external API
    headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Cookie": f"session={session_id_A}",
    }
    return headers


# Function to create JWT token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Login endpoint to get JWT token
@app.post("/test/api/v1/login", response_model=Token)
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


# Function to get the current logged-in user using session cookie
# async def get_current_user(request: Request):


async def get_current_user(request: Request):
    try:
        # Directly call the /whoami endpoint using the session token
        url = URI_MINMOD_APP+"whoami"
        session_id = request.cookies.get("session_id")
        logger.info(f"session_id token B: {session_id}")

        # decoding
        payload = jwt.decode(session_id, SECRET_KEY, algorithms=[ALGORITHM])
        logger.info(f"Payload: {payload}")

        # get the dictionary
        session_id_A = payload["session_id"]
        logger.info(f"session_id_A: {session_id_A}")
        #

        if not session_id:
            logger.error("No session_id cookie found in request")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No valid session found",
            )

        # Set the Authorization header for the request
        cookies = {"session": session_id_A}

        # Send the request to the /whoami endpoint
        response = requests.get(url, cookies=cookies, verify=False)

        logger.info(
            f"Response from /whoami: Status Code {response.status_code}, Content: {response.text}"
        )

        if response.status_code == 200:
            user_info = response.json()
            logger.info(f"User information retrieved successfully: {user_info}")
            return user_info
        else:
            if response.status_code == 404:
                logger.error(
                    "Endpoint not found - please verify the URL and check the server configuration."
                )
            else:
                logger.error(
                    f"Failed to retrieve user info from /whoami: Status Code {response.status_code}"
                )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except requests.exceptions.RequestException as e:
        logger.error(f"Error during user info retrieval: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Service unavailable",
        )


# Example route that does not require token validation for /whoami
@app.get("/users/me/")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user.get("username"),
        "name": current_user.get("name"),
        "email": current_user.get("email"),
    }


########################## - replace the modal with dictionary


@app.post("/submit_mineral_site")
async def submit_mineral_site(
    mineral_site: dict, minmod_headers: dict = Depends(get_minmod_headers)
):
    # Retrieve the session cookie from the incoming request

    # Make the request to the external API
    response = requests.post(
        uri+"mineral-sites",
        headers=minmod_headers,
        json=mineral_site,
        verify=False,
    )

    # Check if the response was successful
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())

    # Extract the response data
    response_data = response.json()
    status = response_data.get("status")
    uri = response_data.get("uri")

    # Return the status and uri as the response
    return {"status": status, "uri": uri}


################################################################################################


# Models for request body


# Endpoint for updating mineral site
@app.post("/test/api/v1/mineral-sites/{site_id}")
async def update_mineral_site(
    minmod_header: dict = Depends(get_minmod_headers),
    site_id: str = Path(..., description="The ID of the mineral site to update"),
    update_data: dict = Body(..., description="Data for updating the mineral site"),
):
    # Retrieve session ID from cookies

    # Send PUT request to external API
    url = URI_MINMOD_APP+"mineral-sites/{site_id}"
    response = requests.post(url, headers=minmod_header, json=update_data, verify=False)

    # Check response and handle errors if any
    if response.status_code != 200:
        logger.error(f"Failed to update site with ID {site_id}: {response.status_code}")
        raise HTTPException(status_code=response.status_code, detail=response.json())

    # Extract and return response data
    response_data = response.json()
    return {"status": response_data.get("status"), "uri": response_data.get("uri")}





@app.get("/get_sites/{commodity}")
def get_sites(commodity: str):
    url = f"{URI_MINMOD_APP}dedup-mineral-sites/{commodity}"

    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()
        data = response.json()

        processed_data = []

        for group in data:
            first_site = group.get("sites", [{}])[0]
            location = group.get("best_loc_wkt")

            # Handle cases where location is MULTIPOINT or GEOMETRYCOLLECTION
            if location and (location.startswith("POINT")):
                # Keep the POINT keyword intact and clean up extra spaces
                coordinates = location.strip()
            elif location and (
                location.startswith("MULTIPOINT")
                or location.startswith("GEOMETRYCOLLECTION")
            ):
                # Fallback to best_loc_centroid_epsg_4326 if available
                coordinates = group.get("best_loc_centroid_epsg_4326", "").strip()
                if not coordinates:
                    coordinates = " "  # Default to empty if both are unavailable
            else:
                coordinates = (
                    " "  # Default if location is missing or in an unhandled format
                )

            deposit_type = ""
            deposit_confidence = "0.0000"
            if group.get("deposit_types"):
                deposit_type = group["deposit_types"][0].get("name", "")
                deposit_confidence = (
                    f"{group['deposit_types'][0].get('confidence', 0):.4f}"
                )

            total_grade = group.get("total_grade")
            total_grade_str = (
                f"{total_grade:.8f}" if total_grade is not None else "0.00000"
            )

            total_tonnage = group.get("total_tonnage")
            total_tonnage_str = f"{total_tonnage}" if total_tonnage is not None else "0"

            all_ms_fields = [site.get("id", "") for site in group.get("sites", [])]

            site_info = {
                "siteName": first_site.get("name", ""),
                "siteType": first_site.get("type", ""),
                "siteRank": first_site.get("rank", ""),
                "location": coordinates,  # Now includes the full "POINT" string or fallback value
                "crs": group.get("best_loc_crs", ""),
                "country": first_site.get("country", ""),
                "state": first_site.get("state_or_province", ""),
                "depositType": deposit_type,
                "depositConfidence": deposit_confidence,
                "commodity": commodity,
                "grade": total_grade_str,
                "tonnage": total_tonnage_str,
                "all_ms_fields": all_ms_fields,
            }
            processed_data.append(site_info)

        return {"data": processed_data}

    except requests.exceptions.RequestException as e:
        return {"error": str(e)}


@app.get("/get_commodities")
def get_commodities():
    url = f"{URI_MINMOD_APP}commodities?is_critical=true"

    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()
        commodities = response.json()

        # Extract commodity names or IDs if needed
        commodities_list = [commodity.get("name") for commodity in commodities]

        return {"commodities": commodities_list}

    except requests.exceptions.RequestException as e:
        return {"error": str(e)}


@app.get("/get_deposit_types")
def get_deposit_types():
    url = URI_MINMOD_APP+"deposit-types"

    try:
        response = requests.get(url, verify=False)  # Set verify=True in production
        response.raise_for_status()

        # Assuming the response is a list of deposit types
        deposit_types = response.json()

        # If the response is indeed a list, extract names directly
        deposit_types_list = [
            deposit_type.get("name") for deposit_type in deposit_types
        ]

        return {"deposit_types": deposit_types_list}

    except requests.exceptions.RequestException as e:
        return {"error": str(e)}
