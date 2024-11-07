from __future__ import annotations

import httpx
from fastapi import APIRouter

router = APIRouter(tags=["mineral_sites"])
uri = "https://dev.minmod.isi.edu/api/v1/"

@router.get("/mineral-sites/{resource_id}")
def get_mineral_site(resource_id: str):
    print("resource_id",resource_id)
    url = f"{uri}mineral-sites/{resource_id}"

    resp = httpx.get(url, verify=False)
    resp.raise_for_status()
    data = resp.json()
    print("data",data)
    # mineral_site = lod_to_mineral_site(data)
    return data
