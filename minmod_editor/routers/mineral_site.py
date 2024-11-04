from __future__ import annotations

import httpx
from fastapi import APIRouter

from minmod_editor.models.mineral_site import lod_to_mineral_site

router = APIRouter(tags=["mineral_sites"])


@router.get("/get_resource/{resource_id}")
def get_resource_details(resource_id: str):
    url = f"https://minmod.isi.edu/test/api/v1/mineral-sites/{resource_id}?format=json"

    resp = httpx.get(url, verify=False)
    resp.raise_for_status()
    data = resp.json()

    mineral_site = lod_to_mineral_site(data)
    return mineral_site
