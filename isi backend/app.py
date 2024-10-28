from fastapi import FastAPI, HTTPException, Response, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional
import requests
import logging
import ast 
# Logging setup
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Secret key for JWT encoding
SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

origins = [
    "http://localhost:3000"  # Replace this with your actual frontend URL
]

app = FastAPI()

# Adding CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Token Response Model
class Token(BaseModel):
    access_token: str
    token_type: str

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
async def login(form_data: OAuth2PasswordRequestForm = Depends(), response: Response = Response()):
    # Authenticate user using an external API
    url = "https://minmod.isi.edu/test/api/v1/login"
    payload = {
        "username": form_data.username,
        "password": form_data.password
    }

    try:
        # Send a request to authenticate the user
        logger.info(f"Sending authentication request to {url} for user: {form_data.username}")
        login_response = requests.post(url, params=payload, verify=False)

        if login_response.status_code == 200 and login_response.json() == "Logged in":
            logger.info(f"User '{form_data.username}' logged in successfully")
            # Generate JWT token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            session_id = login_response.cookies.get("session")
            logger.info(f"PLEASE {session_id}")
            access_token = create_access_token(
                data={"sub": form_data.username, "session_id" :session_id}, expires_delta=access_token_expires
            )

            # Store JWT token in cookie
            response.set_cookie(key="session_id", value=access_token, httponly=True, max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60)

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
            detail="Authentication service unavailable"
        )

# Function to get the current logged-in user using session cookie
# async def get_current_user(request: Request):
    try:
        # Directly call the /whoami endpoint using the session token
        url = "https://minmod.isi.edu/test/api/v1/whoami"
        session_id = request.cookies.get("session_id")

        if not session_id:
            logger.error("No session_id cookie found in request")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No valid session found",
            )

        # Set the Authorization header for the request
        cookie = {
            'session':session_id
        }

        logger.info(f"Sending request to /whoami endpoint: {url} with headers: {cookie}")

        # Send the request to the /whoami endpoint
        response = requests.get(url, cookies=cookie, verify=False)

        logger.info(f"Response from /whoami: Status Code {response.status_code}, Content: {response.text}")

        if response.status_code == 200:
            user_info = response.json()
            logger.info(f"User information retrieved successfully: {user_info}")
            return user_info
        else:
            if response.status_code == 404:
                logger.error("Endpoint not found - please verify the URL and check the server configuration.")
            else:
                logger.error(f"Failed to retrieve user info from /whoami: Status Code {response.status_code}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except requests.exceptions.RequestException as e:
        logger.error(f"Error during user info retrieval: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Service unavailable"
        )

async def get_current_user(request: Request):
    try:
        # Directly call the /whoami endpoint using the session token
        url = "https://minmod.isi.edu/test/api/v1/whoami"
        session_id = request.cookies.get("session_id")
        logger.info(f"session_id token B: {session_id}")

        #decoding 
        payload = jwt.decode(session_id, SECRET_KEY, algorithms=[ALGORITHM])
        logger.info(f"Payload: {payload}")


        #get the dictionary
        session_id_A = payload['session_id']
        logger.info(f"session_id_A: {session_id_A}")
        #

        if not session_id:
            logger.error("No session_id cookie found in request")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No valid session found",
            )

        # Set the Authorization header for the request
        cookies = {
            'session': session_id_A
        }


        # Send the request to the /whoami endpoint
        response = requests.get(url, cookies=cookies, verify=False)

        logger.info(f"Response from /whoami: Status Code {response.status_code}, Content: {response.text}")

        if response.status_code == 200:
            user_info = response.json()
            logger.info(f"User information retrieved successfully: {user_info}")
            return user_info
        else:
            if response.status_code == 404:
                logger.error("Endpoint not found - please verify the URL and check the server configuration.")
            else:
                logger.error(f"Failed to retrieve user info from /whoami: Status Code {response.status_code}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except requests.exceptions.RequestException as e:
        logger.error(f"Error during user info retrieval: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Service unavailable"
        )


# Example route that does not require token validation for /whoami
@app.get("/users/me/")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user.get("username"),
        "name": current_user.get("name"),
        "email": current_user.get("email"),
    }


