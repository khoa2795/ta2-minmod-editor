from __future__ import annotations

import httpx
from fastapi import APIRouter

from minmod_editor.config import URI_MINMOD_APP

router = APIRouter(tags=["mineral_sites"])


@router.get("/mineral-sites/{resource_id}")
def get_mineral_site(resource_id: str):
    url = f"{URI_MINMOD_APP}mineral-sites/{resource_id}"
    resp = httpx.get(url, verify=False).raise_for_status()
    data = resp.json()
    return data


@router.get("/dedup-mineral-sites/{commodity}")
def get_dedup_mineral_sites(commodity: str):
    url = f"{URI_MINMOD_APP}dedup-mineral-sites/{commodity}"
    try:
        response = httpx.get(url, verify=False).raise_for_status()
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
