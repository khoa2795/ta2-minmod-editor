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
    resp = httpx.get(url, verify=False).raise_for_status()
    data = resp.json()
    return data
