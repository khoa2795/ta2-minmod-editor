from __future__ import annotations

from typing import Optional, Sequence, TypeVar

from minmodkg.api.models.mineral_site import (
    CandidateExtractedEntity,
    Document,
    LocationInfo,
)
from minmodkg.api.models.mineral_site import MineralSite as KGMineralSite
from minmodkg.api.models.mineral_site import Reference
from pydantic import Field

T = TypeVar("T")


def get_item(obj: Optional[T | Sequence[T]]) -> Optional[T]:
    if obj is None:
        return None
    if isinstance(obj, Sequence):
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

    return CandidateExtractedEntity(
        source=get_item(obj["source"]),
        confidence=float(get_item(obj["confidence"])),
        observed_name=get_item(obj.get("observed_name")),
        normalized_uri=(
            _x["@id"]
            if (_x := get_item(obj.get("normalized_uri"))) is not None
            else None
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
        # TODO: fix me.
        uri=obj.get("uri", obj["@id"]),
        title=obj.get("title"),
    )


def lod_to_reference(obj: dict):
    return Reference(
        document=lod_to_document(obj["document"]),
        # TODO: fix me!! load page info correctly !!!
        page_info=[],
        comment=obj.get("comment"),
        property=obj.get("property"),
    )


class MineralSite(KGMineralSite):
    uri: str


def lod_to_mineral_site(obj: dict) -> MineralSite:
    if "location_info" in obj:
        location_info = lod_to_location_info(obj["location_info"])
    else:
        location_info = None

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

    return MineralSite(
        uri=obj["@id"],
        name=obj.get("@label", ""),
        source_id=obj["source_id"],
        record_id=obj["record_id"],
        # TODO: fix me!! created_by & modified_at can be a list -- fix me please !!!
        modified_at=(
            max(obj["modified_at"])
            if isinstance(obj["modified_at"], list)
            else obj["modified_at"]
        ),
        created_by=(
            obj["created_by"][0]
            if isinstance(obj["created_by"], list)
            else obj["created_by"]
        ),
        location_info=location_info,
        deposit_type_candidate=deposit_type_candidate,
        reference=reference,
    )