@app.get("/get_site_data")
def get_site_data():
    url = "https://minmod.isi.edu/resource/site__api-cdr-land-v1-docs-documents__0249cf080edc4c536abfde9e13867b5ee755b880a247857956ddf23b72a44211d4?format=json"
    
    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()
        data = response.json()
        
        # Extract fields from data
        site_name = data.get('@label', '')
        location_info = data.get('location_info', {})
        mineral_inventory = data.get('mineral_inventory', [])
        country_info = location_info.get('country', {}).get('observed_name', 'Unknown')
        state_info = location_info.get('state_or_province', {}).get('observed_name', 'Unknown')
        
        # Prepare processed data list
        processed_data = []
        
        for inventory in mineral_inventory:
            inventory_data = {
                "siteName": site_name,
                "location": f"{country_info}, {state_info}",
                "crs": "N/A",
                "country": country_info,
                "state": state_info,
                "commodity": inventory.get('commodity', {}).get('observed_name', ''),
                "depositType": data.get('deposit type candidate', {}).get('observed_name', ''),
                "depositConfidence": data.get('deposit type candidate', {}).get('confidence', '0.0000'),
                "grade": inventory.get('grade', {}).get('value', '0.00000000'),
                "tonnage": inventory.get('ore', {}).get('value', '0'),
                "reference": inventory.get('reference', {}).get('document', {}).get('title', ''),
                "source": inventory.get('reference', {}).get('document', {}).get('uri', ''),
            }
            processed_data.append(inventory_data)
        
        return {"data": processed_data}
    
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}




@app.get("/get_sites/{commodity}")
def get_sites(commodity: str):
    url = f"https://minmod.isi.edu/api/v1/dedup_mineral_sites/{commodity}"
    
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
            elif location and (location.startswith("MULTIPOINT") or location.startswith("GEOMETRYCOLLECTION")):
                # Fallback to best_loc_centroid_epsg_4326 if available
                coordinates = group.get("best_loc_centroid_epsg_4326", "").strip()
                if not coordinates:
                    coordinates = " "  # Default to empty if both are unavailable
            else:
                coordinates = " "  # Default if location is missing or in an unhandled format

            deposit_type = ""
            deposit_confidence = "0.0000"
            if group.get("deposit_types"):
                deposit_type = group["deposit_types"][0].get("name", "")
                deposit_confidence = f"{group['deposit_types'][0].get('confidence', 0):.4f}"
            
            total_grade = group.get("total_grade")
            total_grade_str = f"{total_grade:.8f}" if total_grade is not None else "0.00000000"
            
            total_tonnage = group.get("total_tonnage")
            total_tonnage_str = f"{total_tonnage}" if total_tonnage is not None else "0"

            all_ms_fields = [site.get("ms", "") for site in group.get("sites", [])]

            site_info = {
                "siteName": first_site.get("ms_name", ""),
                "siteType": first_site.get("ms_type", ""),
                "siteRank": first_site.get("ms_rank", ""),
                "location": coordinates,  # Now includes the full "POINT" string or fallback value
                "crs": group.get("best_loc_crs", ""),
                "country": first_site.get("country", ""),
                "state": first_site.get("state_or_province", ""),
                "depositType": deposit_type,
                "depositConfidence": deposit_confidence,
                "commodity": commodity,  
                "grade": total_grade_str,
                "tonnage": total_tonnage_str,
                "all_ms_fields": all_ms_fields 
            }
            processed_data.append(site_info)
        
        return {"data": processed_data}
    
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}





