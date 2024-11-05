from __future__ import annotations

import httpx
from fastapi import APIRouter

router = APIRouter(tags=["mineral_sites"])


@router.get("/mineral-sites/{resource_id}")
def get_mineral_site(resource_id: str):
    url = f"https://minmod.isi.edu/test/api/v1/mineral-sites/{resource_id}"

    resp = httpx.get(url, verify=False)
    resp.raise_for_status()
    data = resp.json()

    # mineral_site = lod_to_mineral_site(data)
    return data
