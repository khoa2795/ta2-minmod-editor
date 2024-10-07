from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/get_site_data")
def get_site_data():
    url = "https://minmod.isi.edu/resource/site__api-cdr-land-v1-docs-documents__0249cf080edc4c536abfde9e13867b5ee755b880a247857956ddf23b72a44211d4?format=json"
    
    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()
        data = response.json()
        
        # Extract fields from data
        site_name = data.get('@label', '')
        location_info = data.get('location info', {})
        mineral_inventory = data.get('mineral inventory', [])
        country_info = location_info.get('country', {}).get('observed name', 'Unknown')
        state_info = location_info.get('state or province', {}).get('observed name', 'Unknown')
        
        # Prepare processed data list
        processed_data = []
        
        for inventory in mineral_inventory:
            inventory_data = {
                "siteName": site_name,
                "location": f"{country_info}, {state_info}",
                "crs": "N/A",
                "country": country_info,
                "state": state_info,
                "commodity": inventory.get('commodity', {}).get('observed name', ''),
                "depositType": data.get('deposit type candidate', {}).get('observed name', ''),
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
            
            if location:
                # Keep the POINT keyword intact and clean up extra spaces
                coordinates = location.strip()
            else:
                coordinates = "POINT(0 0)"  # Default to "POINT(0 0)" if location is missing

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
                "location": coordinates,  # Now includes the full "POINT" string
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
    url = "https://minmod.isi.edu/api/v1/commodities"
    
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
            
            location = data.get("location info", {}).get("location", "")
            
            crs = data.get("location info", {}).get("crs", {}).get("normalized uri", {}).get("@label", "Unknown")
            
            location_info = data.get("location info", {})
            country = location_info.get("country", {}).get("normalized uri", {}).get("@label", "Unknown")
            state_or_province = location_info.get("state or province", {}).get("normalized uri", {}).get("@label", "Unknown")
            
            deposit_type_candidates = data.get("deposit type candidate", [])
            deposit_type = "Unknown"
            deposit_confidence = "0"

            if isinstance(deposit_type_candidates, list) and len(deposit_type_candidates) > 0:
                first_candidate = deposit_type_candidates[0]
                deposit_type = first_candidate.get("observed name", "Unknown")
                deposit_confidence = first_candidate.get("confidence", "0")

            mineral_inventory_list = data.get("mineral inventory", [])
            commodity = "Unknown"
            grade = "0.00000000"
            tonnage = "0"
            reference = "Unknown"
            source = "Unknown"

            if mineral_inventory_list and isinstance(mineral_inventory_list, list):
                first_inventory = mineral_inventory_list[0]
                if isinstance(first_inventory, dict):
                    commodity_info = first_inventory.get("commodity", {})
                    commodity = commodity_info.get("normalized uri", {}).get("@label", "Unknown")
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