@app.get("/get_commodities")
def get_commodities():
    url = "https://minmod.isi.edu/api/v1/commodities?is_critical=true"
    
    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()
        commodities = response.json()
        
        # Extract commodity names or IDs if needed
        commodities_list = [commodity.get("name") for commodity in commodities]

        return {"commodities": commodities_list}
    
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}


@app.get("/get_resource/{resource_id}")
def get_resource_details(resource_id: str):
    url = f"https://minmod.isi.edu/resource/{resource_id}?format=json"
    
    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()
        
        content_type = response.headers.get('Content-Type', '')
        if 'application/json' in content_type:
            data = response.json()
            
            site_name = data.get("@label", "")

            # Handle the case where "location info" might be a list or a dictionary
            location_info = data.get("location_info", {})
            location = ""
            crs = "Unknown"
            country = "Unknown"
            state_or_province = "Unknown"

            # Check if location_info is a list or dictionary
            if isinstance(location_info, list):
                if len(location_info) > 0:
                    location = location_info[0].get("location", "")
                    crs = location_info[0].get("crs", {}).get("normalized_uri", {}).get("@label", "Unknown")
                    country = location_info[0].get("country", {}).get("normalized_uri", {}).get("@label", "Unknown")
                    state_or_province = location_info[0].get("state_or_province", {}).get("normalized_uri", {}).get("@label", "Unknown")
            elif isinstance(location_info, dict):
                location = location_info.get("location", "")
                crs = location_info.get("crs", {}).get("normalized_uri", {}).get("@label", "Unknown")
                country = location_info.get("country", {}).get("normalized_uri", {}).get("@label", "Unknown")
                state_or_province = location_info.get("state_or_province", {}).get("normalized_uri", {}).get("@label", "Unknown")

            deposit_type_candidates = data.get("deposit type candidate", [])
            deposit_type = "Unknown"
            deposit_confidence = "0"

            if isinstance(deposit_type_candidates, list) and len(deposit_type_candidates) > 0:
                first_candidate = deposit_type_candidates[0]
                deposit_type = first_candidate.get("observed_name", "Unknown")
                deposit_confidence = first_candidate.get("confidence", "0")

            mineral_inventory_list = data.get("mineral_inventory", [])
            commodity = "Unknown"
            grade = "0.00000000"
            tonnage = "0"
            reference = "Unknown"
            source = "Unknown"

            if mineral_inventory_list and isinstance(mineral_inventory_list, list):
                first_inventory = mineral_inventory_list[0]
                if isinstance(first_inventory, dict):
                    commodity_info = first_inventory.get("commodity", {})
                    commodity = commodity_info.get("normalized_uri", {}).get("@label", "Unknown")
                    grade = first_inventory.get("grade", {}).get("value", "0.00000000")
                    tonnage = first_inventory.get("ore", {}).get("value", "0")
                    reference_info = first_inventory.get("reference", {}).get("document", {})
                    reference = reference_info.get("title", "Unknown")
                    source = reference_info.get("doi", "Unknown")

            resource_details = {
                "siteName": site_name,
                "location": location,  
                "crs": crs,
                "country": country,
                "state_or_province": state_or_province,
                "commodity": commodity,
                "depositType": deposit_type,
                "depositConfidence": deposit_confidence,
                "grade": grade,
                "tonnage": tonnage,
                "reference": reference,
                "source": source
            }
            return {"data": resource_details}
        else:
            return {"error": "Response content is not JSON", "content": response.text[:500]}
    
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}
    
@app.get("/get_deposit_types")
def get_deposit_types():
    url = "https://minmod.isi.edu/api/v1/deposit_types"
    
    try:
        response = requests.get(url, verify=False)  # Set verify=True in production
        response.raise_for_status()

        # Assuming the response is a list of deposit types
        deposit_types = response.json()
        
        # If the response is indeed a list, extract names directly
        deposit_types_list = [deposit_type.get("name") for deposit_type in deposit_types]

        return {"deposit_types": deposit_types_list}
    
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}
