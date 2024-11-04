from __future__ import annotations
from typing import Optional, Sequence, TypeVar
from minmodkg.api.models.mineral_site import (
    CandidateExtractedEntity,
    Document,
    LocationInfo,
    MineralSite as KGMineralSite,
    Reference,
)
from pydantic import Field

T = TypeVar("T")

def get_item(obj: Optional[T | Sequence[T]]) -> Optional[T]:
    if obj is None:
        return None
    if isinstance(obj, (list, tuple)): 
        return obj[0]
    return obj

def lod_to_candidate_extracted_entity(obj: dict) -> CandidateExtractedEntity:
        # TODO: undo this!!
    # return CandidateExtractedEntity(
    #     source=obj["source"],
    #     confidence=obj["confidence"],
    #     observed_name=obj.get("observed_name"),
    #     normalized_uri=obj.get("normalized_uri"),
    # )
    _x = get_item(obj.get("normalized_uri"))
    if _x is not None:
        print(f"_x: {_x}, type: {type(_x)}")  

    return CandidateExtractedEntity(
        source=get_item(obj["source"]),
        confidence=float(get_item(obj["confidence"])),
        observed_name=get_item(obj.get("observed_name")),
        normalized_uri=(
            _x["@id"] if isinstance(_x, dict) and "@id" in _x else None
        ),
    )

def lod_to_location_info(obj: dict) -> LocationInfo:
    props = dict()
    if "crs" in obj:
        props["crs"] = lod_to_candidate_extracted_entity(obj["crs"])
    for prop in ["country", "state_or_province"]:
        if prop in obj:
            if isinstance(obj[prop], list):
                props[prop] = [lod_to_candidate_extracted_entity(e) for e in obj[prop]]
            else:
                props[prop] = [lod_to_candidate_extracted_entity(obj[prop])]

    if "location" in obj:
        props["location"] = obj["location"]
    return LocationInfo(**props)

def lod_to_document(obj: dict) -> Document:
    print(">>>", obj)  
    return Document(
        doi=obj.get("doi"),
        uri=obj.get("uri", obj.get("@id")),  
        title=obj.get("title", "Unknown Title")  
    )

def lod_to_reference(obj: dict) -> Reference:
    return Reference(
        document=lod_to_document(obj.get("document", {})), 
        page_info=obj.get("page_info", []), 
        comment=obj.get("comment"),
        property=obj.get("property"),
    )

def get_max_grade_and_tonnes(mineral_inventory: list[dict]) -> tuple[float, float]:
    max_grade = 0.0
    max_tonnes = 0.0
    for item in mineral_inventory:
        if "grade" in item and "value" in item["grade"]:
            max_grade = max(max_grade, item["grade"]["value"])
        if "ore" in item and "value" in item["ore"]:
            max_tonnes = max(max_tonnes, item["ore"]["value"])
    return max_grade, max_tonnes

class MineralSite(KGMineralSite):
    uri: str
    max_grade: Optional[float] = None
    max_tonnes: Optional[float] = None

def lod_to_mineral_site(obj: dict) -> MineralSite:
    location_info = lod_to_location_info(obj.get("location_info", {}))

    if "deposit_type_candidate" in obj:
        if isinstance(obj["deposit_type_candidate"], list):
            deposit_type_candidate = [
                lod_to_candidate_extracted_entity(e)
                for e in obj["deposit_type_candidate"]
            ]
        else:
            deposit_type_candidate = [
                lod_to_candidate_extracted_entity(obj["deposit_type_candidate"])
            ]
    else:
        deposit_type_candidate = []

    if "reference" in obj:
        if isinstance(obj["reference"], list):
            reference = [lod_to_reference(e) for e in obj["reference"]]
        else:
            reference = [lod_to_reference(obj["reference"])]
    else:
        reference = []

    max_grade, max_tonnes = get_max_grade_and_tonnes(obj.get("mineral_inventory", []))

    return MineralSite(
        uri=obj.get("@id", "Unknown URI"), 
        name=obj.get("@label", "Unknown Name"),  
        source_id=obj.get("source_id", "Unknown Source ID"),
        record_id=obj.get("record_id", "Unknown Record ID"),
        modified_at=(
            max(obj["modified_at"]) if isinstance(obj.get("modified_at"), list) else obj.get("modified_at", "Unknown Date")
        ),
        created_by=(
            obj["created_by"][0] if isinstance(obj.get("created_by"), list) else obj.get("created_by", "Unknown Creator")
        ),
        location_info=location_info,
        deposit_type_candidate=deposit_type_candidate,
        reference=reference,
        max_grade=max_grade, 
        max_tonnes=max_tonnes,  
    )
